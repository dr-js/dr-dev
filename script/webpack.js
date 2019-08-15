import { resolve } from 'path'

import { runMain } from 'source/main'
import { compileWithWebpack, commonFlag } from 'source/webpack'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)

runMain(async (logger) => {
  const { mode, isWatch, profileOutput, getCommonWebpackConfig } = await commonFlag({ fromRoot, logger })

  const config = getCommonWebpackConfig({
    output: { path: fromOutput('browser'), filename: '[name].js', library: 'DrDevTest', libraryTarget: 'umd' },
    entry: { 'test': 'source/common/test' },
    extraDefine: { __ENV_NODE__: false }
  })

  logger.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, logger })
}, 'webpack')
