import { resolve, sep } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { isString } from '@dr-js/core/module/common/check.js'
import { getKit, runKit, argvFlag } from '@dr-js/core/module/node/kit.js'

import { runInfoPatchCombo } from './ci.js'

/** @deprecated */ const runMain = (
  mainAsyncFunc,
  kitLoggerOrTitle = process.argv.slice(2).join('+'),
  ...args
) => runKit(
  (kit) => mainAsyncFunc(kit, ...args),
  isString(kitLoggerOrTitle)
    ? { title: kitLoggerOrTitle }
    : { kit: { ...getKit(), ...kitLoggerOrTitle } }
)

/** @deprecated */ const resolveExport = resolve // TODO: DEPRECATE
/** @deprecated */ const sepExport = sep // TODO: DEPRECATE
/** @deprecated */ const readFileSyncExport = readFileSync // TODO: DEPRECATE
/** @deprecated */ const writeFileSyncExport = writeFileSync // TODO: DEPRECATE
/** @deprecated */ const existsSyncExport = existsSync // TODO: DEPRECATE

/** @deprecated */ const runInfoPatchComboExport = runInfoPatchCombo // TODO: DEPRECATE
/** @deprecated */ const argvFlagExport = argvFlag // TODO: DEPRECATE

export {
  runMain, // TODO: DEPRECATE
  // quick import // TODO: DEPRECATE: move to `combo.js`
  resolveExport as resolve, sepExport as sep, readFileSyncExport as readFileSync, writeFileSyncExport as writeFileSync, existsSyncExport as existsSync, // TODO: DEPRECATE
  runInfoPatchComboExport as runInfoPatchCombo, // TODO: DEPRECATE
  argvFlagExport as argvFlag // TODO: DEPRECATE
}

export { commonCombo } from './output.js' // TODO: DEPRECATE
export { commonInfoPatchCombo } from './ci.js' // TODO: DEPRECATE
