import { dirname } from 'node:path'
import { withFallbackResultAsync } from '@dr-js/core/module/common/error.js'
import { readJSON, writeJSONPretty } from '@dr-js/core/module/node/fs/File.js'
import { createDirectory } from '@dr-js/core/module/node/fs/Directory.js'

const packTime = (timeDate) => timeDate === undefined ? '' : timeDate.toISOString()
const parseTime = (timeString) => !timeString ? undefined : new Date(timeString)

const loadStat = async (
  config,
  statKey,
  parseStat
) => {
  // do not change original
  config = { ...config }

  // load rawStat
  config.rawStat = await withFallbackResultAsync({}, readJSON, config.pathStatFile)
  if (!config.rawStat[ statKey ]) config.rawStat[ statKey ] = {}

  // parse rawStat
  config.stat = parseStat(config.rawStat[ statKey ])

  return config
}

const saveStat = async (
  config,
  statKey,
  packStat
) => {
  // update rawStat
  config.rawStat[ statKey ] = packStat(config.stat)

  // write out
  await createDirectory(dirname(config.pathStatFile))
  await writeJSONPretty(config.pathStatFile, config.rawStat)
}

export {
  packTime, parseTime,
  loadStat, saveStat
}
