import { compileWithWebpack, commonFlag } from 'source/webpack'
import { runMain, commonCombo } from 'source/main'

runMain(async (logger) => {
  const { fromRoot, fromOutput } = commonCombo(logger)

  const { mode, isWatch, profileOutput, getCommonWebpackConfig } = await commonFlag({ fromRoot, logger })

  const config = getCommonWebpackConfig({
    output: { path: fromOutput('browser'), filename: '[name].js', library: 'DrDevTest', libraryTarget: 'umd' },
    entry: { 'test': 'source/common/test' }
  })

  logger.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, logger })
}, 'webpack')
