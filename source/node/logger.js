import { clock } from '@dr-js/core/module/common/time'
import { time as formatTime } from '@dr-js/core/module/common/format'

import { loadEnvKey, saveEnvKey, __VERBOSE__ } from './env'

const EMPTY_FUNC = () => {}

const getLogger = (title = 'dev', quiet = false, padWidth = 120) => {
  const envTitle = loadEnvKey('__DEV_LOGGER_TITLE__')
  title = envTitle ? `${title}|${envTitle}` : title
  saveEnvKey('__DEV_LOGGER_TITLE__', title)

  const startTime = clock()
  let prevTime = clock()
  const getPadTime = () => {
    const time = clock()
    prevTime = time
    return formatTime(time - startTime)
  }
  const getStepTime = () => {
    const time = clock()
    const stepTime = time - prevTime
    prevTime = time
    return formatTime(stepTime)
  }

  const padLog = (...args) => {
    const start = `## ${args.join(' ')} `
    const end = ` [${title}|${getPadTime()}]`
    console.log(`\n${start.padEnd(padWidth - end.length, '-')}${end}`)
  }
  const stepLog = (...args) => console.log(`- (+${getStepTime()}) ${args.join(' ')}`)
  const log = (...args) => console.log(`- ${args.join(' ')}`)
  const devLog = __VERBOSE__ ? log : EMPTY_FUNC

  return quiet
    ? { padLog: stepLog, stepLog: devLog, log: devLog, devLog: EMPTY_FUNC }
    : { padLog, stepLog, log, devLog }
}

export { getLogger }
