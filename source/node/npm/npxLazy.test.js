import { doNotThrowAsync } from '@dr-js/core/module/common/verify.js'

import { runNpx } from './npxLazy.js'

const { describe, it, info = console.log } = global

const tabLog = (level, ...args) => info(`${'  '.repeat(level)}${args.join(' ')}`)

describe('Node.Npm.npxLazy', () => {
  it('runNpx()', async () => {
    // await doNotThrowAsync(async () => runNpx([ 'node', '-v' ], tabLog))
    // await doNotThrowAsync(async () => runNpx([ '@dr-js/core', '-v' ], tabLog))
    // await doNotThrowAsync(async () => runNpx([ '--yes', '--', 'npm', '-v' ], tabLog))
    // await doNotThrowAsync(async () => runNpx([ '--yes', '--', 'npx', '-v' ], tabLog)) // TODO: NOTE: no log

    // test `node_modules/.bin/`
    await doNotThrowAsync(async () => runNpx([ 'dr-js', '-v' ], tabLog))
    await doNotThrowAsync(async () => runNpx([ 'dr-dev', '-v' ], tabLog))
  })
})
