import { syncEnvKey } from '@dr-js/core/module/node/kit.js'

const __VERBOSE__ = syncEnvKey('__DEV_VERBOSE__', process.argv.includes('verbose'))

const checkFlag = (flagList, checkFlagList) => flagList.find((flag) => checkFlagList.includes(flag))

export {
  __VERBOSE__,
  checkFlag
}

export {
  loadEnvKey, saveEnvKey, syncEnvKey, // TODO: DEPRECATE
  argvFlag // TODO: DEPRECATE
} from '@dr-js/core/module/node/kit.js'
