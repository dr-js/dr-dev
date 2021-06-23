import { ok } from 'assert'
import { resolve } from 'path'
import { homedir, tmpdir } from 'os'
import { statSync, readFileSync, writeFileSync } from 'fs'
import { binary } from '@dr-js/core/module/common/format.js'
import { isBasicObject } from '@dr-js/core/module/common/check.js'
import { getFileList } from '@dr-js/core/module/node/file/Directory.js'
import { modifyCopy, modifyRename, modifyDelete } from '@dr-js/core/module/node/file/Modify.js'
import { resolveCommand } from '@dr-js/core/module/node/system/ResolveCommand.js'
import { run, runSync, runDetached } from '@dr-js/core/module/node/run.js'

import { findUpPackageRoot, toPackageTgzName, getPathNpmExecutable } from '@dr-js/node/module/module/Software/npm.js'

import { __VERBOSE__, argvFlag } from './node/env.js'
import { FILTER_TEST_PATH } from './node/preset.js'
import { getFileListFromPathList, resetDirectory } from './node/file.js'
import { writeLicenseFile } from './license.js'

const fromPathCombo = ({
  PATH_ROOT = findUpPackageRoot(process.cwd()),
  PATH_OUTPUT = 'output-gitignore/', // relative
  PATH_TEMP = tmpdir(),
  PATH_HOME = homedir()
} = {}) => {
  // allow use relative path from PATH_ROOT
  PATH_OUTPUT = resolve(PATH_ROOT, PATH_OUTPUT)
  PATH_TEMP = resolve(PATH_ROOT, PATH_TEMP)
  PATH_HOME = resolve(PATH_ROOT, PATH_HOME)
  return {
    PATH_ROOT, fromRoot: (...args) => resolve(PATH_ROOT, ...args),
    PATH_OUTPUT, fromOutput: (...args) => resolve(PATH_OUTPUT, ...args),
    PATH_TEMP, fromTemp: (...args) => resolve(PATH_TEMP, ...args),
    PATH_HOME, fromHome: (...args) => resolve(PATH_HOME, ...args)
  }
}

const commonCombo = (
  logger,
  config = {
    DRY_RUN: Boolean(process.env.DRY_RUN),
    QUIET_RUN: argvFlag('quiet') || Boolean(process.env.QUIET_RUN)
  }
) => {
  const pathConfig = fromPathCombo(config)
  const RUN = (argListOrString, isDetached = false) => { // TODO: DEPRECATE: move `isDetached` in to option object
    const argList = Array.isArray(argListOrString) ? [ ...argListOrString ] : argListOrString.split(' ').filter(Boolean) // prepend `'bash', '-c'` to run in bash shell
    argList[ 0 ] = resolveCommand(argList[ 0 ], pathConfig.PATH_ROOT) // mostly for finding `npm.cmd` on win32
    if (config.DRY_RUN) !config.QUIET_RUN && logger.log(`[${config.DRY_RUN ? 'RUN|DRY' : isDetached ? 'RUN|DETACHED' : 'RUN'}] "${argList.join(' ')}"`)
    else return (isDetached ? runDetached : runSync)(argList, { cwd: pathConfig.PATH_ROOT, stdio: config.QUIET_RUN ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit' })
  }
  return { config, ...pathConfig, RUN }
}

const initOutput = async ({
  fromOutput,
  fromRoot,
  deleteKeyList = [ 'private', 'scripts', 'devExecCommands', 'devDependencies' ],
  copyPathList = [ 'README.md' ],
  copyMapPathList = [],
  replaceReadmeNonPackageContent = '\n\nmore in source `README.md`', // set to false to skip
  pathAutoLicenseFile = 'LICENSE', // set to false, or do not set `packageJSON.license` to skip
  logger
}) => {
  logger.padLog('reset output')
  await resetDirectory(fromOutput())

  logger.padLog('init output package.json')
  const packageJSON = require(fromRoot('package.json'))
  for (const deleteKey of deleteKeyList) {
    delete packageJSON[ deleteKey ]
    logger.log(`dropped key: ${deleteKey}`)
  }
  writeFileSync(fromOutput('package.json'), JSON.stringify(packageJSON))

  const { license, author } = packageJSON
  if (pathAutoLicenseFile && license && author) {
    logger.padLog('update source license file')
    writeLicenseFile(fromRoot(pathAutoLicenseFile), license, author)
    copyPathList.push(pathAutoLicenseFile)
  }

  logger.padLog('init output file')
  for (const [ pathFrom, pathTo ] of [ ...copyPathList.map((v) => [ v, v ]), ...copyMapPathList ]) {
    if (replaceReadmeNonPackageContent && pathFrom.endsWith('README.md')) { // change README.md NON_PACKAGE_CONTENT
      const packageContentList = String(readFileSync(fromRoot(pathFrom))).split('[//]: # (NON_PACKAGE_CONTENT)')
      if (packageContentList.length >= 2) {
        writeFileSync(fromOutput(pathTo), `${packageContentList[ 0 ].trim()}${replaceReadmeNonPackageContent}`)
        logger.log(`copied: ${pathFrom} (with NON_PACKAGE_CONTENT replaced to: ${JSON.stringify(replaceReadmeNonPackageContent)})`)
        continue
      }
    }
    await modifyCopy(fromRoot(pathFrom), fromOutput(pathTo))
    logger.log(`copied: ${pathFrom}`)
  }

  return packageJSON
}

const packOutput = async ({
  fromOutput,
  fromRoot = fromOutput, // OPTIONAL, for move output .tgz file to root
  packageJSON = require(fromOutput('package.json')),
  logger
}) => {
  logger.padLog('run pack output')
  await run([
    getPathNpmExecutable(), '--no-update-notifier', 'pack'
  ], { cwd: fromOutput(), quiet: !__VERBOSE__, describeError: !__VERBOSE__ }).promise

  const packName = toPackageTgzName(packageJSON.name, packageJSON.version)
  if (fromRoot !== fromOutput) {
    logger.log('move to root path')
    await modifyRename(fromOutput(packName), fromRoot(packName))
  }
  logger.padLog(`pack size: ${binary(statSync(fromRoot(packName)).size)}B`)

  return fromRoot(packName)
}

const clearOutput = async ({ fromOutput, pathList = [ '.' ], filterFile = FILTER_TEST_PATH, logger }) => {
  if (!fromOutput) throw new Error('[clearOutput] expect fromOutput')
  logger.padLog('clear output')
  const fileList = await getFileListFromPathList(pathList, fromOutput, filterFile)
  for (const filePath of fileList) await modifyDelete(filePath)
}

const verifyOutputBin = async ({
  fromOutput,
  versionArgList = [ '--version' ], // DEFAULT: request version
  packageJSON: { name, version, bin },
  pathExe = process.execPath, // allow set to '' for other non-node executable
  matchStringList = [ name, version ], // DEFAULT: expect output with full package name & version
  logger
}) => {
  let pathBin = bin || './bin'
  if (isBasicObject(pathBin)) pathBin = pathBin[ Object.keys(pathBin)[ 0 ] ]
  logger.padLog('verify output bin working')
  const { promise, stdoutPromise } = run([ pathExe, pathBin, ...versionArgList ].filter(Boolean), { cwd: fromOutput(), quiet: true, describeError: true })
  await promise
  const outputBinTest = String(await stdoutPromise)
  logger.log(`bin test output: ${outputBinTest}`)
  for (const testString of matchStringList) ok(outputBinTest.includes(testString), `should output contain: ${testString}`)
}

const verifyNoGitignore = async ({ path, logger }) => {
  logger.padLog('verify no gitignore file left')
  const badFileList = (await getFileList(path)).filter((path) => path.includes('gitignore'))
  badFileList.length && logger.log(`found gitignore file:\n  - ${badFileList.join('\n  - ')}`)
  ok(badFileList.length === 0, `${badFileList.length} gitignore file found`)
}

const verifyGitStatusClean = async ({ fromRoot, cwd = fromRoot(), logger }) => {
  logger.padLog('verify git has nothing to commit')
  const { promise, stdoutPromise } = run([ 'git', 'status', '-vv' ], { cwd, quiet: true }) // NOTE: use -vv to log diff detail
  await promise
  const outputGitStatus = String(await stdoutPromise)
  ok(outputGitStatus.includes('nothing to commit, working tree clean'), `git change to commit: ${outputGitStatus}`)
}

const publishOutput = async ({
  packageJSON: { name, version },
  pathPackagePack, // the .tgz output of pack
  flagList = process.argv,
  isPublishAuto = getPublishFlag(flagList, version).isPublishAuto,
  isPublish = getPublishFlag(flagList, version).isPublish,
  isPublishDev = getPublishFlag(flagList, version).isPublishDev,
  isPublishVerify = !(isPublishAuto && isPublishDev), // skip verify only for auto + dev
  isAccessRestricted = false,
  extraArgs = [],
  logger
}) => {
  if (!isPublish && !isPublishDev) return logger.padLog('skipped publish output, no flag found')
  if (!pathPackagePack || !pathPackagePack.endsWith('.tgz')) throw new Error(`[publishOutput] invalid pathPackagePack: ${pathPackagePack}`)
  isPublishVerify && verifyPublishVersion({ version, isPublishDev })

  logger.padLog(`${isPublishDev ? 'publish-dev' : 'publish'}: ${version}`)

  // Patch tag
  !extraArgs.includes('--tag') && extraArgs.push('--tag', isPublishDev ? 'dev' : 'latest')

  // Patch only for scoped packages, default to restricted, check: https://docs.npmjs.com/cli/publish
  !extraArgs.includes('--access') && name.startsWith('@') && extraArgs.push('--access', isAccessRestricted ? 'restricted' : 'public')

  // NOTE: if this process is run under yarn, the registry will be pointing to `https://registry.yarnpkg.com/`, and auth for publish will not work, check:
  // - `npm config get userconfig`
  // - `npm config get registry`
  // - `npm whoami`
  await run([ getPathNpmExecutable(), '--no-update-notifier', 'publish', pathPackagePack, ...extraArgs ]).promise
}
const getPublishFlag = (flagList, packageVersion) => {
  const isPublishAuto = flagList.includes('publish-auto') // no version verify for auto + dev, and do not limit dev version format to `REGEXP_PUBLISH_VERSION_DEV`
  let isPublish = flagList.includes('publish')
  let isPublishDev = flagList.includes('publish-dev')
  if (Number(isPublishAuto) + Number(isPublish) + Number(isPublishDev) >= 2) throw new Error('[getPublishFlag] expect single flag')
  if (isPublishAuto) {
    if (!packageVersion) throw new Error('[getPublishFlag] expect packageVersion for auto publish')
    isPublish = REGEXP_PUBLISH_VERSION.test(packageVersion)
    isPublishDev = !isPublish
  }
  return { isPublishAuto, isPublish, isPublishDev }
}
const verifyPublishVersion = ({ version, isPublishDev }) => {
  if (isPublishDev
    ? REGEXP_PUBLISH_VERSION_DEV.test(version)
    : REGEXP_PUBLISH_VERSION.test(version)
  ) return
  throw new Error(`[verifyPublishVersion] invalid version: ${version}, isPublishDev: ${isPublishDev}`)
}
const REGEXP_PUBLISH_VERSION = /^\d+\.\d+\.\d+$/ // 0.0.0
const REGEXP_PUBLISH_VERSION_DEV = /^\d+\.\d+\.\d+-dev\.\d+$/ // 0.0.0-dev.0

export {
  fromPathCombo, commonCombo,
  initOutput,
  packOutput,
  clearOutput,
  verifyOutputBin,
  verifyNoGitignore, verifyGitStatusClean,
  publishOutput, getPublishFlag, verifyPublishVersion, REGEXP_PUBLISH_VERSION, REGEXP_PUBLISH_VERSION_DEV
}
