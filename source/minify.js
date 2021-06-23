import { relative } from 'path'
import { minify as terserMinify } from 'terser'

import { clock } from '@dr-js/core/module/common/time.js'
import { binary, time, padTable } from '@dr-js/core/module/common/format.js'

import { __VERBOSE__ } from './node/env.js'
import { copyAfterEdit } from './node/file.js'

const getTerserOption = ({
  isReadable = false, // should be much more readable // TODO: option `beautify` is being removed
  isDevelopment = false,
  ecma = 8, // specify one of: 5, 6, 7 or 8; use ES8/ES2017 for native async
  toplevel = true, // enable top level variable and function name mangling and to drop unused variables and functions
  globalDefineMap = {
    '__DEV__': Boolean(isDevelopment),
    'process.env.NODE_ENV': isDevelopment ? 'development' : 'production'
  }
} = {}) => ({
  ecma, toplevel, module,
  compress: { passes: 2, join_vars: false, sequences: false, global_defs: globalDefineMap },
  mangle: isReadable ? false : { eval: true },
  output: isReadable ? { beautify: true, indent_level: 2, width: 240 } : { beautify: false, semicolons: false },
  sourceMap: false
})

const minifyFileWithTerser = async ({ filePath, option, logger }) => {
  const result = {
    timeStart: clock()
    // timeEnd: 0,
    // sizeSource: 0,
    // sizeOutput: 0
  }
  await copyAfterEdit(filePath, filePath, async (buffer) => {
    const { error, code: scriptOutput } = await terserMinify(String(buffer), option)
    if (error) {
      logger.padLog(`[minifyFileWithTerser] failed to minify file: ${filePath}`)
      throw error
    }
    const bufferOutput = Buffer.from(scriptOutput)
    result.timeEnd = clock()
    result.sizeSource = buffer.length
    result.sizeOutput = bufferOutput.length
    return bufferOutput
  })
  return result
}

const minifyFileListWithTerser = async ({ fileList, option, rootPath = '', logger }) => {
  logger.padLog(`minify ${fileList.length} file with terser`)

  const table = []
  const totalTimeStart = clock()
  let totalSizeSource = 0
  let totalSizeDelta = 0
  for (const filePath of fileList) {
    const { sizeSource, sizeOutput, timeStart, timeEnd } = await minifyFileWithTerser({ filePath, option, logger })
    const sizeDelta = sizeOutput - sizeSource
    totalSizeSource += sizeSource
    totalSizeDelta += sizeDelta
    __VERBOSE__ && table.push([
      `∆ ${(100 * sizeDelta / sizeSource).toFixed(2)}% (${binary(sizeDelta)}B)`,
      time(timeEnd - timeStart),
      `${relative(rootPath, filePath)}`
    ])
  }
  __VERBOSE__ && table.push([ '--', '--', '--' ])
  table.push([
    `∆ ${(100 * totalSizeDelta / totalSizeSource).toFixed(2)}% (${binary(totalSizeDelta)}B)`,
    time(clock() - totalTimeStart),
    `TOTAL of ${fileList.length} file (${binary(totalSizeSource)}B)`
  ])

  logger.log(`result:\n  ${padTable({ table, padFuncList: [ 'L', 'R', 'L' ], cellPad: ' | ', rowPad: '\n  ' })}`)

  return totalSizeDelta
}

export {
  getTerserOption,
  minifyFileWithTerser,
  minifyFileListWithTerser
}
