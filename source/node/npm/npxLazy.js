import { resolve } from 'path'
import { tryRequire } from '@dr-js/core/module/env/tryRequire'

import {
  findUpPackageRoot,
  fromPathGlobalNodeModules,
  tryRequireGlobal
} from './path'

const parsePackageNameAndVersion = (nameAndVersion) => {
  const nameAndVersionList = nameAndVersion.split('@')
  if (nameAndVersionList.length < 2) return []
  const version = nameAndVersionList.pop()
  const name = nameAndVersionList.join('@')
  if (!name || !version) return []
  return [ name, version ]
}

const runNpx = async (
  args = [],
  tabLog
) => {
  const npx = tryRequireGlobal('npm/node_modules/libnpx') // borrow package from npm
  const pathNpmCli = fromPathGlobalNodeModules('npm/bin/npm-cli.js') // optional, something like `path.join(__dirname, 'node_modules', 'npm', 'bin', 'npm-cli.js')`
  tabLog(1, 'args:', ...args)
  tabLog(1, 'pathNpmCli:', pathNpmCli)
  return npx(npx.parseArgs([
    process.argv[ 0 ], // node
    process.argv[ 1 ], // this script
    ...args
  ], pathNpmCli))
}

const npxLazy = async ({
  argList: [ command, ...extraArgs ],
  tabLog = (level, ...args) => {}
}) => {
  const [ packageName, version ] = parsePackageNameAndVersion(command)
  if (version) {
    const { satisfies } = tryRequireGlobal('npm/node_modules/semver') // borrow package from npm
    const testPackageVersion = (...prePathList) => {
      try {
        const packagePath = resolve(...prePathList, packageName, 'package.json')
        tabLog(1, `try package: ${packagePath}`)
        const packageJSON = tryRequire(packagePath)
        if (!satisfies(packageJSON.version, version)) return tabLog(2, `bail, package version mismatch: ${packageJSON.version} - ${command}`)
        tabLog(2, `can run package directly, version fit: ${packageJSON.version} - ${command}`)
        return packageName // drop version
      } catch (error) { tabLog(2, `failed to get package version: ${command}`, error) }
    }
    command = testPackageVersion(process.cwd(), 'node_modules') || // cwd first, may be run from npm script
      testPackageVersion(findUpPackageRoot(), '..') || // possible local node_modules
      testPackageVersion(fromPathGlobalNodeModules()) || // global
      command // fallback
  } else tabLog(1, `bail, no package version found: ${command}`)
  return runNpx([ command, ...extraArgs ], tabLog)
}

export {
  parsePackageNameAndVersion,
  runNpx,
  npxLazy
}
