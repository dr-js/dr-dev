import { runKit } from '@dr-js/core/module/node/kit.js'
import { compileWithWebpack, commonFlag } from '@dr-js/dev/module/webpack.js'

runKit(async (kit) => {
  const { mode, isWatch, isProduction, profileOutput, namedChunkGroupOutput, getCommonWebpackConfig } = await commonFlag({
    namedChunkGroupOutput: kit.fromOutput('library/namedChunkGroup.json'),
    kit
  })

  const config = getCommonWebpackConfig({
    output: { path: kit.fromOutput('library'), filename: isProduction ? '[name].[chunkhash:8].js' : '[name].js', library: 'PACKAGE_NAME', libraryTarget: 'umd' },
    entry: { 'index': 'source/index' }
  })

  kit.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, namedChunkGroupOutput, kit })
}, { title: 'webpack' })
