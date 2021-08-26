import { dirname } from 'path'

import { calcHash } from '@dr-js/core/module/node/data/Buffer.js'
import { readBuffer, writeText } from '@dr-js/core/module/node/fs/File.js'
import { createDirectory } from '@dr-js/core/module/node/fs/Directory.js'
import {
  getChecksumInfoOfFile,
  getChecksumInfoListOfPath,
  getChecksumInfoListOfPathList,
  describeChecksumInfoList,
  describeChecksumOfPathList
} from '@dr-js/core/module/node/fs/Checksum.js'

import { packTime, parseTime, loadStat, saveStat } from './function.js'

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
  await writeText(config.pathChecksumFile, checksumString)

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
  const checksumHash = calcHash(await readBuffer(config.pathChecksumFile), 'sha256')

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

/** @deprecated */ const getChecksumInfoOfFileExport = getChecksumInfoOfFile // TODO: DEPRECATE
/** @deprecated */ const getChecksumInfoListOfPathExport = getChecksumInfoListOfPath // TODO: DEPRECATE
/** @deprecated */ const getChecksumInfoListOfPathListExport = getChecksumInfoListOfPathList // TODO: DEPRECATE
/** @deprecated */ const describeChecksumInfoListExport = describeChecksumInfoList // TODO: DEPRECATE
/** @deprecated */ const describeChecksumOfPathListExport = describeChecksumOfPathList // TODO: DEPRECATE

export {
  loadStatFile, saveStatFile,
  checksumUpdate, checksumDetectChange,
  getChecksumInfoOfFileExport as getChecksumInfoOfFile, // TODO: DEPRECATE
  getChecksumInfoListOfPathExport as getChecksumInfoListOfPath, // TODO: DEPRECATE
  getChecksumInfoListOfPathListExport as getChecksumInfoListOfPathList, // TODO: DEPRECATE
  describeChecksumInfoListExport as describeChecksumInfoList, // TODO: DEPRECATE
  describeChecksumOfPathListExport as describeChecksumOfPathList // TODO: DEPRECATE
}
