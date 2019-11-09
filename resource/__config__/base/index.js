import { resolve } from 'path'
import { execSync } from 'child_process'

import { binary } from '@dr-js/core/module/common/format'
import { getFileList } from '@dr-js/core/module/node/file/Directory'
import { modifyCopy } from '@dr-js/core/module/node/file/Modify'

import { runMain, argvFlag } from '@dr-js/dev/module/main'
import { initOutput, packOutput, verifyOutputBinVersion, publishOutput } from '@dr-js/dev/module/output'
import { processFileList, fileProcessorBabel } from '@dr-js/dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from '@dr-js/dev/module/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execShell = (command) => execSync(command, { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit' })

runMain(async (logger) => {
  const { padLog, log } = logger

  padLog('generate spec')
  execShell('npm run script-generate-spec')

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  padLog('copy bin')
  await modifyCopy(fromRoot('source-bin/index.js'), fromOutput('bin/index.js'))

  if (!argvFlag('pack')) return

  padLog('build library')
  execShell('npm run build-library')

  const fileListOutput = [
    ...await getFileList(fromOutput())
  ].filter((path) => path.endsWith('.js') && !path.endsWith('.test.js'))

  let sizeCodeReduce = 0

  padLog('minify output')
  sizeCodeReduce += await minifyFileListWithTerser({ fileList: fileListOutput, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })

  padLog('process code')
  sizeCodeReduce += await processFileList({ fileList: fileListOutput, processor: fileProcessorBabel, rootPath: PATH_ROOT, logger })

  log(`total size reduce: ${binary(sizeCodeReduce)}B`)

  await verifyOutputBinVersion({ fromOutput, packageJSON, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
})
