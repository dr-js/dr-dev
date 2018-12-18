import { relative } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import Terser from 'terser'

import { clock } from 'dr-js/module/common/time'
import { binary, time, padTable } from 'dr-js/module/common/format'

import { __VERBOSE__ } from './main'

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
  ecma,
  toplevel,
  parse: { ecma },
  compress: { ecma, toplevel, join_vars: false, sequences: false, global_defs: globalDefineMap },
  mangle: isReadable ? false : { toplevel },
  output: isReadable ? { ecma, beautify: true, indent_level: 2, width: 240 } : { ecma, beautify: false, semicolons: false },
  sourceMap: false
})

const minifyWithTerser = ({ filePath, option, logger }) => {
  const timeStart = clock()
  const scriptSource = String(readFileSync(filePath))
  const { error, code: scriptOutput } = Terser.minify(scriptSource, option)
  if (error) {
    logger.padLog(`[minifyWithTerser] failed to minify file: ${filePath}`)
    throw error
  }
  writeFileSync(filePath, scriptOutput)

  const timeEnd = clock()
  const sizeSource = Buffer.byteLength(scriptSource)
  const sizeOutput = Buffer.byteLength(scriptOutput)

  return {
    sizeSource,
    sizeOutput,
    timeStart,
    timeEnd
  }
}

const minifyFileListWithTerser = async ({ fileList, option, rootPath = '', logger }) => {
  logger.padLog(`minify ${fileList.length} file with terser`)

  const table = []
  const totalTimeStart = clock()
  let totalSizeSource = 0
  let totalSizeDelta = 0
  for (const filePath of fileList) {
    const { sizeSource, sizeOutput, timeStart, timeEnd } = minifyWithTerser({ filePath, option, logger })
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
  minifyWithTerser,
  minifyFileListWithTerser
}
