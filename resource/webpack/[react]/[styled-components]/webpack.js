import { resolve } from 'path'

import { argvFlag, runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'
import { compileWithWebpack, commonFlag } from 'dr-dev/module/webpack'
import { getWebpackBabelConfig } from 'dr-dev/module/babel'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)

runMain(async (logger) => {
  const { mode, isWatch, isProduction, profileOutput, namedChunkGroupOutput, getCommonWebpackConfig } = await commonFlag({
    namedChunkGroupOutput: fromOutput('library/namedChunkGroup.json'),
    fromRoot,
    logger
  })

  const config = getCommonWebpackConfig({
    babelOption: getWebpackBabelConfig({
      isProduction,
      extraPresetList: [ [ '@babel/react' ] ],
      extraPluginList: [ [ 'styled-components' ] ]
    }),
    output: { path: fromOutput('library'), filename: isProduction ? '[name].[chunkhash:8].js' : '[name].js', library: 'PACKAGE_NAME', libraryTarget: 'umd' },
    entry: { 'index': 'source/index' }
  })

  logger.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, namedChunkGroupOutput, logger })
}, getLogger(`webpack`, argvFlag('quiet')))
