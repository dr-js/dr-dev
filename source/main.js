import { resolve, sep } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { isString } from '@dr-js/core/module/common/check.js'
import { getKit, runKit } from '@dr-js/core/module/node/kit.js'

const runMain = (
  mainAsyncFunc,
  kitLoggerOrTitle = process.argv.slice(2).join('+'),
  ...args
) => runKit(
  (kit) => mainAsyncFunc(kit, ...args),
  isString(kitLoggerOrTitle)
    ? { title: kitLoggerOrTitle }
    : { kit: { ...getKit(), ...kitLoggerOrTitle } }
)

export {
  runMain, // TODO: DEPRECATE
  // quick import // TODO: DEPRECATE: move to `combo.js`
  resolve, sep, readFileSync, writeFileSync, existsSync // TODO: DEPRECATE
}

export { commonCombo } from './output.js' // TODO: DEPRECATE
export { runInfoPatchCombo, commonInfoPatchCombo } from './ci.js' // TODO: DEPRECATE
export { argvFlag } from '@dr-js/core/module/node/kit.js' // TODO: DEPRECATE
