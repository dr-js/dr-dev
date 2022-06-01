import { resolve } from 'node:path'
import { withTimeoutPromise } from '@dr-js/core/module/common/function.js'
import { toPackageInfo, collectDependency } from '@dr-js/core/module/common/module/PackageJSON.js'
import { writeJSON } from '@dr-js/core/module/node/fs/File.js'
import { withTempDirectory } from '@dr-js/core/module/node/fs/Directory.js'
import { runNpm } from '@dr-js/core/module/node/module/Software/npm.js'
import { getProcessListAsync, toProcessTree, findProcessTreeInfo, killProcessTreeInfoAsync } from '@dr-js/core/module/node/system/Process.js'

const outdatedJSON = async ({ packageRoot }) => { // run outdated in place
  const { promise, subProcess, stdoutPromise } = runNpm([ '--no-update-notifier',
    '--json', 'outdated'
  ], { cwd: packageRoot, quiet: true, describeError: false })

  const { code, signal } = await withTimeoutPromise(
    promise.catch((error) => error), // allow error (exit with 1 if there's listed package)
    42 * 1000 // 42sec timeout
  ).catch(async (error) => {
    const processTreeInfo = await findProcessTreeInfo({ pid: subProcess.pid, ppid: process.pid }, toProcessTree(await getProcessListAsync()))
    await killProcessTreeInfoAsync(processTreeInfo)
    throw error
  })
  __DEV__ && console.log(`code: ${code}, signal: ${signal}`)

  // { package-name: { wanted: '0.0.0', latest: '0.0.0' } }
  return JSON.parse(String(await stdoutPromise))
}

const outdatedWithTempJSON = async ({
  packageJSON, // create temp packageRoot and run outdated
  pathTemp
}) => withTempDirectory(async (pathTemp) => {
  const { dependencyMap } = collectDependency(toPackageInfo({ packageJSON }))
  await writeJSON(resolve(pathTemp, 'package.json'), { // minimal data
    dependencies: dependencyMap // must put all in "dependencies" or npm will skip the check
  })
  return outdatedJSON({ packageRoot: pathTemp })
}, pathTemp)

export {
  outdatedJSON, outdatedWithTempJSON
}
