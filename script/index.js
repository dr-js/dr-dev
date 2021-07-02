import { resetDirectory } from '@dr-js/core/module/node/fs/Directory.js'
import { getFileListFromPathList } from 'source/node/file.js'
import { getSourceJsFileListFromPathList } from 'source/node/filePreset.js'
import { initOutput, packOutput, clearOutput, verifyOutputBin, verifyNoGitignore, verifyGitStatusClean, getPublishFlag, publishOutput } from 'source/output.js'
import { getTerserOption, minifyFileListWithTerser } from 'source/minify.js'
import { processFileList, fileProcessorBabel } from 'source/fileProcessor.js'
import { runMain, argvFlag, commonCombo } from 'source/main.js'

import { doCheckOutdated } from 'source-bin/mode/checkOutdated.js'

import { doPackResource } from './packResource.js'

runMain(async (logger) => {
  const { RUN, fromRoot, fromOutput } = commonCombo(logger)

  const processOutput = async ({ logger }) => {
    const fileListBrowserBin = await getSourceJsFileListFromPathList([ 'browser', 'bin' ], fromOutput)
    const fileListLibraryModule = await getSourceJsFileListFromPathList([ 'library', 'module' ], fromOutput)
    let sizeReduce = 0
    sizeReduce += await minifyFileListWithTerser({ fileList: fileListBrowserBin, option: getTerserOption(), rootPath: fromRoot(), logger })
    sizeReduce += await minifyFileListWithTerser({ fileList: fileListLibraryModule, option: getTerserOption({ isReadable: true }), rootPath: fromRoot(), logger })
    sizeReduce += await processFileList({ fileList: [ ...fileListBrowserBin, ...fileListLibraryModule ], processor: fileProcessorBabel, rootPath: fromRoot(), logger })
    logger.padLog(`size reduce: ${sizeReduce}B`)
  }

  const packResource = async ({ packageJSON: { version }, logger }) => {
    const { isPublish, isPublishDev } = getPublishFlag(process.argv, version)
    if (!argvFlag('unsafe')) {
      logger.padLog('run check-outdated')
      await doCheckOutdated({ pathInput: fromRoot('resource/'), log: logger.log })
    } else if (isPublish || isPublishDev) throw new Error('[unsafe] should not be used when publish')
    else logger.padLog('[unsafe] skipped check-outdated')

    logger.log('clear resource package output')
    const fromPackageOutput = (...args) => fromRoot('output-package-gitignore/', ...args)
    await resetDirectory(fromPackageOutput())

    const configJSONFileList = await getFileListFromPathList([ './resource/__config__/' ], fromRoot, (path) => /dev-[\w-]+\.json/.test(path))
    for (const configJSONFile of configJSONFileList) {
      const { __FLAVOR__: { name, description } } = require(configJSONFile)
      logger.padLog(`pack package ${name}`)
      await doPackResource({
        configJSONFile, pathOutput: fromPackageOutput(name),
        outputName: name, outputVersion: version, outputDescription: description,
        isPublish, isPublishDev, isDryRun: argvFlag('dry-run'),
        logger
      })
    }
  }

  await verifyNoGitignore({ path: fromRoot('source'), logger })
  await verifyNoGitignore({ path: fromRoot('source-bin'), logger })
  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })
  if (!argvFlag('pack')) return

  logger.padLog('generate spec')
  RUN('npm run script-generate-spec')
  logger.padLog('build library')
  RUN('npm run build-library')
  logger.padLog('build module')
  RUN('npm run build-module')
  logger.padLog('build browser')
  RUN('npm run build-browser')
  logger.padLog('build bin')
  RUN('npm run build-bin')

  await packResource({ packageJSON, logger })

  await processOutput({ logger })
  const isTest = argvFlag('test', 'publish-auto', 'publish', 'publish-dev')
  isTest && logger.padLog('lint source')
  isTest && RUN('npm run lint')
  isTest && await processOutput({ logger }) // once more
  isTest && logger.padLog('test output')
  isTest && RUN('npm run test-output-library')
  isTest && RUN('npm run test-output-module')
  await clearOutput({ fromOutput, logger })
  await verifyOutputBin({ fromOutput, packageJSON, logger })
  isTest && await verifyGitStatusClean({ fromRoot, logger })
  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ packageJSON, pathPackagePack, logger })
})
