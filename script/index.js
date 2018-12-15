import { resolve } from 'path'
import { execSync, spawnSync } from 'child_process'

import { binary as formatBinary } from 'dr-js/module/common/format'
import { modify } from 'dr-js/module/node/file/Modify'

import { argvFlag, runMain } from 'source/main'
import { getLogger } from 'source/logger'
import { getFileListFromPathList, getScriptFileListFromPathList } from 'source/fileList'
import { initOutput, packOutput, verifyOutputBinVersion, getPublishFlag, checkPublishVersion, publishOutput } from 'source/commonOutput'
import { processFileList, fileProcessorBabel } from 'source/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'source/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const PATH_PACKAGE_OUTPUT = resolve(__dirname, '../output-package-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const fromPackageOutput = (...args) => resolve(PATH_PACKAGE_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit' }

const buildOutput = async ({ logger: { padLog } }) => {
  padLog('generate spec')
  execSync(`npm run script-generate-spec`, execOptionRoot)

  padLog(`build library`)
  execSync('npm run build-library', execOptionRoot)

  padLog(`build module`)
  execSync('npm run build-module', execOptionRoot)

  padLog(`build bin`)
  execSync('npm run build-bin', execOptionRoot)
}

const processOutput = async ({ packageJSON, logger }) => {
  const { padLog } = logger

  padLog(`process output`)

  const fileListLibraryBin = await getScriptFileListFromPathList([ 'library', 'bin' ], fromOutput)
  const fileListModule = await getScriptFileListFromPathList([ 'module' ], fromOutput)
  let sizeReduce = 0

  sizeReduce += await minifyFileListWithTerser({ fileList: fileListLibraryBin, option: getTerserOption(), rootPath: PATH_ROOT, logger })
  sizeReduce += await minifyFileListWithTerser({ fileList: fileListModule, option: getTerserOption({ isModule: true }), rootPath: PATH_ROOT, logger })
  sizeReduce += await processFileList({ fileList: [ ...fileListLibraryBin, ...fileListModule ], processor: fileProcessorBabel, rootPath: PATH_ROOT, logger })

  padLog(`size reduce: ${formatBinary(sizeReduce)}B`)
}

const packPackage = async ({ isPublish, isDev, packageJSON, logger }) => {
  if (argvFlag('unsafe')) {
    logger.padLog(`[unsafe] skipped check-outdated`)
    if (isPublish) throw new Error(`[unsafe] should not be used with publish`)
  } else {
    logger.padLog('run check-outdated')
    execSync(`npm run check-outdated`, execOptionRoot)
  }

  logger.padLog('clear pack')
  await modify.delete(fromPackageOutput()).catch(logger.devLog)

  const configFileList = await getFileListFromPathList([ './resource/__config__/' ], fromRoot, (path) => /dr-dev-[\w-]+\.json/.test(path))
  configFileList.forEach((file) => {
    const { __EXTRA__: { name, description } } = require(file)
    logger.padLog(`pack package ${name}`)
    spawnSync('node', [
      './output-gitignore/bin',
      '--pack',
      '--path-input', file,
      '--path-output', `./output-package-gitignore/${name}/`,
      '--output-version', packageJSON.version,
      '--output-name', name,
      '--output-description', description,
      isPublish && (isDev ? '--publish-dev' : '--publish')
    ].filter(Boolean), execOptionRoot)
  })
}

runMain(async (logger) => {
  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })
  if (!argvFlag('pack')) return

  await buildOutput({ logger })
  await processOutput({ packageJSON, logger })
  await verifyOutputBinVersion({ fromOutput, packageJSON, logger })

  // will not pack both
  if (argvFlag('pack-package')) {
    logger.padLog(`pack-package: ${packageJSON.version}`)
    const { isPublish, isDev } = getPublishFlag(process.argv)
    if (isPublish && !checkPublishVersion({ isDev, version: packageJSON.version })) throw new Error(`[pack-package] invalid version: ${packageJSON.version}`)
    await packPackage({ isPublish, isDev, packageJSON, logger })
  } else {
    const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
    await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
  }
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
