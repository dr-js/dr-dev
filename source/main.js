import { resolve, sep } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

import { clock } from '@dr-js/core/module/common/time.js'
import { time } from '@dr-js/core/module/common/format.js'
import { isString } from '@dr-js/core/module/common/check.js'

import { argvFlag } from './node/env.js'
import { getLogger } from './node/logger.js'
import { commonCombo } from './output.js'
import { commonInfoPatchCombo } from './ci.js'

const runMain = (
  mainAsyncFunc,
  loggerOrTitle = process.argv.slice(2).join('+'),
  ...args
) => {
  const startTime = clock()
  const logger = isString(loggerOrTitle)
    ? getLogger(loggerOrTitle, argvFlag('quiet'))
    : loggerOrTitle
  new Promise((resolve) => resolve(mainAsyncFunc(logger, ...args))).then(
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
  // quick import // TODO: DEPRECATE: move to `combo.js`
  argvFlag, commonCombo, commonInfoPatchCombo,
  resolve, sep, readFileSync, writeFileSync, existsSync
}
