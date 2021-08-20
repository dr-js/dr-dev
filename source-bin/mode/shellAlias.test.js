import {
  doShellAlias
} from './shellAlias.js'

const { describe, it, info = console.log } = globalThis

describe('doShellAlias', () => {
  it('doShellAlias()', () => {
    doShellAlias({
      aliasName: 'NLSG',
      aliasArgList: [],
      log: info
    })
  })
})
