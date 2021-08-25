import { runKit, argvFlag } from '@dr-js/core/module/node/kit.js'

import { getSourceJsFileListFromPathList } from '@dr-js/dev/module/node/filePreset.js'
import { initOutput, packOutput, clearOutput, verifyNoGitignore, verifyGitStatusClean, verifyOutputBin, verifyPackageVersionStrict, publishPackage } from '@dr-js/dev/module/output.js'
import { getTerserOption, minifyFileListWithTerser } from '@dr-js/dev/module/minify.js'
import { processFileList, fileProcessorBabel } from '@dr-js/dev/module/fileProcessor.js'

runKit(async (kit) => {
  const processOutput = async () => {
    const fileList = await getSourceJsFileListFromPathList([ '.' ], kit.fromOutput)
    let sizeReduce = 0
    sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption(), kit })
    sizeReduce += await processFileList({ fileList, processor: fileProcessorBabel, kit })
    kit.padLog(`size reduce: ${sizeReduce}B`)
  }

  await verifyNoGitignore({ path: kit.fromRoot('source'), kit })
  // await verifyNoGitignore({ path: fromRoot('source-bin'), kit })
  const packageJSON = await initOutput({
    // copyMapPathList: [ [ 'source-bin/index.js', 'bin/index.js' ] ],
    kit
  })
  if (!argvFlag('pack')) return

  const isPublish = argvFlag('publish')
  isPublish && verifyPackageVersionStrict(packageJSON.version)
  kit.padLog('generate spec')
  kit.RUN('npm run script-generate-spec')
  kit.padLog('build library')
  kit.RUN('npm run build-library')

  await processOutput()
  const isTest = argvFlag('test', 'publish')
  isTest && kit.padLog('lint source')
  isTest && kit.RUN('npm run lint')
  isTest && await processOutput() // once more
  isTest && kit.padLog('test output')
  isTest && kit.RUN('npm run test-output')
  await clearOutput({ kit })
  await verifyOutputBin({ packageJSON, kit })
  isTest && await verifyGitStatusClean({ kit })
  const pathPackagePack = await packOutput({ kit })
  isPublish && await publishPackage({ packageJSON, pathPackagePack, kit })
})
