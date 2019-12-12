import { resolve } from 'path'
import { readFileSync } from 'fs'

import { catchAsync } from '@dr-js/core/module/common/error'
import { escapeRegExp } from '@dr-js/core/module/common/string'
import { getFileList } from '@dr-js/core/module/node/file/Directory'

import { findPathFragList } from '@dr-js/dev/module/node/file'

import { loadAndCopyPackExportInitJSON } from '../function'

const doInit = async ({
  pathOutput,
  pathResourcePackage,
  isReset = false,
  isVerify = false
}) => {
  const pathPackage = ( // find resource package pack export
    await findPathFragList(pathResourcePackage, [ 'node_modules', '@dr-js', /^dev-[\w-]+/ ]) ||
    await findPathFragList(pathResourcePackage, [ '@dr-js', /^dev-[\w-]+/ ]) ||
    pathResourcePackage
  )
  console.log(`[init] pathPackage: ${pathPackage}`)

  if (isVerify) return initVerify(pathOutput)

  await loadAndCopyPackExportInitJSON(pathPackage, pathOutput, isReset)
}

const VERIFY_RULE_LIST = [ {
  message: 'use `extraPresetList/extraPluginList` instead of `presetExtra/pluginExtra` for `getBabelConfig/getWebpackBabelConfig`, break change in `dr-dev@0.0.6-dev.1`',
  selectPathList: [ 'babel.config.js', 'script/' ],
  selectFileExtension: '.js',
  verifyPreNoList: [ 'getBabelConfig', 'getWebpackBabelConfig' ],
  verifyNoList: [ 'extraPresetList', 'extraPluginList' ]
}, {
  message: 'use `execShell` instead of `execOptionRoot`, suggested in `@dr-js/dev@0.1.1`',
  selectPathList: [ 'script/' ],
  selectFileExtension: '.js',
  verifyNoList: [ 'execOptionRoot' ]
}, {
  message: 'use `logger` directly instead of `logger: { padLog`, suggested in `@dr-js/dev@0.1.1`',
  selectPathList: [ 'script/' ],
  selectFileExtension: '.js',
  verifyNoList: [ 'logger: { padLog' ]
}, {
  message: 'use `JSON.parse(String(readFile*()))` instead of `JSON.parse(readFile*())`, suggested in `@dr-js/dev@0.2.0-dev.1',
  selectPathList: [ 'script/', 'source/', 'source-bin/' ],
  selectFileExtension: '.js',
  verifyNoList: [ 'JSON.parse(readFile', 'JSON.parse(await readFile' ]
}, {
  message: 'use `modifyRename/renamePath/renameDirectoryInfoTree` instead of `modifyMove/movePath/moveDirectoryInfoTree`, break change in `@dr-js/core@0.2.0-dev.5`',
  selectPathList: [ 'script/', 'source/', 'source-bin/' ],
  selectFileExtension: '.js',
  verifyNoList: [ 'modifyMove', 'movePath', 'moveDirectoryInfoTree' ]
}, {
  message: 'use `path:rename/PATH_RENAME` instead of `path:move/PATH_MOVE`, break change in `@dr-js/node@0.2.0-dev.4',
  selectPathList: [ 'script/', 'source/', 'source-bin/' ],
  selectFileExtension: '.js',
  verifyNoList: [ 'path:move', 'PATH_MOVE' ]
} ]

const buildMatchRegexp = (stringList) => {
  if (stringList.length === 0) throw new Error(`mission string to match for`)
  return new RegExp(stringList.map(escapeRegExp).join('|'))
}
const buildVerifyFunc = ({
  verifyPreNoList,
  verifyNoList
}) => {
  if (verifyNoList && verifyNoList.length) {
    const regExpVerifyNo = buildMatchRegexp(verifyNoList)
    if (verifyPreNoList && verifyPreNoList.length) {
      const regExpVerifyPreNo = buildMatchRegexp(verifyNoList)
      return (string) => ( // return true to pass
        regExpVerifyPreNo.test(string) === false || // pre-check
        regExpVerifyNo.test(string) === false
      )
    } else {
      return (string) => ( // return true to pass
        regExpVerifyNo.test(string) === false
      )
    }
  }
}

const normalizeRule = ({
  message,
  selectPathList,
  selectFileExtension,
  selectFileAllowNodeModule = false,
  selectFilterFile = selectFileAllowNodeModule
    ? (selectFileExtension ? (path) => path.endsWith(selectFileExtension) : undefined)
    : (selectFileExtension ? (path) => path.endsWith(selectFileExtension) && !path.includes('node_modules') : (path) => !path.includes('node_modules')),
  verifyPreNoList,
  verifyNoList,
  verifyFunc = buildVerifyFunc({ verifyNoList, verifyPreNoList })
}) => ({
  message,
  selectPathList, selectFilterFile,
  verifyFunc
})

const initVerify = async (pathRoot) => {
  const ruleSelectBundleMap = new Map()
  for (const rule of VERIFY_RULE_LIST.map(normalizeRule)) {
    for (const selectPath of rule.selectPathList) {
      if (!ruleSelectBundleMap.has(selectPath)) {
        const fileList = await getFileList(resolve(pathRoot, selectPath))
        ruleSelectBundleMap.set(selectPath, { fileList, ruleList: [ rule ] })
      } else ruleSelectBundleMap.get(selectPath).ruleList.push(rule)
    }
  }

  const failedFileInfoMap = new Map()
  __DEV__ && console.log(`ruleSelectBundleMap.size: ${ruleSelectBundleMap.size}`)
  for (const [ selectPath, { fileList, ruleList } ] of ruleSelectBundleMap) {
    __DEV__ && console.log(`  - selectPath: ${selectPath}`)
    for (const file of fileList) {
      __DEV__ && console.log(`    - file: ${file}`)
      const fileString = String(readFileSync(file))
      for (const { message, selectFilterFile, verifyFunc } of ruleList) {
        if (!selectFilterFile(file)) continue // filtered
        __DEV__ && console.log(`      - check: ${message}`)
        const { result, error } = await catchAsync(verifyFunc, fileString)
        if (result) continue
        if (!failedFileInfoMap.has(file)) failedFileInfoMap.set(file, [ { message, error } ])
        else failedFileInfoMap.get(file).push({ message, error })
      }
    }
  }

  console.log(`[initVerify] failed file: ${failedFileInfoMap.size}`)
  for (const [ file, failedList ] of failedFileInfoMap) {
    console.warn(`  - FAILED: ${file}`)
    for (const { message, error } of failedList) {
      console.warn(`    - ${message}`)
      error && console.error(`    - ERROR: ${error.stack || error}`)
    }
  }
  process.exit(Math.min(failedFileInfoMap.size, 42))
}
export { doInit }
