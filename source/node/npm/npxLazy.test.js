import { doNotThrowAsync } from '@dr-js/core/module/common/verify'

import { runNpx } from './npxLazy'

const { describe, it, info = console.log } = global

const tabLog = (level, ...args) => info(`${'  '.repeat(level)}${args.join(' ')}`)

describe('Node.Npm.npxLazy', () => {
  it('runNpx()', async () => {
    await doNotThrowAsync(async () => runNpx([ 'node', '-v' ], tabLog))
    await doNotThrowAsync(async () => runNpx([ 'npm', '-v' ], tabLog))
    await doNotThrowAsync(async () => runNpx([ 'npx', '-v' ], tabLog))
    // await doNotThrowAsync(async () => runNpx([ '@dr-js/core', '-v' ], tabLog))
  })
})
