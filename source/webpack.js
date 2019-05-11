import { dirname } from 'path'
import { writeFileSync } from 'fs'
import webpack, { BannerPlugin, DefinePlugin } from 'webpack'

import { binary, time, padTable } from 'dr-js/module/common/format'
import { createDirectory } from 'dr-js/module/node/file/File'
import { addExitListenerSync } from 'dr-js/module/node/system/ExitListener'

import { __VERBOSE__, argvFlag } from './node/env'
import { getWebpackBabelConfig } from './babel'

const getStatsCheck = (onError, onStats) => (error, statsData) => {
  if (error) return onError(error)
  if (statsData.hasErrors() || statsData.hasWarnings()) {
    const { errors = [], warnings = [] } = statsData.toJson() // https://webpack.js.org/api/stats/
    errors.forEach((message) => console.error(message))
    warnings.forEach((message) => console.warn(message))
    if (statsData.hasErrors()) return onError(new Error('webpack stats Error'))
  }
  onStats(statsData)
}

const getLogStats = (isWatch, { padLog, log }) => {
  const logSingleStats = ({ compilation: { assets = {}, chunks = [] }, startTime, endTime }) => {
    startTime && endTime && padLog(`[${isWatch ? 'watch' : 'compile'}] time: ${time(endTime - startTime)}`)

    const table = []
    Object.entries(assets).forEach(([ name, sourceInfo ]) => table.push([
      'asset',
      name,
      `${binary(sourceInfo.size())}B`,
      joinTag(sourceInfo.emitted && 'emitted')
    ]))
    __VERBOSE__ && chunks.forEach((chunk) => table.push([
      'chunk',
      chunk.name || chunk.id,
      `${binary(chunk.modulesSize())}B`,
      joinTag(chunk.canBeInitial() && 'initial', chunk.hasRuntime() && 'entry', chunk.rendered && 'rendered')
    ]))

    log(`output:\n  ${padTable({ table, padFuncList: [ 'L', 'R', 'R', 'L' ], cellPad: ' | ', rowPad: '\n  ' })}`)
  }

  return (statsData) => {
    if (statsData.compilation) return logSingleStats(statsData) // Stats
    if (statsData.stats) return statsData.stats.map(logSingleStats) // MultiStats
    console.warn(`[getLogStats] unexpected statData`, statsData)
    throw new Error(`[getLogStats] unexpected statData`)
  }
}
const joinTag = (...args) => args.filter(Boolean).join(',')

const compileWithWebpack = async ({ config, isWatch, profileOutput, assetMapOutput, logger }) => {
  const { log } = logger
  if (profileOutput) {
    isWatch && console.warn(`[watch] warning: skipped generate profileOutput`)
    config.profile = true
  }

  const compiler = webpack(config)
  const logStats = getLogStats(isWatch, logger)

  if (isWatch) {
    log(`[watch] start`)
    compiler.watch({ aggregateTimeout: 512, poll: undefined }, getStatsCheck((error) => log(`error: ${error}`), logStats))
    addExitListenerSync((exitState) => log(`[watch] exit with state: ${JSON.stringify(exitState)}`))
  } else {
    log(`[compile] start`)
    const statsData = await new Promise((resolve, reject) => compiler.run(getStatsCheck(reject, resolve)))
    logStats(statsData)
    let statsDataObject
    const getStatsDataObject = () => {
      if (statsDataObject === undefined) statsDataObject = statsData.toJson()
      return statsDataObject
    }
    profileOutput && writeFileSync(profileOutput, JSON.stringify(getStatsDataObject()))
    profileOutput && log(`[compile] generated profileOutput at: ${profileOutput}`)
    assetMapOutput && writeFileSync(assetMapOutput, JSON.stringify(getStatsDataObject()[ 'assetsByChunkName' ] || {}))
    assetMapOutput && log(`[compile] generated assetMapOutput at: ${assetMapOutput}`)
    return statsData
  }
}

const commonFlag = async ({
  fromRoot, // optional if directly set `profileOutput`
  mode = argvFlag('development', 'production') || 'production',
  isWatch = Boolean(argvFlag('watch')),
  isProduction = mode === 'production',
  profileOutput = argvFlag('profile') ? fromRoot('.temp-gitignore/profile-stat.json') : null,
  assetMapOutput = '',
  logger: { log }
}) => {
  profileOutput && await createDirectory(dirname(profileOutput))
  assetMapOutput && await createDirectory(dirname(assetMapOutput))
  log(`compile flag: ${JSON.stringify({ mode, isWatch, isProduction, profileOutput, assetMapOutput }, null, '  ')}`)

  const getCommonWebpackConfig = ({
    babelOption = getWebpackBabelConfig({ isProduction }),
    output, // = { path: fromOutput('library'), filename: '[name].js', library: 'LIBRARY', libraryTarget: 'umd' },
    entry, // = { index: 'source/index' },
    resolve = { alias: { source: fromRoot('source') } },
    externals = undefined,
    isNodeEnv = false,
    isNodeBin = false, // add `#!/usr/bin/env node`
    isMinimize = false,
    extraPluginList = [],
    extraDefine = {},
    ...extraConfig
  }) => ({
    mode,
    bail: isProduction,
    target: isNodeEnv ? 'node' : 'web', // support node main modules like 'fs'
    node: isNodeEnv ? false : undefined, // do not polyfill fake node environment when build for node
    output,
    entry,
    resolve,
    externals,
    module: { rules: [ { test: /\.js$/, use: { loader: 'babel-loader', options: babelOption } } ] },
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        __DEV__: !isProduction,
        ...extraDefine
      }),
      isNodeBin && new BannerPlugin({ banner: `#!/usr/bin/env node`, raw: true }),
      ...extraPluginList
    ].filter(Boolean),
    optimization: { minimize: isMinimize },
    performance: { hints: isMinimize }, // mute: `The following asset(s) exceed the recommended size limit (250 kB).`
    ...extraConfig
  })

  return { mode, isWatch, isProduction, profileOutput, assetMapOutput, getCommonWebpackConfig }
}

export {
  compileWithWebpack,
  commonFlag
}
