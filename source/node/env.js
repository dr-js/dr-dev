import {
  ENV_KEY_VERBOSE,
  loadEnvKey,
  saveEnvKey,
  syncEnvKey,
  argvFlag
} from '@dr-js/core/module/node/kit.js'

/** @deprecated */ const __VERBOSE__ = syncEnvKey('__DEV_VERBOSE__', Boolean(
  process.argv.includes('verbose') ||
  loadEnvKey(ENV_KEY_VERBOSE) ||
  process.env.KIT_VERBOSE
))

/** @deprecated */ const checkFlag = (flagList, checkFlagList) => flagList.find((flag) => checkFlagList.includes(flag))

/** @deprecated */ const loadEnvKeyExport = loadEnvKey // TODO: DEPRECATE
/** @deprecated */ const saveEnvKeyExport = saveEnvKey // TODO: DEPRECATE
/** @deprecated */ const syncEnvKeyExport = syncEnvKey // TODO: DEPRECATE
/** @deprecated */ const argvFlagExport = argvFlag // TODO: DEPRECATE

export {
  __VERBOSE__, // TODO: DEPRECATE
  checkFlag, // TODO: DEPRECATE
  loadEnvKeyExport as loadEnvKey, // TODO: DEPRECATE
  saveEnvKeyExport as saveEnvKey, // TODO: DEPRECATE
  syncEnvKeyExport as syncEnvKey, // TODO: DEPRECATE
  argvFlagExport as argvFlag // TODO: DEPRECATE
}
