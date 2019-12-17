import { stringifyEqual, doNotThrowAsync } from '@dr-js/core/module/common/verify'

import {
  parsePackageNameAndVersion,
  runNpx
} from './npxLazy'

const { describe, it, info = console.log } = global

const tabLog = (level, ...args) => info(`${'  '.repeat(level)}${args.join(' ')}`)

describe('Node.Npm.npxLazy', () => {
  it('parsePackageNameAndVersion()', () => {
    stringifyEqual(parsePackageNameAndVersion('aaa@0.0.0'), [ 'aaa', '0.0.0' ])
    stringifyEqual(parsePackageNameAndVersion('aaa@'), [])
    stringifyEqual(parsePackageNameAndVersion('aaa'), [])

    stringifyEqual(parsePackageNameAndVersion('@aaa/aaa@0.0.0'), [ '@aaa/aaa', '0.0.0' ])
    stringifyEqual(parsePackageNameAndVersion('@aaa/aaa@'), [])
    stringifyEqual(parsePackageNameAndVersion('@aaa/aaa'), [])
  })

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
