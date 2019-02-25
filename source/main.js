import { clock } from 'dr-js/module/common/time'
import { time } from 'dr-js/module/common/format'
import { isString } from 'dr-js/module/common/check'

import { argvFlag } from './node/env'
import { getLogger } from './node/logger'

const runMain = (
  main,
  loggerOrTitle = process.argv.slice(2).join('+'),
  ...args
) => {
  const startTime = clock()
  const logger = isString(loggerOrTitle)
    ? getLogger(loggerOrTitle, argvFlag('quiet'))
    : loggerOrTitle
  new Promise((resolve) => resolve(main(logger, ...args))).then(
    () => { logger.padLog(`done in ${time(clock() - startTime)}`) },
    (error) => {
      console.warn(error)
      logger.padLog(`error after ${time(clock() - startTime)}: ${error}`)
      process.exit(-1)
    }
  )
}

export {
  runMain,
  argvFlag // common import
}
