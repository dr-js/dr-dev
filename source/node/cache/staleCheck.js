import { dirname } from 'path'
import { promises as fsAsync } from 'fs'
import { binary } from '@dr-js/core/module/common/format'
import { createAsyncLane, extendAutoSelectLane } from '@dr-js/core/module/common/module/AsyncLane'

import { PATH_TYPE, getPathStat, getPathTypeFromStat } from '@dr-js/core/module/node/file/Path'
import { getDirInfoTree, walkDirInfoTreeAsync, createDirectory } from '@dr-js/core/module/node/file/Directory'

import { packTime, parseTime, loadStat, saveStat } from './function'

// The stale checker will check:
// - `birthtime`: create time, do not restore by `tar`, so just restored cache should have `mtime` older than `birthtime`
// - `mtime`: write time, should restore by `tar`
// - `atime`: read time, do not restore by `tar`, some fs do not track this well, or update this on write
//
// Perform check in 3 step:
// - before restore cache
//   - tag `time-setup`
// - restore cache
// - before build with cache
//   - tag `time-mark`
// - build with cache
// - before cache save
//   - tag `time-report` and calc report
// - do cache trim by the report
// - save cache
//
// The worst case:
//   atime/mtime/birthtime all between `time-setup` and `time-mark`,
//   or the fs may be broken and `tar` is not work fully

__DEV__ && console.log({
  SAMPLE_STALE_CHECK_CONFIG: {
    pathStatFile: '/absolute/path/to/stat-file', // path of stat file, used to help compare stale time
    pathStaleCheckList: [ '/absolute/path/to/file/or/directory' ], // list of absolute path to cache file or directory to check time
    pathStaleCheckFile: '/absolute/path/to/file', // path for generated stale-check report file
    maxStaleDay: 8 // how old unused file is stale, default: 8day
  }
})

const STAT_KEY = 'stale-check'
const loadStatFile = async (config) => loadStat(config, STAT_KEY, (rawStat) => ({
  timeSetupFirst: parseTime(rawStat[ 'time-setup-first' ]),
  timeSetup: parseTime(rawStat[ 'time-setup' ]),
  timeMark: parseTime(rawStat[ 'time-mark' ]),
  timeReport: parseTime(rawStat[ 'time-report' ])
}))
const saveStatFile = async (config) => saveStat(config, STAT_KEY, (stat) => ({
  'time-setup-first': packTime(stat.timeSetupFirst),
  'time-setup': packTime(stat.timeSetup),
  'time-mark': packTime(stat.timeMark),
  'time-report': packTime(stat.timeReport)
}))

const staleCheckSetup = async (config) => {
  // load stat
  config = await loadStatFile(config)

  // verify
  if (!config.stat) throw new Error('expect stat')

  // update time
  if (!config.stat.timeSetupFirst) config.stat.timeSetupFirst = new Date() // first setup, create timeSetupFirst
  config.stat.timeSetup = new Date()

  // save back
  await saveStatFile(config)
}

const staleCheckMark = async (config) => {
  // load stat
  config = await loadStatFile(config)

  // verify
  if (!config.stat) throw new Error('expect stat')
  if (config.stat.timeSetup === undefined) throw new Error('expect stat.timeSetup')

  // update time
  config.stat.timeMark = new Date()

  // save back
  await saveStatFile(config)
}

const staleCheckCalcReport = async (
  config,
  report = { // all item in list is `absolutePath` of file
    staleSize: 0, staleList: [], // write & read before mark-stale, can delete to free space
    pendSize: 0, pendList: [], // write & read between mark-stale & setup, can delete to free space
    bugSize: 0, bugList: [], // create & write & read between setup & mark, should not have cache file in here, or cache unpack fail to preserve `mtime`, or fs failed to update the `atime` for all files
    readSize: 0, readList: [], // write before mark, read after mark
    writeSize: 0, writeList: [], // create before mark, write after mark
    createSize: 0, createList: [] // create & write & read after mark
  }
) => {
  // load stat
  config = await loadStatFile(config)

  // verify
  if (!config.stat) throw new Error('expect stat')
  if (config.stat.timeSetup === undefined) throw new Error('expect stat.timeSetup')
  if (config.stat.timeMark === undefined) throw new Error('expect stat.timeMark')

  // update time
  config.stat.timeReport = new Date()

  // save back
  await saveStatFile(config)

  // calc report
  config.stat.timeMarkStale = new Date(config.stat.timeMark - config.maxStaleDay * 24 * 60 * 60 * 1000) // temp value
  for (const path of config.pathStaleCheckList) await calcStaleReportOfPath(path, config.stat, report)
  config.stat.timeMarkStale = undefined

  // save report if needed
  if (config.pathStaleCheckFile) {
    await createDirectory(dirname(config.pathStaleCheckFile))
    await fsAsync.writeFile(config.pathStaleCheckFile, JSON.stringify(report, null, 2))
  }

  return { report }
}

const describeStaleReport = (report) => [
  report.staleSize && `- stale:  ${binary(report.staleSize)}B/#${report.staleList.length}`,
  report.pendSize && `- pend:   ${binary(report.pendSize)}B/#${report.pendList.length}`,
  report.bugSize && `- bug:    ${binary(report.bugSize)}B/#${report.bugList.length}`,
  report.readSize && `- read:   ${binary(report.readSize)}B/#${report.readList.length}`,
  report.writeSize && `- write:  ${binary(report.writeSize)}B/#${report.writeList.length}`,
  report.createSize && `- create: ${binary(report.createSize)}B/#${report.createList.length}`
].filter(Boolean).join('\n')

// TODO: NOTE:
//   on linux ext4: `atime` change on READ, `mtime/ctime` change on WRITE
//   on macos: `atime` change on READ, `mtime/ctime` change on WRITE
//   on win32 NTFS: `atime` change on READ, `atime/mtime/ctime` change on WRITE
//   on GitHub Action win32: NOTHING change on READ, `atime/mtime/ctime` change on WRITE
const calcStaleReportOfFile = async (
  absolutePath, // absolute path of file
  stat,
  report
) => {
  const { size, atime, mtime, birthtime } = await getPathStat(absolutePath)
  if (birthtime > stat.timeMark) {
    report.createSize += size
    report.createList.push(absolutePath)
  } else if (mtime > stat.timeMark) {
    report.writeSize += size
    report.writeList.push(absolutePath)
  } else if (atime > stat.timeMark) {
    report.readSize += size
    report.readList.push(absolutePath)
  } else { // possible stale cache, or fs `atime` do not work, check `mtime` only
    if (mtime > stat.timeSetup) {
      report.bugSize += size
      report.bugList.push(absolutePath)
    } else if (mtime > stat.timeMarkStale) {
      report.pendSize += size
      report.pendList.push(absolutePath)
    } else {
      report.staleSize += size
      report.staleList.push(absolutePath)
    }
  }
}

const calcStaleReportOfPath = async (
  absolutePath, // absolute path
  stat,
  report
) => {
  const collector = async (filePath) => calcStaleReportOfFile(filePath, stat, report)
  const pathType = getPathTypeFromStat(await getPathStat(absolutePath))
  switch (pathType) {
    case PATH_TYPE.File:
      await collector(absolutePath)
      break
    case PATH_TYPE.Directory: {
      const { getTailPromise, pushAuto } = extendAutoSelectLane(createAsyncLane({ laneSize: 4 })) // NOTE: too much or too lane will actually be slower
      await walkDirInfoTreeAsync(await getDirInfoTree(absolutePath), async (dirInfo) => {
        dirInfo.type === PATH_TYPE.File && pushAuto(() => collector(dirInfo.path))
      })
      await getTailPromise()
      break
    }
    // allow missing file // TODO: maybe it's better to force the cache path exist to prevent noop cache config?
    // default:
    //   throw new Error(`invalid pathType: ${pathType} for ${absolutePath}`)
  }
}

export {
  loadStatFile, saveStatFile,
  staleCheckSetup, staleCheckMark, staleCheckCalcReport,
  describeStaleReport
}
