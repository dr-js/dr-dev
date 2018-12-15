#!/usr/bin/env node

import { doCheckOutdated } from './checkOutdated'
import { doPack } from './pack'
import { doStepPackageVersion } from './stepPackageVersion'

import { parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async ({ isCheckOutdated, isPack, isStepPackageVersion }, { getOptionOptional, getSingleOption, getSingleOptionOptional }) => {
  isCheckOutdated && await doCheckOutdated({
    pathInput: getSingleOption('path-input'),
    pathTemp: getSingleOptionOptional('path-temp')
  })
  isPack && await doPack({
    pathInput: getSingleOption('path-input'),
    pathOutput: getSingleOption('path-output'),
    outputName: getSingleOptionOptional('output-name'),
    outputVersion: getSingleOptionOptional('output-version'),
    outputDescription: getSingleOptionOptional('output-description'),
    isPublish: getOptionOptional('publish'),
    isPublishDev: getOptionOptional('publish-dev')
  })
  isStepPackageVersion && await doStepPackageVersion({
    pathInput: getSingleOptionOptional('path-input') || '.',
    isSortKey: getOptionOptional('sort-key'),
    isGitCommit: getOptionOptional('git-commit')
  })
}

const main = async () => {
  const optionData = await parseOption()
  const { getOptionOptional } = optionData

  const isCheckOutdated = getOptionOptional('check-outdated')
  const isPack = getOptionOptional('pack')
  const isStepPackageVersion = getOptionOptional('step-package-version')

  if (!isCheckOutdated && !isPack && !isStepPackageVersion) {
    return getOptionOptional('version')
      ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  '))
      : console.log(formatUsage(null, getOptionOptional('help') ? null : 'simple'))
  }

  await runMode({ isCheckOutdated, isPack, isStepPackageVersion }, optionData).catch((error) => {
    console.warn(`[Error]`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
