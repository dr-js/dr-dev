#!/usr/bin/env node

import { doCheckOutdated } from './mode/checkOutdated'
import { doPack } from './mode/pack'
import { doStepPackageVersion } from './mode/stepPackageVersion'
import { doTestRootList } from './mode/testRoot'
import { doInit } from './mode/init'

import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (modeName, { tryGet, getFirst, tryGetFirst }) => {
  switch (modeName) {
    case 'check-outdated' :
      return doCheckOutdated({
        pathInput: getFirst('path-input'),
        pathTemp: tryGetFirst('path-temp')
      })
    case 'pack':
      return doPack({
        pathInput: getFirst('path-input'),
        pathOutput: getFirst('path-output'),
        outputName: tryGetFirst('output-name'),
        outputVersion: tryGetFirst('output-version'),
        outputDescription: tryGetFirst('output-description'),
        isPublish: tryGet('publish'),
        isPublishDev: tryGet('publish-dev'),
        isDryRun: tryGet('dry-run')
      })
    case 'step-package-version':
      return doStepPackageVersion({
        pathInput: tryGetFirst('path-input') || '.',
        isSortKey: tryGet('sort-key'),
        isGitCommit: tryGet('git-commit')
      })
    case 'test-root':
      return doTestRootList({
        testRootList: tryGet('test-root') || [ process.cwd() ],
        testFileSuffixList: tryGet('test-file-suffix') || [ '.js' ],
        testRequireList: tryGet('test-require') || [],
        testTimeout: tryGet('test-timeout') || 10 * 1000
      })
    case 'init':
      return doInit({
        pathOutput: tryGetFirst('init') || '.',
        pathResourcePackage: tryGetFirst('init-resource-package') || '.',
        isReset: tryGet('init-reset')
      })
  }
}

const main = async () => {
  const optionData = await parseOption()
  if (optionData.tryGet('version')) return console.log(JSON.stringify({ packageName, packageVersion }, null, 2))
  if (optionData.tryGet('help')) return console.log(formatUsage())
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))
  if (!modeName) throw new Error('no mode specified')
  await runMode(modeName, optionData).catch((error) => {
    console.warn(`[Error] in mode: ${modeName}:`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
