import { relative } from 'path'
import { clock } from 'dr-js/module/common/time'
import { binary, time, padTable } from 'dr-js/module/common/format'
import { statAsync, unlinkAsync, readFileAsync, writeFileAsync } from 'dr-js/module/node/file/function'

import { __VERBOSE__ } from './node/env'

const processFileList = async ({ fileList, processor, rootPath = '', logger }) => {
  logger.padLog(`process ${fileList.length} file`)

  const table = []
  const totalTimeStart = clock()
  let totalSizeSource = 0
  let totalSizeDelta = 0
  for (const filePath of fileList) {
    const inputString = String(await readFileAsync(filePath))
    const outputString = await processor(inputString, filePath)
    const sizeSource = (await statAsync(filePath)).size
    let sizeOutput
    if (inputString === outputString) {
      logger.devLog(`process skipped ${filePath}`)
      sizeOutput = sizeSource
    } else if (outputString) {
      await writeFileAsync(filePath, outputString)
      sizeOutput = (await statAsync(filePath)).size
    } else { // TODO: maybe not necessary to delete an empty file?
      await unlinkAsync(filePath)
      sizeOutput = 0
    }
    const sizeDelta = sizeOutput - sizeSource
    totalSizeSource += sizeSource
    totalSizeDelta += sizeDelta
    __VERBOSE__ && table.push([
      `∆ ${(100 * sizeDelta / sizeSource).toFixed(2)}% (${binary(sizeDelta)}B)`,
      `${relative(rootPath, filePath)}`
    ])
  }

  __VERBOSE__ && table.push([ '--', '--' ])
  table.push([
    `∆ ${(100 * totalSizeDelta / totalSizeSource).toFixed(2)}% (${binary(totalSizeDelta)}B)`,
    `TOTAL of ${fileList.length} file (${binary(totalSizeSource)}B|${time(clock() - totalTimeStart)})`
  ])

  logger.log(`result:\n  ${padTable({ table, padFuncList: [ 'L', 'L' ], cellPad: ' | ', rowPad: '\n  ' })}`)

  return totalSizeDelta
}

const fileProcessorBabel = (inputString) => inputString
  .replace(/['"]use strict['"];?\s*/g, '')
  .replace(/Object\.defineProperty\(exports,\s*['"]__esModule['"],\s*{\s*value:\s*(true|!0)\s*}\)[;,]?\s*/g, '')
  .replace(/(exports\.\w+\s*=\s*)+(undefined|void 0)[;,]?\s*/g, '')
  .replace(/[\n\r]{2,}/g, '\n') // remove multi-blank lines // TODO: may also change lines in `` strings
  .replace(/^[\n\r]+/, '') // remove leading blank line

// do:
//  - function(){return $a_}  =>  ()=>$a_
//  - function(){return wt.a} =>  ()=>wt.a
// don't:
//  - function(){return a}()  =>  ()=>a()
const fileProcessorWebpack = (inputString) => inputString
  .replace(/function\s*\(\)\s*{\s*return\s+([\w$]+(?:\.[\w$]+)?)\s*}([\s;)\]])/g, '()=>$1$2') // TODO: may break code?

export {
  processFileList,
  fileProcessorBabel,
  fileProcessorWebpack
}
