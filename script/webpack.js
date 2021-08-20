import { compileWithWebpack, commonFlag } from 'source/webpack.js'
import { runKit } from '@dr-js/core/module/node/kit.js'

runKit(async (kit) => {
  const { mode, isWatch, profileOutput, getCommonWebpackConfig } = await commonFlag({ kit })

  const config = getCommonWebpackConfig({
    output: { path: kit.fromOutput('browser'), filename: '[name].js', library: 'DrDevTest', libraryTarget: 'umd' },
    entry: { 'test': 'source/common/test' }
  })

  kit.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, kit })
}, { title: 'webpack' })
