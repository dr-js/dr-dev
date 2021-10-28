import { getDirInfoTree, walkDirInfoTree } from '@dr-js/core/module/node/fs/Directory.js'
import { FILTER_SOURCE_PATH } from '../preset.js'
import { createExportParser } from './parse.js'

const collectSourceJsRouteMap = async ({
  pathRootList = [],
  pathInfoFilter = (info) => FILTER_SOURCE_PATH(info.path), // return true to keep
  logger, kit, kitLogger = kit || logger // TODO: DEPRECATE: use 'kit' instead of 'logger'
}) => {
  const { parseExport, getSourceRouteMap } = createExportParser({ logger, kit, kitLogger })
  const parseWalkExport = async (dirInfo) => { pathInfoFilter(dirInfo) && await parseExport(dirInfo.path) }
  for (const pathRoot of pathRootList) await walkDirInfoTree(await getDirInfoTree(pathRoot), parseWalkExport)
  return getSourceRouteMap()
}

export { collectSourceJsRouteMap }
