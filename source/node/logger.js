import { clock } from '@dr-js/core/module/common/time.js'
import { time } from '@dr-js/core/module/common/format.js'
import { clamp } from '@dr-js/core/module/common/math/base.js'

import { configureTerminalColor } from '@dr-js/core/module/node/module/TerminalColor.js'

import { loadEnvKey, saveEnvKey, __VERBOSE__ } from './env.js'

const EMPTY_FUNC = () => {}

const TerminalColor = configureTerminalColor()
const getLogger = (
  title = 'dev',
  quiet = false,
  padWidth = clamp((process.stdout.isTTY && process.stdout.columns) || 80, 64, 240),
  logFunc = console.log
) => {
  const envTitle = loadEnvKey('__DEV_LOGGER_TITLE__')
  title = envTitle ? `${title}|${envTitle}` : title
  saveEnvKey('__DEV_LOGGER_TITLE__', title)

  const startTime = clock()
  let prevTime = clock()
  const getPadTime = () => {
    const currentTime = clock()
    prevTime = currentTime
    return time(currentTime - startTime)
  }
  const getStepTime = () => {
    const currentTime = clock()
    const stepTime = currentTime - prevTime
    prevTime = currentTime
    return time(stepTime)
  }

  const padLog = (...args) => {
    const start = `## ${args.join(' ')} `
    const end = ` [${title}|${getPadTime()}]`
    logFunc(`\n${start.padEnd(padWidth - end.length, '-')}${TerminalColor.fg.yellow(end)}`)
  }
  const stepLog = (...args) => logFunc(`- ${TerminalColor.fg.yellow(`(+${getStepTime()})`)} ${args.join(' ')}`)
  const log = (...args) => logFunc(TerminalColor.fg.darkGray(`- ${args.join(' ')}`))
  const devLog = __VERBOSE__ ? log : EMPTY_FUNC

  return quiet
    ? { padLog: stepLog, stepLog: devLog, log: devLog, devLog: EMPTY_FUNC }
    : { padLog, stepLog, log, devLog }
}

export { getLogger }
