import { dirname } from 'path'
import { writeFileSync } from 'fs'
import webpack from 'webpack'

import { binary, time, padTable } from '@dr-js/core/module/common/format'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { addExitListenerSync } from '@dr-js/core/module/node/system/ExitListener'

import { __VERBOSE__, argvFlag } from './node/env'
import { getWebpackBabelConfig } from './babel'

// https://webpack.js.org/api/stats/

const getStatsCheck = (onError, onStats) => (error, stats) => {
  if (error) return onError(error)
  const isErrorLog = stats.hasErrors()
  const isWarningLog = stats.hasWarnings()
  if (isErrorLog || isWarningLog) {
    const { errors = [], warnings = [] } = stats.toJson({
      all: false, // fallback value for stats options when an option is not defined (has precedence over local webpack defaults)
      errors: true, // Add errors
      errorDetails: true, // Add details to errors (like resolving log)
      warnings: true // Add warnings
    })
    errors.forEach((message) => console.error(message))
    warnings.forEach((message) => console.warn(message))
    if (isErrorLog) return onError(new Error('webpack stats Error'))
  }
  onStats(stats)
}

const getLogStats = (isWatch, { padLog, log }) => {
  const logSingleStats = (statsData, startTime, endTime) => {
    startTime && endTime && padLog(`[${isWatch ? 'watch' : 'compile'}] time: ${time(endTime - startTime)}`)

    const { assets, chunks } = statsData.toJson({
      all: false, // fallback value for stats options when an option is not defined (has precedence over local webpack defaults)
      assets: true, // Add asset Information
      chunks: __VERBOSE__ // Add chunk information (setting this to `false` allows for a less verbose output)
    })

    const table = []
    assets.forEach(({ name, size, emitted }) => table.push([
      `  Asset ${name}`,
      formatSize(size),
      formatTag({ emitted })
    ]))
    __VERBOSE__ && chunks.forEach(({ id, names, size, entry, initial, rendered }) => table.push([
      `  Chunk ${id}${names.length ? ' ' : ''}${names.join(',')}`,
      formatSize(size),
      formatTag({ entry, initial, rendered })
    ]))
    log(`output:\n${padTable({ table, padFuncList: [ 'L', 'R', 'L' ] })}`)
  }

  return (stats) => {
    if (stats.compilation) return logSingleStats(stats) // Stats (for single config)
    if (stats.stats) return stats.stats.map(logSingleStats) // MultiStats (for more than one config)
    console.warn(`[getLogStats] unexpected statData`, stats)
    throw new Error(`[getLogStats] unexpected statData`)
  }
}
const formatSize = (size) => `${binary(size)}B`
const formatTag = (tagMap) => Object.entries(tagMap).map(([ k, v ]) => v && k).filter(Boolean).join(',')

const compileWithWebpack = async ({ config, isWatch, profileOutput, namedChunkGroupOutput, logger }) => {
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
    const stats = await new Promise((resolve, reject) => compiler.run(getStatsCheck(reject, resolve)))
    logStats(stats)
    let statsJSON
    const getStatsJSON = () => {
      if (statsJSON === undefined) statsJSON = stats.toJson('verbose') // all data
      return statsJSON
    }
    if (profileOutput) {
      await createDirectory(dirname(profileOutput))
      writeFileSync(profileOutput, JSON.stringify(getStatsJSON()))
      log(`[compile] generated profileOutput at: ${profileOutput}`)
    }
    if (namedChunkGroupOutput) {
      await createDirectory(dirname(namedChunkGroupOutput))
      const { namedChunkGroups, children } = getStatsJSON() // for MultiStats, should check each Stats in statsJSON.children
      writeFileSync(namedChunkGroupOutput, JSON.stringify(
        namedChunkGroups ||
        (children && children.map(({ name, namedChunkGroups }) => ({ name, namedChunkGroups }))) ||
        {}
      ))
      log(`[compile] generated namedChunkGroupOutput at: ${namedChunkGroupOutput}`)
    }
    return stats
  }
}

const commonFlag = async ({
  fromRoot, // optional if directly set `profileOutput`
  mode = argvFlag('development', 'production') || 'production',
  isWatch = Boolean(argvFlag('watch')),
  isProduction = mode === 'production',
  profileOutput = argvFlag('profile') ? fromRoot('.temp-gitignore/profile-stat.json') : null,
  namedChunkGroupOutput = '',
  logger: { log }
}) => {
  log(`compile flag: ${JSON.stringify({ mode, isWatch, isProduction, profileOutput, namedChunkGroupOutput }, null, '  ')}`)

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
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        __DEV__: !isProduction,
        ...extraDefine
      }),
      isNodeBin && new webpack.BannerPlugin({ banner: `#!/usr/bin/env node`, raw: true }),
      ...extraPluginList
    ].filter(Boolean),
    optimization: { minimize: isMinimize },
    performance: { hints: isMinimize }, // mute: `The following asset(s) exceed the recommended size limit (250 kB).`
    ...extraConfig
  })

  return { mode, isWatch, isProduction, profileOutput, namedChunkGroupOutput, getCommonWebpackConfig }
}

export {
  compileWithWebpack,
  commonFlag
}
