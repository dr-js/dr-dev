import { getKitLogger } from '@dr-js/core/module/node/kit.js'

const getLogger = ( // TODO: DEPRECATE: confuse with `node/module/Logger.js` from `@dr-js/core`, use `kit` or `kitLogger`
  title = 'dev',
  quiet = false,
  padWidth,
  logFunc
) => getKitLogger({
  title,
  isQuiet: quiet,
  padWidth,
  logFunc
})

export { getLogger } // TODO: DEPRECATE: confuse with `node/module/Logger.js` from `@dr-js/core`, use `kit` or `kitLogger`
