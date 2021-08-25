import { resetDirectory } from '@dr-js/core/module/node/fs/Directory.js'
import { runKit, argvFlag } from '@dr-js/core/module/node/kit.js'

import { getFileListFromPathList } from 'source/node/file.js'
import { getSourceJsFileListFromPathList } from 'source/node/filePreset.js'
import { initOutput, packOutput, clearOutput, verifyOutputBin, verifyNoGitignore, verifyGitStatusClean, verifyPackageVersionStrict, publishPackage } from 'source/output.js'
import { getTerserOption, minifyFileListWithTerser } from 'source/minify.js'
import { processFileList, fileProcessorBabel } from 'source/fileProcessor.js'

import { doCheckOutdated } from 'source-bin/mode/checkOutdated.js'
import { doPackResource } from './packResource.js'

runKit(async (kit) => {
  const processOutput = async () => {
    const fileList = await getSourceJsFileListFromPathList([ 'module', 'library', 'browser', 'bin' ], kit.fromOutput)
    let sizeReduce = 0
    sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption({ isReadable: true }), kit })
    sizeReduce += await processFileList({ fileList, processor: fileProcessorBabel, kit })
    kit.padLog(`size reduce: ${sizeReduce}B`)
  }

  const packResource = async () => {
    if (!argvFlag('unsafe')) {
      kit.padLog('run check-outdated')
      await doCheckOutdated({ pathInput: kit.fromRoot('resource/'), log: kit.log })
    } else if (isPublish) throw new Error('[unsafe] should not be used when publish')
    else kit.padLog('[unsafe] skipped check-outdated')

    kit.log('clear resource package output')
    const fromResourceOutput = (...args) => kit.fromRoot('output-resource-gitignore/', ...args)
    await resetDirectory(fromResourceOutput())

    const configJSONFileList = await getFileListFromPathList([ './resource/__config__/' ], kit.fromRoot, (path) => /dev-[\w-]+\.json/.test(path))
    for (const configJSONFile of configJSONFileList) {
      const { __FLAVOR__: { name, description } } = require(configJSONFile)
      kit.padLog(`pack package ${name}`)
      await doPackResource({
        configJSONFile, fromPackOutput: (...argList) => fromResourceOutput(name, ...argList),
        packageJSONOverwrite: { name, version: packageJSON.version, description },
        isPublish, kit
      })
    }
  }

  await verifyNoGitignore({ path: kit.fromRoot('source'), kit })
  await verifyNoGitignore({ path: kit.fromRoot('source-bin'), kit })
  const packageJSON = await initOutput({ kit })
  if (!argvFlag('pack')) return

  const isPublish = argvFlag('publish')
  isPublish && verifyPackageVersionStrict(packageJSON.version)
  kit.padLog('generate spec')
  kit.RUN('npm run script-generate-spec')
  kit.padLog('build library')
  kit.RUN('npm run build-library')
  kit.padLog('build module')
  kit.RUN('npm run build-module')
  kit.padLog('build browser')
  kit.RUN('npm run build-browser')
  kit.padLog('build bin')
  kit.RUN('npm run build-bin')

  await processOutput()
  const isTest = argvFlag('test', 'publish')
  isTest && kit.padLog('lint source')
  isTest && kit.RUN('npm run lint')
  isTest && await processOutput() // once more
  isTest && kit.padLog('test output')
  isTest && kit.RUN('npm run test-output-library')
  isTest && kit.RUN('npm run test-output-module')
  isTest && kit.RUN('npm run test-output-bin')
  await clearOutput({ kit })
  await verifyOutputBin({ packageJSON, kit })
  isTest && await verifyGitStatusClean({ kit })

  await packResource()

  const pathPackagePack = await packOutput({ kit })
  isPublish && await publishPackage({ packageJSON, pathPackagePack, kit })
})
