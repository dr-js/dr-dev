#!/usr/bin/env node

import { doCheckOutdated } from './mode/checkOutdated.js'
import { doTest } from './mode/test.js'
import { doExec } from './mode/exec.js'
import { doCacheStep } from './mode/cacheStep.js'
import { doVersionBump, getCommonVersionBump } from './mode/versionBump.js'
import { doPackageTrimNodeModules, doPackageTrimRubyGem } from './mode/packageTrim.js'
import { doShellAlias } from './mode/shellAlias.js'

import { versionBumpByGitBranch, versionBumpLastNumber, versionBumpToIdentifier, versionBumpToLocal } from '@dr-js/core/module/common/module/SemVer.js'
import { readJSONSync } from '@dr-js/core/module/node/fs/File.js'
import { getGitBranch } from '@dr-js/core/module/node/module/Software/git.js'
import { run } from '@dr-js/core/module/node/run.js'
import { patchModulePath as patchModulePathCore, sharedOption, sharedMode } from '@dr-js/core/bin/function.js'

import { wrapJoinBashArgs, warpBashSubShell, parsePackageScript } from 'source/node/npm/parseScript.js'

import { patchModulePath } from './function.js'
import { MODE_NAME_LIST, parseOption, formatUsage } from './option.js'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (optionData, modeName) => {
  const sharedPack = sharedOption(optionData, modeName)
  const { get, tryGet, getFirst, tryGetFirst, getToggle } = optionData
  const { argumentList, log } = sharedPack

  const isDebug = getToggle('debug')
  const isGitCommit = getToggle('git-commit')
  const commonVersionBump = getCommonVersionBump(tryGetFirst('root'), isGitCommit, isDebug, log)

  const tabLog = isDebug
    ? (level, ...args) => log(`${'  '.repeat(level)}${args.join(' ')}`)
    : () => {}

  switch (modeName) {
    // new mode (no short commands for now to avoid conflict)
    case 'shell-alias':
      return doShellAlias({
        aliasName: argumentList[ 0 ],
        aliasArgList: argumentList.slice(1),
        log
      })

    case 'version-bump-git-branch':
      return doVersionBump(await commonVersionBump(versionBumpByGitBranch, {
        gitBranch: getGitBranch(),
        getIsMajorBranch: (gitBranch) => `master,main,major,${(process.env.GIT_MAJOR_BRANCH || '')}`.split(',').map((v) => v.trim()).filter(Boolean).includes(gitBranch)
      }))
    case 'version-bump-last-number':
      return doVersionBump(await commonVersionBump(versionBumpLastNumber))
    case 'version-bump-to-identifier':
      return doVersionBump(await commonVersionBump(versionBumpToIdentifier, { identifier: argumentList[ 0 ] || 'dev' }))
    case 'version-bump-to-local':
      return doVersionBump(await commonVersionBump(versionBumpToLocal))
    case 'version-bump-to-major':
      return doVersionBump(await commonVersionBump(versionBumpByGitBranch, { isMajorBranch: true }))

    case 'package-trim-node-modules':
      return doPackageTrimNodeModules({ pathList: argumentList, log })
    case 'package-trim-ruby-gem':
      return doPackageTrimRubyGem({ pathList: argumentList, log })

    // keep mode
    case 'test':
      return doTest({
        testRootList: argumentList || [ process.cwd() ],
        testFileSuffixList: tryGet('test-file-suffix') || [ '.js' ],
        testRequireList: tryGet('test-require') || [],
        testTimeout: tryGet('test-timeout') || 42 * 1000
      })

    case 'parse-script':
    case 'parse-script-list':
    case 'run-script':
    case 'run-script-list': {
      const packageJSON = readJSONSync('package.json') // TODO: NOTE: relative to cwd
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

    // TODO: DEPRECATE: reorder & rename options
    case 'check-outdated' :
      return doCheckOutdated({
        pathInput: argumentList[ 0 ] || tryGetFirst('root') || './package.json',
        pathTemp: tryGetFirst('path-temp'),
        isWriteBack: getToggle('write-back')
      })
    case 'exec': // TODO: support run z64string?
      return doExec(argumentList, {
        env: tryGetFirst('exec-env'),
        cwd: tryGetFirst('exec-cwd') // TODO: naming
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

    default:
      return sharedMode({
        ...sharedPack,
        patchMP: () => {
          patchModulePath()
          patchModulePathCore()
        }
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
