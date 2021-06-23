import { resolve, relative, dirname } from 'path'
import { createReadStream, promises as fsAsync } from 'fs'
import { createHash } from 'crypto'

import { compareString } from '@dr-js/core/module/common/compare.js'
import { createAsyncLane, extendAutoSelectLane } from '@dr-js/core/module/common/module/AsyncLane.js'

import { calcHash } from '@dr-js/core/module/node/data/Buffer.js'
import { setupStreamPipe, readableStreamToBufferAsync } from '@dr-js/core/module/node/data/Stream.js'
import { PATH_TYPE, getPathStat, getPathTypeFromStat } from '@dr-js/core/module/node/file/Path.js'
import { getDirInfoTree, walkDirInfoTreeAsync, createDirectory } from '@dr-js/core/module/node/file/Directory.js'

import { packTime, parseTime, loadStat, saveStat } from './function.js'

const getChecksumInfoOfFile = async (
  absolutePath, // absolute path of file
  fromPath // path will relative to this in output file
) => [ // [ 'relative/path', 'hash-bash64' ]
  relative(fromPath, absolutePath),
  (await readableStreamToBufferAsync(setupStreamPipe(
    createReadStream(absolutePath),
    createHash('sha1')
  ))).toString('base64')
]

const getChecksumInfoListOfPath = async (
  path = '.', // relative or absolute path
  fromPath = process.cwd(), // path will relative to this in output file
  checksumInfoList = []
) => {
  path = resolve(fromPath, path) // to absolute path
  const collector = async (filePath) => { checksumInfoList.push(await getChecksumInfoOfFile(filePath, fromPath)) }
  const pathType = getPathTypeFromStat(await getPathStat(path))
  switch (pathType) {
    case PATH_TYPE.File:
      await collector(path)
      break
    case PATH_TYPE.Directory: {
      const { getTailPromise, pushAuto } = extendAutoSelectLane(createAsyncLane({ laneSize: 4 })) // NOTE: too much or too lane will actually be slower
      await walkDirInfoTreeAsync(await getDirInfoTree(path), async (dirInfo) => {
        dirInfo.type === PATH_TYPE.File && pushAuto(() => collector(dirInfo.path))
      })
      await getTailPromise()
      break
    }
    default:
      throw new Error(`invalid pathType: ${pathType} for ${path}`)
  }
  return checksumInfoList
}

const getChecksumInfoListOfPathList = async (
  pathList = [], // relative or absolute path
  fromPath = process.cwd(), // path will relative to this in output file
  checksumInfoList = []
) => {
  for (const path of pathList) await getChecksumInfoListOfPath(path, fromPath, checksumInfoList)
  return checksumInfoList
}

const describeChecksumInfoList = (checksumInfoList) => checksumInfoList
  .sort(([ a ], [ b ]) => compareString(a, b))// sort by relativePath so the order is stable
  .map(([ relativePath, hashBase64 ]) => `${hashBase64} ${relativePath}`) // hash first seems better
  .join('\n')

const describeChecksumOfPathList = async ({
  pathList = [], // relative or absolute path
  fromPath = process.cwd() // path will relative to this in output file
}) => describeChecksumInfoList(await getChecksumInfoListOfPathList(pathList, fromPath))

__DEV__ && console.log({
  SAMPLE_CHECKSUM_CONFIG: {
    pathStatFile: '/absolute/path/to/stat-file', // path of stat file, used to help detect checksum change
    pathChecksumList: [ '/absolute/path/to/file/or/directory' ], // list of file or directory to calc checksum
    pathChecksumFile: '/absolute/path/to/file' // path for generated checksum file
  }
})
const STAT_KEY = 'checksum'
const loadStatFile = async (config) => loadStat(config, STAT_KEY, (rawStat) => ({
  timeUpdate: parseTime(rawStat[ 'time-update' ]),
  checksumHash: rawStat[ 'checksum-hash' ],
  checksumHashPrev: undefined // drop prev
}))
const saveStatFile = async (config) => saveStat(config, STAT_KEY, (stat) => ({
  'time-update': packTime(stat.timeUpdate),
  'checksum-hash': stat.checksumHash,
  'checksum-hash-prev': stat.checksumHashPrev
}))

const checksumUpdate = async (config, isChecksumFileOnly = false) => { // set isChecksumFileOnly to only write the checksum file
  // load stat
  if (!isChecksumFileOnly) config = await loadStatFile(config)

  // save checksum file
  const checksumString = await describeChecksumOfPathList({ pathList: config.pathChecksumList })
  await createDirectory(dirname(config.pathChecksumFile))
  await fsAsync.writeFile(config.pathChecksumFile, checksumString)

  // detect hash change, but do not update
  const checksumHash = calcHash(checksumString, 'sha256')
  const isHashChanged = isChecksumFileOnly ? undefined // not checking since no stat is loaded
    : Boolean(config.stat.checksumHash && (config.stat.checksumHash !== checksumHash))

  // save back
  !isChecksumFileOnly && await saveStatFile(config)

  return { checksumHash, isHashChanged }
}

const checksumDetectChange = async (config, isSkipSave = false) => { // set isSkipSave to allow repeatedly check hash change
  // load stat
  config = await loadStatFile(config)

  // load checksum file & calc hash
  const checksumHash = calcHash(await fsAsync.readFile(config.pathChecksumFile), 'sha256')

  // detect hash change
  const isHashChanged = Boolean(config.stat.checksumHash && (config.stat.checksumHash !== checksumHash))
  if (isHashChanged) config.stat.checksumHashPrev = config.stat.checksumHash
  config.stat.checksumHash = checksumHash
  config.stat.timeUpdate = new Date()

  // save back
  !isSkipSave && await saveStatFile(config)

  return {
    checksumHash,
    isHashChanged // meaning cache will update, time to trim cache
  }
}

export {
  getChecksumInfoOfFile,
  getChecksumInfoListOfPath,
  getChecksumInfoListOfPathList,

  describeChecksumInfoList,
  describeChecksumOfPathList,

  loadStatFile, saveStatFile,
  checksumUpdate, checksumDetectChange
}
