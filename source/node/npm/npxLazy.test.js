import { doNotThrowAsync } from '@dr-js/core/module/common/verify'
import { setTimeoutAsync } from '@dr-js/core/module/common/time'

import {
  runNpx
} from './npxLazy'

const { describe, it, info = console.log } = global

const tabLog = (level, ...args) => info(`${'  '.repeat(level)}${args.join(' ')}`)

describe('Node.Npm.npxLazy', () => {
  it('runNpx()', async () => {
    await doNotThrowAsync(async () => {
      await runNpx([ 'node', '-v' ], tabLog)
      await setTimeoutAsync(256) // wait run to end
    })
    await doNotThrowAsync(async () => {
      await runNpx([ 'npm', '-v' ], tabLog)
      await setTimeoutAsync(256) // wait run to end
    })
  })
})
