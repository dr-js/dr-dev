#!/usr/bin/env node

import { doCheckOutdated } from './checkOutdated'
import { doPack } from './pack'
import { doStepPackageVersion } from './stepPackageVersion'

import { parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (
  { tryGet, getFirst, tryGetFirst },
  isCheckOutdated,
  isPack,
  isStepPackageVersion
) => {
  isCheckOutdated && await doCheckOutdated({
    pathInput: getFirst('path-input'),
    pathTemp: tryGetFirst('path-temp')
  })
  isPack && await doPack({
    pathInput: getFirst('path-input'),
    pathOutput: getFirst('path-output'),
    outputName: tryGetFirst('output-name'),
    outputVersion: tryGetFirst('output-version'),
    outputDescription: tryGetFirst('output-description'),
    isPublish: tryGet('publish'),
    isPublishDev: tryGet('publish-dev')
  })
  isStepPackageVersion && await doStepPackageVersion({
    pathInput: tryGetFirst('path-input') || '.',
    isSortKey: tryGet('sort-key'),
    isGitCommit: tryGet('git-commit')
  })
}

const main = async () => {
  const optionData = await parseOption()
  const { tryGet } = optionData

  const isCheckOutdated = tryGet('check-outdated')
  const isPack = tryGet('pack')
  const isStepPackageVersion = tryGet('step-package-version')

  if (!isCheckOutdated && !isPack && !isStepPackageVersion) {
    return tryGet('version')
      ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  '))
      : console.log(formatUsage(null, tryGet('help') ? null : 'simple'))
  }

  await runMode(
    optionData,
    isCheckOutdated,
    isPack,
    isStepPackageVersion
  ).catch((error) => {
    console.warn(`[Error]`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
