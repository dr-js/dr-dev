import { resolve, dirname } from 'path'
import { writeFileSync } from 'fs'

import { padTable } from '@dr-js/core/module/common/format.js'
import { setTimeoutAsync } from '@dr-js/core/module/common/time.js'
import { withTimeoutPromise } from '@dr-js/core/module/common/function.js'
import { objectMap } from '@dr-js/core/module/common/immutable/Object.js'
import { compareSemVer } from '@dr-js/core/module/common/module/SemVer.js'
import { getPathStat } from '@dr-js/core/module/node/file/Path.js'
import { run } from '@dr-js/core/module/node/run.js'
import { getProcessListAsync, toProcessTree, findProcessTreeInfo, killProcessTreeInfoAsync } from '@dr-js/core/module/node/system/Process.js'

import { getPathNpmExecutable } from '@dr-js/core/module/node/module/Software/npm.js'

import { REGEXP_PUBLISH_VERSION } from 'source/output.js'
import { withTempDirectory } from 'source/node/file.js'

import { collectDependency } from '../function.js'

const runNpmOutdated = async (pathPackage) => {
  const { promise, subProcess, stdoutPromise, stderrPromise } = run([
    getPathNpmExecutable(), '--no-update-notifier', 'outdated'
  ], { cwd: pathPackage, quiet: true })

  const promiseWithCatch = promise.catch((acceptableError) => {
    __DEV__ && console.log('acceptableError:', acceptableError)
    return acceptableError
  })

  await setTimeoutAsync(500) // wait for a bit for npm to start
  const processTreeInfo = findProcessTreeInfo({ pid: subProcess.pid }, toProcessTree(await getProcessListAsync()))

  const { code, signal } = await withTimeoutPromise(
    promiseWithCatch,
    42 * 1000 // 42sec timeout
  ).catch(async (error) => {
    await killProcessTreeInfoAsync(processTreeInfo)
    throw error
  })

  __DEV__ && console.log(`code: ${code}, signal: ${signal}`)
  __DEV__ && console.log(String(await stdoutPromise))
  __DEV__ && console.log(String(await stderrPromise))

  return String(await stdoutPromise)
}

const compareAndLogResult = async (packageInfoMap, npmOutdatedOutputString) => {
  const sameTable = []
  const complexTable = []
  const outdatedTable = []

  npmOutdatedOutputString.split('\n').forEach((outputLine) => {
    const [ , name, versionWanted, versionLatest ] = REGEXP_NPM_OUTDATED_OUTPUT.exec(outputLine.replace(REGEXP_ANSI_ESCAPE_CODE, '')) || []
    if (!packageInfoMap[ name ]) return // skip missing

    const { version, source } = packageInfoMap[ name ]
    const versionTarget = compareSemVer(versionWanted, versionLatest) <= 0 // select bigger version
      ? versionLatest
      : versionWanted
    if (!REGEXP_PUBLISH_VERSION.test(versionTarget)) return console.error(`[WARN|compareAndLogResult] skipped bad version: ${name}@${versionTarget}`) // skip mis-published version like: `terser@5.6.0-beta`, check: https://github.com/terser/terser/issues/930

    const rowList = [ name, version, versionTarget, source ] // must match PAD_FUNC_LIST

    if (version.includes('||') || version.includes('&&')) complexTable.push(rowList) // TODO: try parse later?
    else if (version.endsWith(versionTarget)) sameTable.push(rowList)
    else outdatedTable.push(rowList)
  })

  const total = sameTable.length + complexTable.length + outdatedTable.length
  __DEV__ && console.log(`Total: ${total} | Same: ${sameTable.length} | Complex: ${complexTable.length} | Outdated: ${outdatedTable.length}`)

  const outputList = []
  const sortPushTable = (table, title) => {
    table.sort(([ nameA, , , sourceA ], [ nameB, , , sourceB ]) => (sourceA !== sourceB) ? sourceA.localeCompare(sourceB) : nameA.localeCompare(nameB))
    table.length && outputList.push(`${title} [${table.length}/${total}]:`, padTable({ table, cellPad: ' | ', padFuncList: [ 'R', 'L', 'L', 'L' ] }))
  }

  sortPushTable(sameTable, 'SAME')
  sortPushTable(complexTable, 'COMPLEX')
  sortPushTable(outdatedTable, 'OUTDATED')

  console.log(outputList.join('\n'))

  return outdatedTable.length
}

const REGEXP_ANSI_ESCAPE_CODE = /\033\[[0-9;]*[a-zA-Z]/g // Match the terminal color code, Check: https://superuser.com/a/380778
const REGEXP_NPM_OUTDATED_OUTPUT = /(\S+)\s+\S+\s+(\S+)\s+(\S+)/ // Will Match: `(Package) Current (Wanted) (Latest) Location "Depended by" (npm@7)`

const doCheckOutdated = async ({
  pathInput,
  pathTemp
}) => {
  const isInputDirectory = (await getPathStat(pathInput)).isDirectory()
  if (pathTemp === undefined) pathTemp = resolve(isInputDirectory ? pathInput : dirname(pathInput), 'check-outdated-gitignore')
  __DEV__ && console.log({ pathInput, isInputDirectory, pathTemp })
  console.log(`[checkOutdated] checking '${pathInput}'`)
  const packageInfoMap = await collectDependency(pathInput, isInputDirectory)
  console.log(`[checkOutdated] get ${Object.keys(packageInfoMap).length} package`)
  const outdatedCount = await withTempDirectory(pathTemp, async () => {
    writeFileSync(resolve(pathTemp, 'package.json'), JSON.stringify({ dependencies: objectMap(packageInfoMap, ({ version }) => version) }))
    return compareAndLogResult(packageInfoMap, await runNpmOutdated(pathTemp))
  })
  outdatedCount && process.exit(outdatedCount)
}

export { doCheckOutdated }
