import { resolve, basename } from 'node:path'
import { STAT_ERROR, getPathLstat } from '@dr-js/core/module/node/fs/Path.js'
import { editTextSync, readJSONSync, writeJSONPrettySync } from '@dr-js/core/module/node/fs/File.js'
import { getFileList } from '@dr-js/core/module/node/fs/Directory.js'
import { modifyCopy, modifyDeleteForce } from '@dr-js/core/module/node/fs/Modify.js'

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

const loadAndCopyPackExportInitJSON = async ({
  pathPackage,
  pathOutput,
  isReset = false
}) => {
  const fromPackExport = getFromPackExport(pathPackage)
  const initPairList = readJSONSync(fromPackExport(NAME_PACK_EXPORT_INIT_JSON)) // get init list

  if (!isReset) { // check if file overwrite will happen
    for (const [ , relativeInitPath ] of initPairList) {
      if (STAT_ERROR !== await getPathLstat(resolve(pathOutput, relativeInitPath))) throw new Error(`quit reset existing file: ${relativeInitPath}`)
    }
  }

  for (const [ sourceName, relativeInitPath ] of initPairList) { // put/reset file to output path
    const sourcePath = fromPackExport(sourceName)
    const initPath = resolve(pathOutput, relativeInitPath)
    await modifyDeleteForce(initPath)
    await modifyCopy(sourcePath, initPath)
    // update file content
    REGEXP_TEXT_FILE.test(relativeInitPath) && editTextSync(
      (string) => string
        .replace(/{FLAVOR}/g, /@dr-js[/\\]dev-([\w-]+)$/.exec(pathPackage)[ 1 ])
        .replace(/{FLAVOR-VERSION}/g, readJSONSync(resolve(pathPackage, 'package.json')).version)
      , initPath
    )
    console.log(`[init] file: ${relativeInitPath}`)
  }
}
const REGEXP_TEXT_FILE = /\.(js|json|md|ya?ml|gitignore)$/

export {
  patchModulePath,

  getFromPackExport,
  writePackExportInitJSON,
  loadAndCopyPackExportInitJSON
}
