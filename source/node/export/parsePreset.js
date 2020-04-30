import { getDirInfoTree, walkDirInfoTreeAsync } from '@dr-js/core/module/node/file/Directory'
import { FILTER_SOURCE_PATH } from '../preset'
import { createExportParser } from './parse'

const collectSourceJsRouteMap = async ({
  pathRootList = [],
  pathInfoFilter = (info) => FILTER_SOURCE_PATH(info.path), // return true to keep
  logger
}) => {
  const { parseExport, getSourceRouteMap } = createExportParser({ logger })
  const parseWalkExport = async (dirInfo) => { pathInfoFilter(dirInfo) && await parseExport(dirInfo.path) }
  for (const pathRoot of pathRootList) await walkDirInfoTreeAsync(await getDirInfoTree(pathRoot), parseWalkExport)
  return getSourceRouteMap()
}

export { collectSourceJsRouteMap }
