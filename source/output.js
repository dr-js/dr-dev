import { ok } from 'assert'
import { statSync, readFileSync, writeFileSync } from 'fs'
import { binary } from '@dr-js/core/module/common/format'
import { isBasicObject } from '@dr-js/core/module/common/check'
import { getFileList } from '@dr-js/core/module/node/file/Directory'
import { modifyCopy, modifyRename, modifyDelete } from '@dr-js/core/module/node/file/Modify'
import { run } from '@dr-js/core/module/node/system/Run'

import { toPackageTgzName } from '@dr-js/node/module/module/Software/npm'

import { __VERBOSE__ } from './node/env'
import { FILTER_TEST_PATH } from './node/preset'
import { getFileListFromPathList, resetDirectory } from './node/file'
import { writeLicenseFile } from './license'

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
  await run({
    command: 'npm',
    argList: [ '--no-update-notifier', 'pack' ],
    option: { shell: true, cwd: fromOutput(), stdio: __VERBOSE__ ? 'inherit' : [ 'ignore', 'ignore' ] }
  }).promise

  const packName = toPackageTgzName(packageJSON.name, packageJSON.version)
  if (fromRoot !== fromOutput) {
    logger.log('move to root path')
    await modifyRename(fromOutput(packName), fromRoot(packName))
  }
  logger.padLog(`pack size: ${binary(statSync(fromRoot(packName)).size)}B`)

  return fromRoot(packName)
}

const clearOutput = async ({ fromOutput, pathList = [ '.' ], filterFile = FILTER_TEST_PATH, logger }) => {
  logger.padLog('clear output')
  const fileList = await getFileListFromPathList(pathList, fromOutput, filterFile)
  for (const filePath of fileList) await modifyDelete(filePath)
}

const verifyOutputBin = async ({
  fromOutput,
  versionArgList = [ '--version' ], // DEFAULT: request version
  packageJSON: { name, version, bin },
  matchStringList = [ name, version ], // DEFAULT: expect output with full package name & version
  logger
}) => {
  let pathBin = bin || './bin'
  if (isBasicObject(pathBin)) pathBin = pathBin[ Object.keys(pathBin)[ 0 ] ]
  logger.padLog('verify output bin working')
  const { promise, stdoutPromise } = run({
    command: 'node',
    argList: [ pathBin, ...versionArgList ],
    option: { cwd: fromOutput() },
    quiet: true
  })
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
  const { promise, stdoutPromise } = run({ command: 'git', argList: [ 'status' ], option: { cwd }, quiet: true })
  await promise
  const outputGitStatus = String(await stdoutPromise)
  ok(outputGitStatus.includes('nothing to commit, working tree clean'), `git change to commit: ${outputGitStatus}`)
}

const publishOutput = async ({
  flagList,
  isPublish = getPublishFlag(flagList).isPublish,
  isPublishDev = getPublishFlag(flagList).isPublishDev,
  packageJSON: { name, version },
  pathPackagePack, // the .tgz output of pack
  extraArgs = [],
  logger
}) => {
  if (!isPublish && !isPublishDev) return logger.padLog('skipped publish output, no flag found')
  if (!pathPackagePack || !pathPackagePack.endsWith('.tgz')) throw new Error(`[publishOutput] invalid pathPackagePack: ${pathPackagePack}`)
  verifyPublishVersion({ version, isPublishDev })

  // Only applies to scoped packages, which default to restricted, check: https://docs.npmjs.com/cli/publish
  name.startsWith('@') && !extraArgs.includes('--access') && extraArgs.push('--access', 'public')

  // NOTE: if this process is run under yarn, the registry will be pointing to `https://registry.yarnpkg.com/`, and auth for publish will not work
  // if (isPublish || isPublishDev) runSync({ command: 'npm', argList: [ 'config', 'get', 'userconfig' ] })
  // if (isPublish || isPublishDev) runSync({ command: 'npm', argList: [ 'config', 'get', 'registry' ] })
  // if (isPublish || isPublishDev) runSync({ command: 'npm', argList: [ 'whoami' ] })

  logger.padLog(`${isPublishDev ? 'publish-dev' : 'publish'}: ${version}`)
  await run({
    command: 'npm',
    argList: [
      '--no-update-notifier',
      'publish', pathPackagePack,
      '--tag', isPublishDev ? 'dev' : 'latest',
      ...extraArgs
    ],
    option: { shell: true }
  }).promise
}
const getPublishFlag = (flagList) => {
  const isPublish = flagList.includes('publish')
  const isPublishDev = flagList.includes('publish-dev')
  if (isPublish && isPublishDev) throw new Error('[getPublishFlag] should not set both: isPublish, isPublishDev')
  return { isPublish, isPublishDev }
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
  initOutput,
  packOutput,
  clearOutput,
  verifyOutputBin,
  verifyNoGitignore, verifyGitStatusClean,
  publishOutput, getPublishFlag, verifyPublishVersion
}
