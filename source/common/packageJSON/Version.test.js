import { strictEqual } from '@dr-js/core/module/common/verify.js'
import {
  versionBumpByGitBranch,
  versionBumpToIdentifier,
  versionBumpLastNumber,
  versionBumpToLocal
} from './Version.js'

const { describe, it } = globalThis

describe('Common.PackageJSON.Version', () => {
  it('versionBumpByGitBranch()', () => {
    strictEqual(versionBumpByGitBranch('1.0.0', { gitBranch: 'master' }), '1.0.1')
    strictEqual(versionBumpByGitBranch('1.0.0-with-label', { gitBranch: 'master' }), '1.0.0')

    strictEqual(versionBumpByGitBranch('1.0.0', { gitBranch: 'other-dev-branch' }), '1.0.1-otherdevbranch.0')
    strictEqual(versionBumpByGitBranch('1.0.0-with-label', { gitBranch: 'other-dev-branch' }), '1.0.0-otherdevbranch.0')
    strictEqual(versionBumpByGitBranch('1.0.0-otherdevbranch.0', { gitBranch: 'other-dev-branch' }), '1.0.0-otherdevbranch.1')
  })

  it('versionBumpToIdentifier()', () => {
    strictEqual(versionBumpToIdentifier('1.0.0', { identifier: 'TEST' }), '1.0.1-TEST.0')
    strictEqual(versionBumpToIdentifier('1.0.0-dev.0', { identifier: 'TEST' }), '1.0.0-TEST.0')
    strictEqual(versionBumpToIdentifier('1.0.0-TEST.0', { identifier: 'TEST' }), '1.0.0-TEST.1')
  })

  it('versionBumpLastNumber()', () => {
    strictEqual(versionBumpLastNumber('1.0.0'), '1.0.1')
    strictEqual(versionBumpLastNumber('1.0.0-dev.0'), '1.0.0-dev.1')
    strictEqual(versionBumpLastNumber('1.0.0-dev19abc'), '1.0.0-dev20abc')
  })

  it('versionBumpToLocal()', () => {
    strictEqual(versionBumpToLocal('1.0.0'), '1.0.0-local.0')
    strictEqual(versionBumpToLocal('1.0.0-local.0'), '1.0.0-local.1')
    strictEqual(versionBumpToLocal('1.0.0-with-label'), '1.0.0-with-label.local.0')
    strictEqual(versionBumpToLocal('1.0.0-with-label.local.0'), '1.0.0-with-label.local.1')
    strictEqual(versionBumpToLocal('1.0.0-with-label-local.0'), '1.0.0-with-label-local.0.local.0')
  })
})
