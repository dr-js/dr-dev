import { dirname } from 'path'
import { promises as fsAsync } from 'fs'
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
  config.rawStat = JSON.parse(String(await fsAsync.readFile(config.pathStatFile).catch(() => null))) || {}
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
  await fsAsync.writeFile(config.pathStatFile, JSON.stringify(config.rawStat, null, 2))
}

export {
  packTime, parseTime,
  loadStat, saveStat
}
