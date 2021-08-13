import { ok } from 'assert'
import { statSync, readFileSync, writeFileSync } from 'fs'
import { binary } from '@dr-js/core/module/common/format.js'
import { isBasicObject } from '@dr-js/core/module/common/check.js'
import { getFirstBinPath } from '@dr-js/core/module/common/module/PackageJSON.js'
import { getFileList, resetDirectory } from '@dr-js/core/module/node/fs/Directory.js'
import { modifyCopy, modifyRename, modifyDelete } from '@dr-js/core/module/node/fs/Modify.js'
import { runStdout } from '@dr-js/core/module/node/run.js'
import { argvFlag, getKitPathCombo, getKitRun } from '@dr-js/core/module/node/kit.js'

import { toPackageTgzName, runNpm } from '@dr-js/core/module/node/module/Software/npm.js'
import { runGitStdout, runGitStdoutSync } from '@dr-js/core/module/node/module/Software/git.js'

import { __VERBOSE__ } from './node/env.js'
import { FILTER_TEST_PATH } from './node/preset.js'
import { getFileListFromPathList } from './node/file.js'
import { writeLicenseFile } from './license.js'

const commonCombo = ( // TODO: DEPRECATE
  kitLogger,
  config = {
    DRY_RUN: Boolean(process.env.DRY_RUN),
    QUIET_RUN: argvFlag('quiet') || Boolean(process.env.QUIET_RUN)
  }
) => {
  const pathConfig = getKitPathCombo(config)
  const kitRun = getKitRun({ ...config, ...pathConfig, log: kitLogger.log, isQuiet: config.QUIET_RUN, isDryRun: config.DRY_RUN })
  const RUN = (argListOrString, optionOrIsDetached) => kitRun.RUN( // TODO: DEPRECATE: move `isDetached` in to option object
    argListOrString,
    isBasicObject(optionOrIsDetached) ? optionOrIsDetached : { isDetached: Boolean(optionOrIsDetached) }
  )
  return { config, ...pathConfig, RUN }
}

const initOutput = async ({
  logger, kit, kitLogger = kit || logger, // TODO: DEPRECATE: use 'kit' instead of 'logger'
  fromOutput = kit && kit.fromOutput,
  fromRoot = kit && kit.fromRoot,

  deleteKeyList = [ 'private', 'scripts', 'devExecCommands', 'devDependencies' ],
  copyPathList = [ 'README.md' ],
  copyMapPathList = [],
  replaceReadmeNonPackageContent = '\n\nmore in source `README.md`', // set to false to skip
  pathAutoLicenseFile = 'LICENSE' // set to false, or do not set `packageJSON.license` to skip
}) => {
  kitLogger.padLog('reset output')
  await resetDirectory(fromOutput())

  kitLogger.padLog('init output package.json')
  const packageJSON = require(fromRoot('package.json'))
  for (const deleteKey of deleteKeyList) {
    delete packageJSON[ deleteKey ]
    kitLogger.log(`dropped key: ${deleteKey}`)
  }
  writeFileSync(fromOutput('package.json'), JSON.stringify(packageJSON))

  const { license, author } = packageJSON
  if (pathAutoLicenseFile && license && author) {
    kitLogger.padLog('update source license file')
    writeLicenseFile(fromRoot(pathAutoLicenseFile), license, author)
    copyPathList.push(pathAutoLicenseFile)
  }

  kitLogger.padLog('init output file')
  for (const [ pathFrom, pathTo ] of [ ...copyPathList.map((v) => [ v, v ]), ...copyMapPathList ]) {
    if (replaceReadmeNonPackageContent && pathFrom.endsWith('README.md')) { // change README.md NON_PACKAGE_CONTENT
      const packageContentList = String(readFileSync(fromRoot(pathFrom))).split('[//]: # (NON_PACKAGE_CONTENT)')
      if (packageContentList.length >= 2) {
        writeFileSync(fromOutput(pathTo), `${packageContentList[ 0 ].trim()}${replaceReadmeNonPackageContent}`)
        kitLogger.log(`copied: ${pathFrom} (with NON_PACKAGE_CONTENT replaced to: ${JSON.stringify(replaceReadmeNonPackageContent)})`)
        continue
      }
    }
    await modifyCopy(fromRoot(pathFrom), fromOutput(pathTo))
    kitLogger.log(`copied: ${pathFrom}`)
  }

  return packageJSON
}

const packOutput = async ({
  logger, kit, kitLogger = kit || logger, // TODO: DEPRECATE: use 'kit' instead of 'logger'
  fromOutput = kit && kit.fromOutput,
  fromRoot = (kit && kit.fromRoot) || fromOutput, // OPTIONAL, for move output .tgz file to root

  cwd = fromOutput(),
  packageJSON = require(fromOutput('package.json'))
}) => {
  kitLogger.padLog('run pack output')
  await runNpm([ '--no-update-notifier', 'pack' ], { cwd, quiet: !__VERBOSE__ }).promise

  const packName = toPackageTgzName(packageJSON.name, packageJSON.version)
  if (fromRoot !== fromOutput) {
    kitLogger.log('move to root path')
    await modifyRename(fromOutput(packName), fromRoot(packName))
  }
  kitLogger.padLog(`pack size: ${binary(statSync(fromRoot(packName)).size)}B`)

  return fromRoot(packName)
}

const clearOutput = async ({
  logger, kit, kitLogger = kit || logger, // TODO: DEPRECATE: use 'kit' instead of 'logger'
  fromOutput = kit && kit.fromOutput,

  pathList = [ '.' ],
  filterFile = FILTER_TEST_PATH
}) => {
  if (!fromOutput) throw new Error('[clearOutput] expect fromOutput')
  kitLogger.padLog('clear output')
  const fileList = await getFileListFromPathList(pathList, fromOutput, filterFile)
  for (const filePath of fileList) await modifyDelete(filePath)
}

const verifyOutputBin = async ({
  logger, kit, kitLogger = kit || logger, // TODO: DEPRECATE: use 'kit' instead of 'logger'
  fromOutput = kit && kit.fromOutput,

  cwd = fromOutput(),
  versionArgList = [ '--version' ], // DEFAULT: request version
  packageJSON: { name, version, bin },
  pathExe = process.execPath, // allow set to '' to skip, or use other non-node executable
  matchStringList = [ name, version ] // DEFAULT: expect output with full package name & version
}) => {
  const pathBin = getFirstBinPath({ bin })
  kitLogger.padLog(`verify output bin working: "${pathBin}"`)
  const outputBinTest = String(await runStdout([ pathExe, pathBin, ...versionArgList ].filter(Boolean), { cwd }))
  kitLogger.log(`bin test output: ${outputBinTest}`)
  for (const testString of matchStringList) ok(outputBinTest.includes(testString), `should output contain: ${testString}`)
}

const verifyNoGitignore = async ({
  path,
  logger, kit, kitLogger = kit || logger // TODO: DEPRECATE: use 'kit' instead of 'logger'
}) => {
  kitLogger.padLog('verify no gitignore file left')
  const badFileList = (await getFileList(path)).filter((path) => path.includes('gitignore'))
  badFileList.length && kitLogger.log(`found gitignore file:\n  - ${badFileList.join('\n  - ')}`)
  ok(badFileList.length === 0, `${badFileList.length} gitignore file found`)
}

const verifyGitStatusClean = async ({
  logger, kit, kitLogger = kit || logger, // TODO: DEPRECATE: use 'kit' instead of 'logger'
  fromRoot = kit && kit.fromRoot,

  cwd = fromRoot(),
  extraArgList = [] // mostly set path to check
}) => {
  kitLogger.padLog('verify git has nothing to commit')
  // https://stackoverflow.com/questions/5143795/how-can-i-check-in-a-bash-script-if-my-local-git-repository-has-changes/25149786#25149786
  if (String(await runGitStdout([ 'status', '--porcelain', ...extraArgList ], { cwd })) !== '') throw new Error(`[verifyGitStatusClean] change to commit:\n${runGitStdoutSync([ 'status', '-vv', ...extraArgList ], { cwd })}`)
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
  logger, kit, kitLogger = kit || logger // TODO: DEPRECATE: use 'kit' instead of 'logger'
}) => {
  if (!isPublish && !isPublishDev) return kitLogger.padLog('skipped publish output, no flag found')
  if (!pathPackagePack || !pathPackagePack.endsWith('.tgz')) throw new Error(`[publishOutput] invalid pathPackagePack: ${pathPackagePack}`)
  isPublishVerify && verifyPublishVersion({ version, isPublishDev })

  kitLogger.padLog(`${isPublishDev ? 'publish-dev' : 'publish'}: ${version}`)

  // Patch tag
  !extraArgs.includes('--tag') && extraArgs.push('--tag', isPublishDev ? 'dev' : 'latest')

  // Patch only for scoped packages, default to restricted, check: https://docs.npmjs.com/cli/publish
  !extraArgs.includes('--access') && name.startsWith('@') && extraArgs.push('--access', isAccessRestricted ? 'restricted' : 'public')

  // NOTE: if this process is run under yarn, the registry will be pointing to `https://registry.yarnpkg.com/`, and auth for publish will not work, check:
  // - `npm config get userconfig`
  // - `npm config get registry`
  // - `npm whoami`
  await runNpm([ '--no-update-notifier', 'publish', pathPackagePack, ...extraArgs ]).promise
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
  commonCombo,
  initOutput,
  packOutput,
  clearOutput,
  verifyOutputBin,
  verifyNoGitignore, verifyGitStatusClean,
  publishOutput, getPublishFlag, verifyPublishVersion, REGEXP_PUBLISH_VERSION, REGEXP_PUBLISH_VERSION_DEV
}

export {
  getKitPathCombo as fromPathCombo // TODO: DEPRECATE
} from '@dr-js/core/module/node/kit.js'
