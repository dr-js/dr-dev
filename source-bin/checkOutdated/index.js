import { resolve, dirname } from 'path'
import { writeFileSync } from 'fs'

import { withTempDirectory } from 'dr-js/module/node/file/Modify'

import { collectDependency } from './collectDependency'
import { checkNpmOutdated } from './checkNpmOutdated'
import { logResult } from './logResult'

const doCheckOutdated = async ({
  pathInput,
  pathTemp = resolve(pathInput, 'check-outdated-gitignore')
}) => {
  console.log(`[checkOutdated] checking '${pathInput}'`)
  const { isDirectory, packageInfoMap, dependencyMap } = await collectDependency(pathInput)
  const outdatedCount = isDirectory
    ? await withTempDirectory(pathTemp, async () => {
      writeFileSync(resolve(pathTemp, 'package.json'), JSON.stringify({ dependencies: dependencyMap }))
      return logCheckOutdatedResult(packageInfoMap, pathTemp)
    })
    : await logCheckOutdatedResult(packageInfoMap, dirname(pathInput))
  process.exit(outdatedCount)
}

const logCheckOutdatedResult = async (packageInfoMap, pathPackage) => logResult(
  packageInfoMap,
  await checkNpmOutdated(pathPackage)
)

export { doCheckOutdated }
