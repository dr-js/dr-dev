#!/usr/bin/env node

import { doCheckOutdated } from './checkOutdated'
import { doPack } from './pack'
import { doStepPackageVersion } from './stepPackageVersion'
import { doTestRoot } from './testRoot'

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
        isPublishDev: tryGet('publish-dev')
      })
    case 'step-package-version':
      return doStepPackageVersion({
        pathInput: tryGetFirst('path-input') || '.',
        isSortKey: tryGet('sort-key'),
        isGitCommit: tryGet('git-commit')
      })
    case 'test-root':
      return doTestRoot({
        testRoot: tryGetFirst('test-root') || process.cwd(),
        testFileSuffix: tryGetFirst('test-file-suffix') || '.js',
        testRequireList: tryGet('test-require') || []
      })
  }
}

const main = async () => {
  const optionData = await parseOption()
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))

  if (!modeName) {
    return optionData.tryGet('version')
      ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  '))
      : console.log(formatUsage(null, optionData.tryGet('help') ? null : 'simple'))
  }

  await runMode(modeName, optionData).catch((error) => {
    console.warn(`[Error] in mode: ${modeName}:`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
