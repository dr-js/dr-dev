import { compileWithWebpack, commonFlag } from '@dr-js/dev/module/webpack.js'
import { runMain, commonCombo } from '@dr-js/dev/module/main.js'

runMain(async (logger) => {
  const { fromRoot, fromOutput } = commonCombo(logger)

  const { mode, isWatch, isProduction, profileOutput, namedChunkGroupOutput, getCommonWebpackConfig } = await commonFlag({
    namedChunkGroupOutput: fromOutput('library/namedChunkGroup.json'),
    fromRoot, logger
  })

  const config = getCommonWebpackConfig({
    output: { path: fromOutput('library'), filename: isProduction ? '[name].[chunkhash:8].js' : '[name].js', library: 'PACKAGE_NAME', libraryTarget: 'umd' },
    entry: { 'index': 'source/index' }
  })

  logger.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, namedChunkGroupOutput, logger })
}, 'webpack')
