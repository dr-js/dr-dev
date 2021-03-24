import { getSourceJsFileListFromPathList } from '@dr-js/dev/module/node/filePreset'
import { initOutput, packOutput, clearOutput, verifyNoGitignore, verifyGitStatusClean, verifyOutputBin, publishOutput } from '@dr-js/dev/module/output'
import { getTerserOption, minifyFileListWithTerser } from '@dr-js/dev/module/minify'
import { processFileList, fileProcessorBabel } from '@dr-js/dev/module/fileProcessor'
import { runMain, argvFlag, commonCombo } from '@dr-js/dev/module/main'

runMain(async (logger) => {
  const { RUN, fromRoot, fromOutput } = commonCombo(logger)

  const buildOutput = async ({ logger }) => {
    logger.padLog('generate spec')
    RUN('npm run script-generate-spec')
    logger.padLog('build library')
    RUN('npm run build-library')
  }

  const processOutput = async ({ logger }) => {
    const fileList = await getSourceJsFileListFromPathList([ '.' ], fromOutput)
    let sizeReduce = 0
    sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption(), rootPath: fromOutput(), logger })
    sizeReduce += await processFileList({ fileList, processor: fileProcessorBabel, rootPath: fromOutput(), logger })
    logger.padLog(`size reduce: ${sizeReduce}B`)
  }

  await verifyNoGitignore({ path: fromRoot('source'), logger })
  // await verifyNoGitignore({ path: fromRoot('source-bin'), logger })
  const packageJSON = await initOutput({
    // copyMapPathList: [ [ 'source-bin/index.js', 'bin/index.js' ] ],
    fromRoot, fromOutput, logger
  })
  if (!argvFlag('pack')) return
  await buildOutput({ logger })
  await processOutput({ logger })
  const isTest = argvFlag('test', 'publish-auto', 'publish', 'publish-dev')
  isTest && logger.padLog('lint source')
  isTest && RUN('npm run lint')
  isTest && await processOutput({ logger }) // once more
  isTest && logger.padLog('test output')
  isTest && RUN('npm run test-output')
  await clearOutput({ fromOutput, logger })
  await verifyOutputBin({ fromOutput, packageJSON, logger })
  isTest && await verifyGitStatusClean({ fromRoot, logger })
  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ packageJSON, pathPackagePack, logger })
})
