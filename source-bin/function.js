import { resolve, basename } from 'node:path'
import { writeJSONPrettySync } from '@dr-js/core/module/node/fs/File.js'
import { getFileList } from '@dr-js/core/module/node/fs/Directory.js'

import { modulePathHack } from '@dr-js/core/bin/function.js'

// HACK: add `@dr-js/dev` to internal `modulePaths` to allow require
//   `.../npm/node_modules/@dr-js/*/bin/function.js` + `../../../../` = `.../npm/node_modules/` // allow this and related module to resolve
//   `.../.npm/_npx/####/lib/node_modules/@dr-js/*/bin/function.js` + `../../../../` = `.../.npm/_npx/####/lib/node_modules/` // allow this and related module to resolve
const patchModulePath = () => modulePathHack(resolve(module.filename, '../../../../'))

const NAME_PACK_EXPORT = 'EXPORT'
const NAME_PACK_EXPORT_INIT_JSON = 'INIT.json'

const getFromPackExport = (pathPackage) => (...args) => resolve(pathPackage, NAME_PACK_EXPORT, ...args)

const writePackExportInitJSON = async ({
  pathPackage,
  fromPackExport = getFromPackExport(pathPackage)
}) => {
  const initFilePrefix = fromPackExport('INIT#')
  writeJSONPrettySync(
    fromPackExport(NAME_PACK_EXPORT_INIT_JSON),
    (await getFileList(fromPackExport()))
      .filter((path) => path.startsWith(initFilePrefix))
      .map((path) => [
        basename(path), // relative source
        path.slice(initFilePrefix.length).replace(/#/g, '/') // relative output
      ])
  )
}

export {
  patchModulePath,

  getFromPackExport,
  writePackExportInitJSON
}
