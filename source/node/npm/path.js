import { resolve } from 'path'
import { statSync } from 'fs'
import { execSync } from 'child_process'
import { tryRequire, tryRequireResolve } from '@dr-js/core/module/env/tryRequire'

const findUpPackageRoot = (path = __dirname) => {
  path = resolve(path) // normalize
  let prevPath
  while (path !== prevPath) {
    if (tryRequireResolve(resolve(path, 'package.json'))) return path
    prevPath = path
    path = resolve(path, '..')
  }
}

let cachePathGlobalNpmNodeModules
const getPathGlobalNpmNodeModules = () => {
  if (cachePathGlobalNpmNodeModules === undefined) {
    try { // fast path, assume this is global installed, near global npm
      // inspired by: https://github.com/npm/npx/blob/latest/bin/index.js#L6
      // `global/or/local/node_modules/PACKAGE-NAME/../npm/node_modules/`
      const relativePath = resolve(
        findUpPackageRoot(), // maybe global, maybe local, depend on where this package is installed
        '../npm/node_modules/' // mostly be global installed (who install a local version?) // TODO: need test
      )
      if (statSync(relativePath).isDirectory()) cachePathGlobalNpmNodeModules = relativePath // bingo! // TODO: may be too simple?
    } catch (error) { __DEV__ && console.log(`fast path error: ${error}`) }
    if (cachePathGlobalNpmNodeModules === undefined) { // slow but should be correct
      cachePathGlobalNpmNodeModules = resolve(String(execSync('npm root -g')).trim(), 'npm/node_modules/')
    }
  }
  return cachePathGlobalNpmNodeModules
}

const fromPathGlobalNodeModules = (...args) => resolve(getPathGlobalNpmNodeModules(), '../../', ...args)
const tryRequireGlobal = (name) => tryRequire(fromPathGlobalNodeModules(name))

export {
  findUpPackageRoot,
  getPathGlobalNpmNodeModules,
  fromPathGlobalNodeModules,
  tryRequireGlobal
}
