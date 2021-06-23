import { sep } from 'path'
import { readFileSync } from 'fs'
import { parse as parseAST } from '@babel/parser'
import { compareString } from '@dr-js/core/module/common/compare.js'
import { objectSortKey } from '@dr-js/core/module/common/mutable/Object.js'
import { getPathStat, getPathTypeFromStat } from '@dr-js/core/module/node/file/Path.js'

const getExportListFromParsedAST = (fileString, sourceFilename, parserPluginList) => {
  const resultAST = parseAST(fileString, {
    sourceFilename,
    sourceType: 'module',
    plugins: parserPluginList || [
      'objectRestSpread',
      'classProperties',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'jsx'
    ]
  })
  const exportNodeList = resultAST.program.body.filter(({ type }) => type === 'ExportNamedDeclaration')
  return [].concat(...exportNodeList.map(({ specifiers, declaration }) => !declaration ? specifiers.map(({ exported: { name } }) => name)
    : declaration.declarations ? declaration.declarations.map(({ id: { name } }) => name)
      : [ declaration.id.name ]
  ))
}

const sortSourceRouteMap = (sourceRouteMap) => {
  Object.values(sourceRouteMap).forEach(({ routeList, directoryList, fileList }) => {
    directoryList.sort(compareString)
    fileList.sort(({ name: a }, { name: b }) => compareString(a, b))
    fileList.forEach(({ exportList }) => exportList.sort(compareString))
  })
  objectSortKey(sourceRouteMap)
  return sourceRouteMap
}

const createExportParser = ({ parserPluginList, logger }) => {
  let sourceRouteMap = {
    // 'source/route': {
    //   routeList: [ 'source' ],
    //   directoryList: [ /* name */ ],
    //   fileList: [ /* { name, exportList: [ name ] } */ ]
    // }
  }

  const getRoute = (routeList) => {
    const key = routeList.join('/')
    if (!sourceRouteMap[ key ]) sourceRouteMap[ key ] = { routeList, directoryList: [], fileList: [] }
    return sourceRouteMap[ key ]
  }

  const parseExport = async (path) => {
    const fileStat = await getPathStat(path)
    const routeList = path.split(sep)
    const name = routeList.pop()

    if (fileStat.isDirectory()) {
      logger.devLog(`[directory] ${path}`)
      getRoute(routeList).directoryList.push(name)
    } else if (fileStat.isFile() && name.endsWith('.js')) {
      const fileString = String(readFileSync(path))
      const exportList = getExportListFromParsedAST(fileString, path, parserPluginList)

      logger.devLog(`[file] ${path}`)
      if (!exportList.length) return

      getRoute(routeList).fileList.push({ name: name.slice(0, -3), exportList }) // remove `.js` from name
      logger.devLog(`  export [${exportList.length}]: ${exportList.join(', ')}`)
    } else logger.devLog(`[skipped] ${path} (${getPathTypeFromStat(fileStat)})`)
  }

  return {
    parseExport,
    getSourceRouteMap: () => {
      const result = sortSourceRouteMap(sourceRouteMap)
      sourceRouteMap = {}
      return result
    }
  }
}

export { createExportParser }
