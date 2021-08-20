import { doThrow, doThrowAsync } from '@dr-js/core/module/common/verify.js'
import { getKitLogger } from '@dr-js/core/module/node/kit.js'

import {
  verifyString,
  verifySemVer,
  verifyCommand,

  verifyCommandSemVer,

  useKitLogger,
  toTask, verifyTaskList
} from './verify.js'

const { describe, it, before, info = console.log } = global

before(() => {
  useKitLogger(getKitLogger({
    title: 'test-verify',
    isNoEnvKey: true,
    logFunc: info,
    padWidth: 80
  }))
})

describe('Node.Verify', () => {
  it('verifyString', () => {
    verifyString('a b\nc d', 'a b\nc d')
    verifyString('a b\nc d', ' b\nc ')
    verifyString('a b\nc d', /b\s+c/)
    verifyString('a b\nc d', [
      'b\nc', ' b\nc', /b\s+c/
    ])

    doThrow(() => verifyString('a b\nc d', 'oops'))
    doThrow(() => verifyString('a b\nc d', [
      'b\nc', ' b\nc', 'oops', /b\s+c/
    ]))
  })

  it('verifyCommand', () => {
    verifyCommand('node -v')
    verifyCommand([ 'node', '-v' ])

    doThrow(() => verifyCommand([ 'node', '-e', 'process.exitCode = 1' ]))
    doThrow(() => verifyCommand('command-not-exist -v'))
  })

  it('verifySemVer', () => {
    verifySemVer('0.1.0', '0.1.0')
    verifySemVer('0.1.0', '0.1')
    verifySemVer('0.1.0', '^0.1.0')
    verifySemVer('0.1.0', '>=0.1.0')

    verifySemVer('v0.1.0', '0.1.0')
    verifySemVer('0.1.1', '^0.1.0')
    verifySemVer('v0.2.0', '>=0.1.0')

    verifySemVer('19.03.12', '>=19') // Docker version is not SemVer, but close

    doThrow(() => verifySemVer('0.2.0', '0.1.0'))
    doThrow(() => verifySemVer('0.2.0', '^0.1.0'))
    doThrow(() => verifySemVer('0.2.0', '0.1'))
  })

  it('verifyCommandSemVer', async () => {
    await verifyCommandSemVer('node -v', '>=14.15')
    await verifyCommandSemVer('npm -v', '>=6.14')

    await doThrowAsync(() => verifyCommandSemVer('node -v', '8'))
    await doThrowAsync(() => verifyCommandSemVer('npm -v', '5'))
    await doThrowAsync(() => verifyCommandSemVer('command-not-exist -v', '1.0.0'))
  })

  it('verifyTaskList+toTask', async () => {
    await verifyTaskList([
      toTask('title: verifyString', 'should pass', async () => {
        verifyString('a b\nc d', 'a b\nc d')
        verifyString('a b\nc d', ' b\nc ')
      }),
      toTask('title: verifyCommand', 'should pass', async () => {
        verifyCommand('node -v')
        verifyCommand([ 'node', '-v' ])
      }),
      toTask('title: verifySemVer', 'should pass', async () => {
        verifySemVer('0.1.0', '0.1.0')
        verifySemVer('0.1.0', '0.1')
        verifySemVer('0.1.0', '^0.1.0')
        verifySemVer('0.1.0', '>=0.1.0')
      }),
      toTask('title: verifyCommandSemVer', 'should pass', async () => {
        await verifyCommandSemVer('node -v', '>=14.15')
        await verifyCommandSemVer('npm -v', '>=6.14')
      })
    ])
  })
})
