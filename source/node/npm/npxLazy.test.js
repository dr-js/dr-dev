import { doNotThrowAsync } from '@dr-js/core/module/common/verify'

import {
  runNpx
} from './npxLazy'

const { describe, it, info = console.log } = global

const tabLog = (level, ...args) => info(`${'  '.repeat(level)}${args.join(' ')}`)

describe('Node.Npm.npxLazy', () => {
  it('runNpx()', async () => {
    await doNotThrowAsync(async () => {
      const result = await runNpx([ 'node', '-v' ], tabLog) // { code: 0, stdout: '', stderr: '' }
      info(JSON.stringify(result))
    })
    await doNotThrowAsync(async () => {
      const result = await runNpx([ 'npm', '-v' ], tabLog) // { code: 0, stdout: '', stderr: '' }
      info(JSON.stringify(result))
    })
  })
})
