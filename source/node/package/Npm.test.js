import { findUpPackageRoot } from '@dr-js/core/module/node/module/Software/npm.js'
import {
  outdatedJSON, outdatedWithTempJSON
} from './Npm.js'

const { describe, it, info = console.log } = globalThis

describe('Node.Package.Npm', () => {
  it('outdatedJSON()', async () => {
    const packageRoot = findUpPackageRoot(process.cwd())
    info(`packageRoot: ${packageRoot}`)
    info(JSON.stringify(await outdatedJSON({ packageRoot })))
  })

  it('outdatedWithTempJSON()', async () => {
    info(JSON.stringify(await outdatedWithTempJSON({
      packageJSON: {
        dependencies: { '@dr-js/core': '*' },
        devDependencies: { '@dr-js/dev': '*' }
      }
    })))
  })
})
