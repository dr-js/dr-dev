import { getEnvironment } from '@dr-js/core/module/env/global'
import { tryRequire } from '@dr-js/core/module/env/tryRequire'

// TODO: NOTE: code should do nothing in browser (but usable)

// reduced code from: https://github.com/chalk/supports-color/blob/master/index.js
const shouldSupportColor = () => {
  if ( // node, not browser
    !getEnvironment().isNode
  ) return false

  { // check env for FORCE_COLOR
    const { FORCE_COLOR } = process.env
    if ( // FORCE_COLOR: true/on = force color
      FORCE_COLOR && [ 'true', true ].includes(FORCE_COLOR)
    ) return true
    if ( // FORCE_COLOR: false/off = force no color
      FORCE_COLOR && [ 'false', false ].includes(FORCE_COLOR)
    ) return false
  }

  if ( // stdout/stderr stream type
    !process.stdout.isTTY ||
    !process.stderr.isTTY
  ) return false

  { // check env for conventional keys
    const { CI, TERM } = process.env

    if ( // CI = force color
      CI
    ) return true

    if ( // TERM = test color
      TERM &&
      /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(TERM)
    ) return true
  }

  if ( // Windows 10 = should support color
    process.platform === 'win32' &&
    Number(tryRequire('os') && tryRequire('os').release().split('.')[ 0 ]) >= 10
  ) return true

  __DEV__ && console.log('no color support')

  return false
}

const TerminalColor = (() => {
  // http://jafrog.com/2013/11/23/colors-in-terminal.html
  // https://misc.flogisoft.com/bash/tip_colors_and_formatting
  const getControlSequence = (...args) => `\u001B[${args.join(';')}m`

  const ControlSequenceForeground = {
    default: getControlSequence(39),

    black: getControlSequence(30),
    red: getControlSequence(31),
    green: getControlSequence(32),
    yellow: getControlSequence(33),
    blue: getControlSequence(34),
    magenta: getControlSequence(35),
    cyan: getControlSequence(36),
    lightGray: getControlSequence(37),

    darkGray: getControlSequence(90),
    lightRed: getControlSequence(91),
    lightGreen: getControlSequence(92),
    lightYellow: getControlSequence(93),
    lightBlue: getControlSequence(94),
    lightMagenta: getControlSequence(95),
    lightCyan: getControlSequence(96),
    white: getControlSequence(97)
  }

  const ControlSequenceBackground = {
    default: getControlSequence(49),

    black: getControlSequence(40),
    red: getControlSequence(41),
    green: getControlSequence(42),
    yellow: getControlSequence(43),
    blue: getControlSequence(44),
    magenta: getControlSequence(45),
    cyan: getControlSequence(46),
    lightGray: getControlSequence(47),

    darkGray: getControlSequence(100),
    lightRed: getControlSequence(101),
    lightGreen: getControlSequence(102),
    lightYellow: getControlSequence(103),
    lightBlue: getControlSequence(104),
    lightMagenta: getControlSequence(105),
    lightCyan: getControlSequence(106),
    white: getControlSequence(107)
  }

  const isSupportColor = shouldSupportColor()
  const createTerminalColor = (setColor, clearColor) => isSupportColor // TODO: no nesting support
    ? (text) => `${setColor}${text}${clearColor}`
    : (text) => text

  const TerminalColorForeground = Object.entries(ControlSequenceForeground).reduce((o, [ key, controlSequence ]) => {
    o[ key ] = createTerminalColor(controlSequence, ControlSequenceForeground.default)
    return o
  }, {})

  const TerminalColorBackground = Object.entries(ControlSequenceBackground).reduce((o, [ key, controlSequence ]) => {
    o[ key ] = createTerminalColor(controlSequence, ControlSequenceBackground.default)
    return o
  }, {})

  return {
    foreground: TerminalColorForeground,
    fg: TerminalColorForeground,
    background: TerminalColorBackground,
    bg: TerminalColorBackground
  }
})()

// usage: TerminalColor.fg.red(string)

export {
  shouldSupportColor,
  TerminalColor
}
