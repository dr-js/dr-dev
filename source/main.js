import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'

import { clock } from '@dr-js/core/module/common/time'
import { time } from '@dr-js/core/module/common/format'
import { isString } from '@dr-js/core/module/common/check'

import { argvFlag } from './node/env'
import { getLogger } from './node/logger'
import { commonCombo } from './output'
import { commonInfoPatchCombo } from './ci'

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
  argvFlag, commonCombo, commonInfoPatchCombo, resolve, readFileSync, writeFileSync // quick import
}
