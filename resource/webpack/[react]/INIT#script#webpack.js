import { compileWithWebpack, commonFlag } from '@dr-js/dev/module/webpack'
import { getWebpackBabelConfig } from '@dr-js/dev/module/babel'
import { runMain, commonCombo } from '@dr-js/dev/module/main'

runMain(async (logger) => {
  const { fromRoot, fromOutput } = commonCombo(logger)

  const { mode, isWatch, isProduction, profileOutput, namedChunkGroupOutput, getCommonWebpackConfig } = await commonFlag({
    namedChunkGroupOutput: fromOutput('library/namedChunkGroup.json'),
    fromRoot, logger
  })

  const config = getCommonWebpackConfig({
    babelOption: getWebpackBabelConfig({
      isProduction,
      extraPresetList: [ [ '@babel/preset-react', { runtime: 'automatic' } ] ] // TODO: later remove at `babel@8`: https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#manual-babel-setup
    }),
    output: { path: fromOutput('library'), filename: isProduction ? '[name].[chunkhash:8].js' : '[name].js', library: 'PACKAGE_NAME', libraryTarget: 'umd' },
    entry: { 'index': 'source/index' }
  })

  logger.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, namedChunkGroupOutput, logger })
}, 'webpack')
