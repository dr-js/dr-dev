import { resolve } from 'path'
import { execSync } from 'child_process'

import { runSync } from '@dr-js/core/module/node/run'

import { getFileListFromPathList, resetDirectory } from 'source/node/file'
import { getSourceJsFileListFromPathList } from 'source/node/filePreset'
import { initOutput, packOutput, clearOutput, verifyOutputBin, verifyNoGitignore, verifyGitStatusClean, getPublishFlag, publishOutput } from 'source/output'
import { getTerserOption, minifyFileListWithTerser } from 'source/minify'
import { processFileList, fileProcessorBabel } from 'source/fileProcessor'
import { runMain, argvFlag } from 'source/main'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const PATH_PACKAGE_OUTPUT = resolve(__dirname, '../output-package-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const fromPackageOutput = (...args) => resolve(PATH_PACKAGE_OUTPUT, ...args)
const execShell = (command) => execSync(command, { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit' })

const buildOutput = async ({ logger }) => {
  logger.padLog('generate spec')
  execShell('npm run script-generate-spec')
  logger.padLog('build library')
  execShell('npm run build-library')
  logger.padLog('build module')
  execShell('npm run build-module')
  logger.padLog('build browser')
  execShell('npm run build-browser')
  logger.padLog('build bin')
  execShell('npm run build-bin')
}

const processOutput = async ({ logger }) => {
  const fileListLibraryBrowserBin = await getSourceJsFileListFromPathList([ 'library', 'browser', 'bin' ], fromOutput)
  const fileListModule = await getSourceJsFileListFromPathList([ 'module' ], fromOutput)
  let sizeReduce = 0
  sizeReduce += await minifyFileListWithTerser({ fileList: fileListLibraryBrowserBin, option: getTerserOption(), rootPath: PATH_ROOT, logger })
  sizeReduce += await minifyFileListWithTerser({ fileList: fileListModule, option: getTerserOption({ isReadable: true }), rootPath: PATH_ROOT, logger })
  sizeReduce += await processFileList({ fileList: [ ...fileListLibraryBrowserBin, ...fileListModule ], processor: fileProcessorBabel, rootPath: PATH_ROOT, logger })
  logger.padLog(`size reduce: ${sizeReduce}B`)
}

const packResource = async ({ packageJSON: { version }, logger }) => {
  const { isPublish, isPublishDev } = getPublishFlag(process.argv, version)
  logger.padLog(`pack resource package: ${version}, isPublish: ${isPublish}, isPublishDev: ${isPublishDev}`)

  if (!argvFlag('unsafe')) {
    logger.padLog('run check-outdated')
    execShell('npm run check-outdated')
  } else if (isPublish || isPublishDev) throw new Error('[unsafe] should not be used when publish')
  else logger.padLog('[unsafe] skipped check-outdated')

  logger.log('clear pack')
  await resetDirectory(fromPackageOutput())

  const configFileList = await getFileListFromPathList([ './resource/__config__/' ], fromRoot, (path) => /dev-[\w-]+\.json/.test(path))
  configFileList.forEach((file) => {
    const { __FLAVOR__: { name, description } } = require(file)
    logger.padLog(`pack package ${name}`)
    runSync([ process.execPath, './output-gitignore/bin',
      '--pack',
      '--path-input', file,
      '--path-output', `./output-package-gitignore/${name}/`,
      '--output-version', version,
      '--output-name', name,
      '--output-description', description,
      isPublish && '--publish',
      isPublishDev && '--publish-dev',
      argvFlag('dry-run') && '--dry-run'
    ].filter(Boolean), { cwd: fromRoot() })
  })
}

runMain(async (logger) => {
  await verifyNoGitignore({ path: fromRoot('source'), logger })
  await verifyNoGitignore({ path: fromRoot('source-bin'), logger })
  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })
  if (!argvFlag('pack')) return
  await buildOutput({ logger })
  if (argvFlag('resource')) return packResource({ packageJSON, logger }) // do not run both
  await processOutput({ logger })
  const isTest = argvFlag('test', 'publish-auto', 'publish', 'publish-dev')
  isTest && logger.padLog('lint source')
  isTest && execShell('npm run lint')
  isTest && await processOutput({ logger }) // once more
  isTest && logger.padLog('test output')
  isTest && execShell('npm run test-output-library')
  isTest && execShell('npm run test-output-module')
  await clearOutput({ fromOutput, logger })
  await verifyOutputBin({ fromOutput, packageJSON, logger })
  isTest && await verifyGitStatusClean({ fromRoot, logger })
  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ packageJSON, pathPackagePack, logger })
})
