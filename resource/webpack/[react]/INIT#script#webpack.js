import { runKit } from '@dr-js/core/module/node/kit.js'
import { compileWithWebpack, commonFlag } from '@dr-js/dev/module/webpack.js'
import { getWebpackBabelConfig } from '@dr-js/dev/module/babel.js'

runKit(async (kit) => {
  const { mode, isWatch, isProduction, profileOutput, namedChunkGroupOutput, getCommonWebpackConfig } = await commonFlag({
    namedChunkGroupOutput: kit.fromOutput('library/namedChunkGroup.json'),
    kit
  })

  const config = getCommonWebpackConfig({
    babelOption: getWebpackBabelConfig({
      isProduction,
      extraPresetList: [ [ '@babel/preset-react', { runtime: 'automatic' } ] ] // TODO: later remove at `babel@8`: https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#manual-babel-setup
    }),
    output: { path: kit.fromOutput('library'), filename: isProduction ? '[name].[chunkhash:8].js' : '[name].js', library: 'PACKAGE_NAME', libraryTarget: 'umd' },
    entry: { 'index': 'source/index' }
  })

  kit.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, namedChunkGroupOutput, kit })
}, { title: 'webpack' })
