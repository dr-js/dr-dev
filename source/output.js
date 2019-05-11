import { ok } from 'assert'
import { execSync } from 'child_process'
import { statSync, readFileSync, writeFileSync } from 'fs'
import { binary } from 'dr-js/module/common/format'
import { createDirectory } from 'dr-js/module/node/file/File'
import { getFileList } from 'dr-js/module/node/file/Directory'
import { runSync } from 'dr-js/module/node/system/Run'
import { modify } from 'dr-js/module/node/file/Modify'

import { __VERBOSE__ } from './node/env'
import { writeLicenseFile } from './license'

const initOutput = async ({
  fromRoot,
  fromOutput,
  deleteKeyList = [ 'private', 'scripts', 'devDependencies' ],
  copyPathList = [ 'LICENSE', 'README.md' ],
  copyMapPathList = [],
  replaceReadmeNonPackageContent = '\n\nmore in source `README.md`', // set to false to skip
  pathLicenseFile = fromRoot('LICENSE'), // set to false to skip
  logger: { padLog, log }
}) => {
  padLog('reset output')
  await modify.delete(fromOutput()).catch(() => {})
  await createDirectory(fromOutput())

  padLog(`init output package.json`)
  const packageJSON = require(fromRoot('package.json'))
  for (const deleteKey of deleteKeyList) {
    delete packageJSON[ deleteKey ]
    log(`dropped key: ${deleteKey}`)
  }
  writeFileSync(fromOutput('package.json'), JSON.stringify(packageJSON))

  padLog(`init output file`)
  for (const [ pathFrom, pathTo ] of [ ...copyPathList.map((v) => [ v, v ]), ...copyMapPathList ]) {
    if (replaceReadmeNonPackageContent && pathFrom.endsWith('README.md')) { // change README.md NON_PACKAGE_CONTENT
      const packageContentList = readFileSync(fromRoot(pathFrom)).toString().split('[//]: # (NON_PACKAGE_CONTENT)')
      if (packageContentList.length >= 2) {
        writeFileSync(fromOutput(pathTo), `${packageContentList[ 0 ].trim()}${replaceReadmeNonPackageContent}`)
        log(`copied: ${pathFrom} (with NON_PACKAGE_CONTENT replaced to: ${JSON.stringify(replaceReadmeNonPackageContent)})`)
        continue
      }
    }
    await modify.copy(fromRoot(pathFrom), fromOutput(pathTo))
    log(`copied: ${pathFrom}`)
  }

  const { license, author } = packageJSON
  if (pathLicenseFile && license && author) {
    padLog(`update license file`)
    writeLicenseFile(pathLicenseFile, license, author)
  }

  return packageJSON
}

const packOutput = async ({
  fromRoot,
  fromOutput,
  logger: { padLog, log }
}) => {
  padLog('run pack output')
  execSync('npm --no-update-notifier pack', { cwd: fromOutput(), stdio: __VERBOSE__ ? 'inherit' : [ 'ignore', 'ignore' ], shell: true })

  log('move to root path')
  const packageJSON = require(fromOutput('package.json'))
  const packName = `${packageJSON.name.replace(/^@/, '').replace('/', '-')}-${packageJSON.version}.tgz`
  await modify.move(fromOutput(packName), fromRoot(packName))
  padLog(`pack size: ${binary(statSync(fromRoot(packName)).size)}B`)

  return fromRoot(packName)
}

const verifyOutputBinVersion = async ({
  fromOutput,
  packageJSON, // optional if directly set `matchStringList`
  matchStringList = [ packageJSON.name, packageJSON.version ],
  logger: { padLog, log }
}) => {
  padLog('verify output bin working')
  const outputBinTest = execSync('node bin --version', { cwd: fromOutput(), stdio: 'pipe', shell: true }).toString()
  log(`bin test output: ${outputBinTest}`)
  for (const testString of matchStringList) ok(outputBinTest.includes(testString), `should output contain: ${testString}`)
}

const verifyNoGitignore = async ({ path, logger: { padLog } }) => {
  padLog(`verify no gitignore file left`)
  const badFileList = (await getFileList(path)).filter((path) => path.includes('gitignore'))
  badFileList.length && console.error(`found gitignore file:\n - ${badFileList.join('\n - ')}`)
  ok(!badFileList.length, `${badFileList.length} gitignore file found`)
}

const getPublishFlag = (flagList) => {
  const isDev = flagList.includes('publish-dev')
  const isPublish = isDev || flagList.includes('publish')
  return { isPublish, isDev }
}

const checkPublishVersion = ({ isDev, version }) => isDev
  ? REGEXP_PUBLISH_VERSION_DEV.test(version)
  : REGEXP_PUBLISH_VERSION.test(version)
const REGEXP_PUBLISH_VERSION = /^\d+\.\d+\.\d+$/ // 0.0.0
const REGEXP_PUBLISH_VERSION_DEV = /^\d+\.\d+\.\d+-dev\.\d+$/ // 0.0.0-dev.0

const publishOutput = async ({
  flagList,
  packageJSON,
  pathPackagePack, // the .tgz output of pack
  extraArgs = [],
  logger
}) => {
  const { isPublish, isDev } = getPublishFlag(flagList)
  if (!isPublish) return logger.padLog(`skipped publish output, no flag found`)
  if (!pathPackagePack || !pathPackagePack.endsWith('.tgz')) throw new Error(`[publishOutput] invalid pathPackagePack: ${pathPackagePack}`)
  if (!checkPublishVersion({ isDev, version: packageJSON.version })) throw new Error(`[publishOutput] invalid version: ${packageJSON.version}, isDev: ${isDev}`)
  logger.padLog(`${isDev ? 'publish-dev' : 'publish'}: ${packageJSON.version}`)
  runSync({ command: 'npm', argList: [ '--no-update-notifier', 'publish', pathPackagePack, '--tag', isDev ? 'dev' : 'latest', ...extraArgs ] })
}

export {
  initOutput,
  packOutput,
  verifyOutputBinVersion,
  verifyNoGitignore,
  getPublishFlag,
  checkPublishVersion,
  publishOutput
}
