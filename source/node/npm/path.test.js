import { resolve } from 'path'
import { strictEqual, doNotThrow } from '@dr-js/core/module/common/verify'

import {
  findUpPackageRoot,
  getPathGlobalNpmNodeModules,
  fromPathGlobalNodeModules,
  tryRequireGlobal
} from './path'

const { describe, it, info = console.log } = global

describe('Node.Npm.path', () => {
  it('findUpPackageRoot()', () => {
    strictEqual(
      findUpPackageRoot(__dirname),
      resolve(__dirname, '../../../')
    )

    // console.log(require.resolve('@dr-js/core/module/common/verify'))
    strictEqual(
      findUpPackageRoot(require.resolve('@dr-js/core/module/common/verify')),
      resolve(__dirname, __dirname.includes('output-gitignore') ? '../' : './', '../../../node_modules/@dr-js/core/')
    )
  })

  it('getPathGlobalNpmNodeModules()', () => {
    doNotThrow(getPathGlobalNpmNodeModules)

    info(`[getPathGlobalNpmNodeModules] ${getPathGlobalNpmNodeModules()}`)
  })

  it('fromPathGlobalNodeModules()', () => {
    strictEqual(require(fromPathGlobalNodeModules('npm/package.json')).name, 'npm')
    strictEqual(require(fromPathGlobalNodeModules('npm/node_modules/semver/package.json')).name, 'semver')
    strictEqual(require(fromPathGlobalNodeModules('npm/node_modules/libnpx/package.json')).name, 'libnpx')
  })

  it('tryRequireGlobal()', () => {
    strictEqual(tryRequireGlobal('npm/package.json').name, 'npm')
  })
})
