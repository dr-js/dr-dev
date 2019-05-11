import { resolve } from 'path'
import { execSync } from 'child_process'

import { binary } from 'dr-js/module/common/format'
import { getFileList } from 'dr-js/module/node/file/Directory'
import { modify } from 'dr-js/module/node/file/Modify'

import { runMain, argvFlag } from 'dr-dev/module/main'
import { initOutput, packOutput, verifyOutputBinVersion, publishOutput } from 'dr-dev/module/output'
import { processFileList, fileProcessorBabel } from 'dr-dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dr-dev/module/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

runMain(async (logger) => {
  const { padLog, log } = logger

  padLog('generate spec')
  execSync(`npm run script-generate-spec`, execOptionRoot)

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  padLog(`copy bin`)
  await modify.copy(fromRoot('source-bin/index.js'), fromOutput('bin/index.js'))

  if (!argvFlag('pack')) return

  padLog(`build library`)
  execSync('npm run build-library', execOptionRoot)

  const fileListOutput = [
    ...await getFileList(fromOutput())
  ].filter((path) => path.endsWith('.js') && !path.endsWith('.test.js'))

  let sizeCodeReduce = 0

  padLog(`minify output`)
  sizeCodeReduce += await minifyFileListWithTerser({ fileList: fileListOutput, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })

  padLog(`process code`)
  sizeCodeReduce += await processFileList({ fileList: fileListOutput, processor: fileProcessorBabel, rootPath: PATH_ROOT, logger })

  log(`total size reduce: ${binary(sizeCodeReduce)}B`)

  await verifyOutputBinVersion({ fromOutput, packageJSON, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
})
