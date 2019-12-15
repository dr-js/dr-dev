import { resolve } from 'path'
import { readFileSync } from 'fs'

import { catchAsync } from '@dr-js/core/module/common/error'
import { indentLine } from '@dr-js/core/module/common/string'
import { getFileList } from '@dr-js/core/module/node/file/Directory'

import { findPathFragList } from '@dr-js/dev/module/node/file'

import { getFromPackExport, loadAndCopyPackExportInitJSON } from '../function'

const NAME_PACK_EXPORT_INIT_VERIFY_RULE = 'INIT_VERIFY_RULE' // TODO: better lock file name

const doInit = async ({
  pathOutput,
  pathResourcePackage,
  isReset = false,
  isVerify = false,
  pathVerifyRule
}) => {
  const pathPackage = ( // find resource package pack export
    await findPathFragList(pathResourcePackage, [ 'node_modules', '@dr-js', /^dev-[\w-]+/ ]) ||
    await findPathFragList(pathResourcePackage, [ '@dr-js', /^dev-[\w-]+/ ]) ||
    pathResourcePackage
  )
  console.log(`[init] pathPackage: ${pathPackage}`)
  const fromPackExport = getFromPackExport(pathPackage)
  if (isVerify) {
    if (!pathVerifyRule) pathVerifyRule = fromPackExport(NAME_PACK_EXPORT_INIT_VERIFY_RULE)
    console.log(`[initVerify] pathVerifyRule: ${pathVerifyRule}`)
    try {
      const { VERIFY_RULE_LIST } = require(pathVerifyRule)
      return initVerify(pathOutput, VERIFY_RULE_LIST)
    } catch (error) {
      console.error(`failed to load: ${pathVerifyRule}`)
      throw error
    }
  }
  await loadAndCopyPackExportInitJSON({ fromPackExport, pathOutput, isReset })
}

const initVerify = async (pathRoot, VERIFY_RULE_LIST) => {
  const ruleSelectBundleMap = new Map()
  for (const rule of VERIFY_RULE_LIST) {
    for (const selectPath of rule.selectPathList) {
      if (!ruleSelectBundleMap.has(selectPath)) {
        const fileList = await getFileList(resolve(pathRoot, selectPath)).catch((error) => {
          console.warn(`[initVerify] invalid selectPAth: ${selectPath}`, error)
          return []
        })
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
      for (const { messageList, selectFilterFile, verifyFunc } of ruleList) {
        if (!selectFilterFile(file)) continue // filtered
        __DEV__ && console.log(`      - check: ${messageList.join(' ')}`)
        const { result, error } = await catchAsync(verifyFunc, fileString)
        if (result) continue
        if (!failedFileInfoMap.has(file)) failedFileInfoMap.set(file, [ { messageList, error } ])
        else failedFileInfoMap.get(file).push({ messageList, error })
      }
    }
  }
  console.log(`[initVerify] failed file: ${failedFileInfoMap.size}`)
  for (const [ file, failedList ] of failedFileInfoMap) {
    console.warn(`  - FAILED: ${file}`)
    for (const { messageList, error } of failedList) {
      console.warn(`    * ${messageList.join('\n      ')}`)
      error && console.error(indentLine(`ERROR: ${error.stack || error}`, '        ', '      ! '))
    }
  }
  process.exit(Math.min(failedFileInfoMap.size, 42))
}
export { doInit }
