import { strictEqual } from '@dr-js/core/module/common/verify.js'
import { configureTerminalColor } from '@dr-js/core/module/node/module/TerminalColor.js'

import {
  color
} from './color.js'

const { describe, it } = globalThis

describe('Node.Color', () => {
  it('match TerminalColor:fg', () => {
    strictEqual(
      Object.keys(color).sort().join('|'),
      Object.keys(configureTerminalColor().fg).sort().join('|')
    )
  })
})
