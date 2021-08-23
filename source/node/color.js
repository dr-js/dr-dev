import { configureTerminalColor } from '@dr-js/core/module/node/module/TerminalColor.js'

const { // add expand to allow IDE to pickup key list
  default: defaultColor,
  black, red, green, yellow, blue, magenta, cyan, lightGray,
  darkGray, lightRed, lightGreen, lightYellow, lightBlue, lightMagenta, lightCyan, white
} = configureTerminalColor().fg

const color = {
  default: defaultColor,
  black, red, green, yellow, blue, magenta, cyan, lightGray,
  darkGray, lightRed, lightGreen, lightYellow, lightBlue, lightMagenta, lightCyan, white
}

export { color }
