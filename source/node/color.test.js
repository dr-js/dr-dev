import { strictEqual } from '@dr-js/core/module/common/verify.js'
import { createColor } from '@dr-js/core/module/node/module/TerminalTTY.js'

import {
  color
} from './color.js'

const { describe, it } = globalThis

describe('Node.Color', () => {
  it('match TerminalColor:fg', () => {
    strictEqual(
      Object.keys(color).sort().join('|'),
      Object.keys(createColor().fg).sort().join('|')
    )
  })
})
