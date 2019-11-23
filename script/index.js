import { resolve } from 'path'
import { execSync, spawnSync } from 'child_process'

import { binary } from '@dr-js/core/module/common/format'
import { modifyDelete } from '@dr-js/core/module/node/file/Modify'

import { getFileListFromPathList, getScriptFileListFromPathList, resetDirectory } from 'source/node/file'
import { runMain, argvFlag } from 'source/main'
import { initOutput, packOutput, verifyOutputBin, verifyNoGitignore, getPublishFlag, publishOutput } from 'source/output'
import { processFileList, fileProcessorBabel } from 'source/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'source/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const PATH_PACKAGE_OUTPUT = resolve(__dirname, '../output-package-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const fromPackageOutput = (...args) => resolve(PATH_PACKAGE_OUTPUT, ...args)
const execShell = (command) => execSync(command, { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit' })

const buildOutput = async ({ logger: { padLog } }) => {
  padLog('generate spec')
  execShell('npm run script-generate-spec')

  padLog('build library')
  execShell('npm run build-library')

  padLog('build module')
  execShell('npm run build-module')

  padLog('build browser')
  execShell('npm run build-browser')

  padLog('build bin')
  execShell('npm run build-bin')
}

const processOutput = async ({ logger }) => {
  const fileListLibraryBrowserBin = await getScriptFileListFromPathList([ 'library', 'browser', 'bin' ], fromOutput)
  const fileListModule = await getScriptFileListFromPathList([ 'module' ], fromOutput)

  let sizeReduce = 0

  sizeReduce += await minifyFileListWithTerser({ fileList: fileListLibraryBrowserBin, option: getTerserOption(), rootPath: PATH_ROOT, logger })
  sizeReduce += await minifyFileListWithTerser({ fileList: fileListModule, option: getTerserOption({ isReadable: true }), rootPath: PATH_ROOT, logger })
  sizeReduce += await processFileList({ fileList: [ ...fileListLibraryBrowserBin, ...fileListModule ], processor: fileProcessorBabel, rootPath: PATH_ROOT, logger })

  logger.padLog(`size reduce: ${binary(sizeReduce)}B`)
}

const clearOutput = async ({ logger }) => {
  logger.padLog('clear output')

  logger.log('clear test')
  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput, (path) => path.endsWith('.test.js'))
  for (const filePath of fileList) await modifyDelete(filePath)
}

const packResource = async ({ packageJSON, logger }) => {
  logger.padLog(`pack resource package: ${packageJSON.version}`)

  const { isPublish, isPublishDev } = getPublishFlag(process.argv)

  if (!argvFlag('unsafe')) {
    logger.padLog('run check-outdated')
    execShell('npm run check-outdated')
  } else if (isPublish || isPublishDev) throw new Error('[unsafe] should not be used when publish')
  else logger.padLog('[unsafe] skipped check-outdated')

  logger.padLog('clear pack')
  await resetDirectory(fromPackageOutput())

  const configFileList = await getFileListFromPathList([ './resource/__config__/' ], fromRoot, (path) => /dev-[\w-]+\.json/.test(path))
  configFileList.forEach((file) => {
    const { __EXTRA__: { name, description } } = require(file)
    logger.padLog(`pack package ${name}`)
    const { status, error } = spawnSync('node', [
      './output-gitignore/bin',
      '--pack',
      '--path-input', file,
      '--path-output', `./output-package-gitignore/${name}/`,
      '--output-version', packageJSON.version,
      '--output-name', name,
      '--output-description', description,
      isPublish && '--publish',
      isPublishDev && '--publish-dev',
      argvFlag('dry-run') && '--dry-run'
    ].filter(Boolean), { cwd: fromRoot(), stdio: 'inherit' })
    if (error || status !== 0) throw (error || new Error(`invalid exit status: ${status}`))
  })
}

runMain(async (logger) => {
  await verifyNoGitignore({ path: fromRoot('source'), logger })
  await verifyNoGitignore({ path: fromRoot('source-bin'), logger })

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  if (!argvFlag('pack')) return

  await buildOutput({ logger })

  // do not run both
  if (argvFlag('resource')) await packResource({ packageJSON, logger })
  else {
    await processOutput({ logger })

    if (argvFlag('test', 'publish', 'publish-dev')) {
      logger.padLog('lint source')
      execShell('npm run lint')

      await processOutput({ logger }) // once more

      logger.padLog('test output')
      execShell('npm run test-output-library')
      execShell('npm run test-output-module')
    }

    await clearOutput({ logger })
    await verifyOutputBin({ fromOutput, packageJSON, logger })
    const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
    await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
  }
})
