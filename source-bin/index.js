#!/usr/bin/env node

import { readFileSync } from 'fs'

import { doCheckOutdated } from './mode/checkOutdated'
import { doPack } from './mode/pack'
import { doStepPackageVersion } from './mode/stepPackageVersion'
import { doTestRootList } from './mode/testRoot'
import { doInit } from './mode/init'
import { doExec, doExecLoad } from './mode/exec'
import { doCacheStep } from './mode/cacheStep'

import { run } from '@dr-js/core/module/node/run'
import { patchModulePath as patchModulePathCore, sharedOption, sharedMode } from '@dr-js/core/bin/function'

import { fetchWithJumpProxy } from '@dr-js/node/module/module/Software/npm'
import { patchModulePath as patchModulePathNode } from '@dr-js/node/bin/function'

import { wrapJoinBashArgs, warpBashSubShell, parsePackageScript } from 'source/node/npm/parseScript'
import { comboCommand } from 'source/node/npm/comboCommand' // TODO: DEPRECATE: unused
import { runNpxLazy } from 'source/node/npm/npxLazy'

import { patchModulePath } from './function'
import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (optionData, modeName) => {
  const sharedPack = await sharedOption(optionData, modeName)
  const { get, tryGet, getFirst, tryGetFirst, getToggle } = optionData
  const { argumentList, log } = sharedPack

  const tabLog = getToggle('debug')
    ? (level, ...args) => log(`${'  '.repeat(level)}${args.join(' ')}`)
    : () => {}

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
        isPublish: getToggle('publish'),
        isPublishDev: getToggle('publish-dev'),
        isDryRun: getToggle('dry-run')
      })
    case 'step-package-version':
      return doStepPackageVersion({
        pathInput: tryGetFirst('path-input') || '.',
        isSortKey: getToggle('sort-key'),
        isGitCommit: getToggle('git-commit')
      })
    case 'test-root':
      return doTestRootList({
        testRootList: argumentList || [ process.cwd() ],
        testFileSuffixList: tryGet('test-file-suffix') || [ '.js' ],
        testRequireList: tryGet('test-require') || [],
        testTimeout: tryGet('test-timeout') || 42 * 1000
      })
    case 'init':
      return doInit({
        pathOutput: argumentList[ 0 ] || '.',
        pathResourcePackage: tryGetFirst('init-resource-package') || '.',
        isReset: getToggle('init-reset'),
        isVerify: getToggle('init-verify'),
        pathVerifyRule: tryGetFirst('init-verify-rule')
      })
    case 'exec':
      return doExec(argumentList, {
        env: tryGetFirst('exec-env'),
        cwd: tryGetFirst('exec-cwd')
      })
    case 'cache-step':
      return doCacheStep({
        cacheStepType: argumentList[ 0 ],
        prunePolicyType: tryGetFirst('prune-policy') || 'unused',
        pathStatFile: tryGetFirst('path-stat-file'), // TODO: only when 'checksum-file-only'
        pathChecksumList: get('path-checksum-list'),
        pathChecksumFile: getFirst('path-checksum-file'),
        pathStaleCheckList: tryGet('path-stale-check-list') || [],
        pathStaleCheckFile: tryGetFirst('path-stale-check-file') || undefined,
        maxStaleDay: tryGetFirst('max-stale-day') || 8
      })
    case 'exec-load':
      return doExecLoad({
        pathInput: tryGetFirst('path-input') || '.',
        name: argumentList[ 0 ],
        extraArgList: argumentList.slice(1)
      })
    case 'parse-script':
    case 'parse-script-list':
    case 'run-script':
    case 'run-script-list': {
      const packageJSON = JSON.parse(String(readFileSync('package.json'))) // TODO: NOTE: relative to cwd
      let command
      if (modeName.endsWith('-list')) {
        command = warpBashSubShell(argumentList
          .map((scriptName) => parsePackageScript(packageJSON, scriptName, '', 0, tabLog))
          .join('\n')
        )
      } else {
        const [ scriptName, ...extraArgs ] = argumentList
        command = parsePackageScript(packageJSON, scriptName, wrapJoinBashArgs(extraArgs), 0, tabLog)
      }
      if (modeName.startsWith('parse-script')) return console.log(command)
      // try exec:
      //   bash -c "false ; echo PASS" # will not stop on error
      //   bash -ec "false ; echo PASS" # will stop on error
      return run([ 'bash', '-ec', command ]).promise // TODO: inline `set -e`, or join command with `&&`?
    }
    case 'npm-combo': { // TODO: DEPRECATE: unused
      for (const name of argumentList) await comboCommand({ name, tabLog })
      return
    }
    case 'npx-lazy':
      return runNpxLazy(argumentList, tabLog)

    default:
      return sharedMode({
        ...sharedPack,
        patchMP: () => {
          patchModulePath()
          patchModulePathCore()
          patchModulePathNode()
        },
        fetchWJ: fetchWithJumpProxy, fetchUA: `${packageName}/${packageVersion}`
      })
  }
}

const main = async () => {
  const optionData = await parseOption()
  if (optionData.getToggle('version')) return console.log(JSON.stringify({ packageName, packageVersion }, null, 2))
  if (optionData.getToggle('help')) return console.log(formatUsage())
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))
  if (!modeName) throw new Error('no mode specified')
  await runMode(optionData, modeName).catch((error) => {
    console.warn(`[Error] in mode: ${modeName}:`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
