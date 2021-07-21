import { ProgressPlugin } from 'webpack'
import { percent, time } from '@dr-js/core/module/common/format.js'
import { autoEllipsis } from '@dr-js/core/module/common/string.js'

const createProgressPlugin = ({
  debounce = 256, // set higher for less log, but also may miss more info
  log = console.log
} = {}) => {
  const timeStart = Date.now()
  let timePrev = timeStart
  return new ProgressPlugin((percentage, message, ...args) => {
    const timeNow = Date.now()
    if (timeNow - timePrev <= debounce) return // debounce
    log([
      `[${percent(percentage)}|${time(timeNow - timeStart)}|+${time(timeNow - timePrev)}]`,
      message, '-', ...args.map((v) => autoEllipsis(String(v), 64, 8, 48))
    ].join(' '))
    timePrev = timeNow
  })
}

export { createProgressPlugin }
