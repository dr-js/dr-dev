import { getEnvironment } from '@dr-js/core/module/env/global'
import { tryRequire } from '@dr-js/core/module/env/tryRequire'

// TODO: NOTE: code should do nothing in browser (but usable)

// reduced code from: https://github.com/chalk/supports-color/blob/master/index.js
const shouldSupportColor = () => {
  if (!getEnvironment().isNode) return false // node, not browser

  { // check env for FORCE_COLOR // FORCE_COLOR: false/off = force no color, other = force color
    const FORCE_COLOR = String(process.env.FORCE_COLOR)
    if (FORCE_COLOR !== 'undefined') return ![ 'false', 'off' ].includes(FORCE_COLOR)
  }

  if ( // stdout/stderr stream type
    !process.stdout.isTTY ||
    !process.stderr.isTTY
  ) return false

  { // check env for conventional keys
    const { CI, TERM } = process.env
    if (CI) return true // CI = force color
    if (TERM && /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(TERM)) return true // TERM = test color
  }

  if ( // Windows 10 = should support color
    process.platform === 'win32' &&
    Number(tryRequire('os') && tryRequire('os').release().split('.')[ 0 ]) >= 10
  ) return true

  __DEV__ && console.log('no color support')

  return false
}

// AES = ANSI escape code
// https://en.wikipedia.org/wiki/ANSI_escape_code
// http://jafrog.com/2013/11/23/colors-in-terminal.html
// https://misc.flogisoft.com/bash/tip_colors_and_formatting

// name|Foreground|Background
const AES_DEFAULT_FG = 39
const AES_DEFAULT_BG = 49
const AES_CONFIG_TEXT = `
black|30|40
red|31|41
green|32|42
yellow|33|43
blue|34|44
magenta|35|45
cyan|36|46
lightGray|37|47

default|${AES_DEFAULT_FG}|${AES_DEFAULT_BG}

darkGray|90|100
lightRed|91|101
lightGreen|92|102
lightYellow|93|103
lightBlue|94|104
lightMagenta|95|105
lightCyan|96|106
white|97|107
`

const TerminalColor = (() => { // usage: TerminalColor.fg.red(string)
  const toAES = (value) => `\x1b[${value}m`
  const createWrapper = shouldSupportColor()
    ? (setAES, clearAES) => (text) => `${setAES}${text}${clearAES}` // TODO: no nesting support
    : () => (text) => text

  const wrapperFg = {}
  const wrapperBg = {}
  AES_CONFIG_TEXT.split('\n').filter(Boolean).forEach((controlSequenceText) => {
    const [ name, colorFg, colorBg ] = controlSequenceText.split('|')
    wrapperFg[ name ] = createWrapper(toAES(colorFg), toAES(AES_DEFAULT_FG))
    wrapperBg[ name ] = createWrapper(toAES(colorBg), toAES(AES_DEFAULT_BG))
  })

  return {
    fg: wrapperFg,
    bg: wrapperBg
  }
})()

export {
  shouldSupportColor,
  TerminalColor
}
