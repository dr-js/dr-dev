import { getDirectoryInfoTree, walkDirectoryInfoTree } from '@dr-js/core/module/node/file/Directory'
import { FILTER_SOURCE_PATH } from '../preset'
import { createExportParser } from './parse'

const collectSourceJsRouteMap = async ({
  pathRootList = [],
  pathInfoFilter = (info) => FILTER_SOURCE_PATH(info.path), // return true to keep
  logger
}) => {
  const { parseExport, getSourceRouteMap } = createExportParser({ logger })
  const parseWalkExport = (info) => pathInfoFilter(info) && parseExport(info.path)
  for (const pathRoot of pathRootList) await walkDirectoryInfoTree(await getDirectoryInfoTree(pathRoot), parseWalkExport)
  return getSourceRouteMap()
}

export { collectSourceJsRouteMap }
