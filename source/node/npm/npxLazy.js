import { resolve } from 'path'
import { tryRequire } from '@dr-js/core/module/env/tryRequire.js'
import { run } from '@dr-js/core/module/node/run.js'
import { parsePackageNameAndVersion, findUpPackageRoot, fromNpmNodeModules, getPathNpmGlobalRoot } from '@dr-js/core/module/node/module/Software/npm.js'

const runNpx = async ( // TODO: consider move to `npm exec` since the `npx|libnpx` package will be dropped since `npm@7` and may later break the usage
  argList = [],
  tabLog
) => {
  const pathNpxCli = fromNpmNodeModules('../bin/npx-cli.js') // exist in both `npm@6` and `npm@7`
  tabLog(1, 'argList:', ...argList)
  tabLog(1, 'pathNpxCli:', pathNpxCli)
  await run([ process.execPath, pathNpxCli, ...argList ]).promise // NOTE: use node to run for win32 support

  // // TODO: this is flaky, check test for details
  // // NOTE: with this method, there's no way to know when the process ends and the end result,
  // //   so outer code should just bail out, and let the process itself run to end
  // // rewrite `process.argv` to fake npx command so `npx-cli.js` can do it's job
  // process.argv.length = 1 // keep node binary
  // process.argv.push(pathNpxCli, ...args)
  //
  // delete require.cache[ require.resolve(pathNpxCli) ] // reset cache or the code in require will only run once
  // require(pathNpxCli)
  //
  // // TODO: NOTE: HACK: this assumes outer code do not have something keep the process running, like server or timeout
  // await new Promise((resolve, reject) => process.once('beforeExit', (code) => code
  //   ? reject(new Error(`exit with code: ${code}, args: [${args.join(' ')}]`))
  //   : resolve()
  // ))
}

const runNpxLazy = async (
  [ command, ...extraArgs ],
  tabLog = (level, ...args) => {}
) => {
  const [ packageName, version ] = parsePackageNameAndVersion(command)
  if (version) {
    const { satisfies } = tryRequire(fromNpmNodeModules('semver')) // borrow package from npm
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
      testPackageVersion(getPathNpmGlobalRoot()) || // global
      command // fallback
  } else tabLog(1, `bail, no package version found: ${command}`)
  return runNpx([ command, ...extraArgs ], tabLog)
}

/** @deprecated */ const npxLazy = async ({ argList, tabLog }) => runNpxLazy(argList, tabLog) // TODO: DEPRECATE

export {
  runNpx, runNpxLazy,

  npxLazy // TODO: DEPRECATE
}
