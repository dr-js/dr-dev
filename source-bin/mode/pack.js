import { resolve } from 'path'
import { writeFileSync } from 'fs'
import { objectMergeDeep } from '@dr-js/core/module/common/mutable/Object.js'

import { getLogger } from 'source/node/logger.js'
import { resetDirectory } from 'source/node/file.js'
import { packOutput, publishOutput } from 'source/output.js'

import { formatPackagePath, copyAndSavePackExportInitJSON } from '../function.js'

const GET_INITIAL_PACKAGE_INFO = () => ({ packageJSON: {}, exportPairList: [] })

const loadPackage = (inputPath, packageInfo = GET_INITIAL_PACKAGE_INFO(), loadedSet = new Set()) => {
  const { packageFile, packagePath } = formatPackagePath(inputPath)

  if (loadedSet.has(packageFile)) return packageInfo
  loadedSet.add(packageFile)

  const {
    __FLAVOR__, // drop __FLAVOR__ from packageJSON
    IMPORT: importList,
    EXPORT: exportList,
    ...mergePackageJSON
  } = require(packageFile)
  const { packageJSON, exportPairList } = packageInfo

  importList && importList.forEach((importPackagePath) => loadPackage(resolve(packagePath, importPackagePath), packageInfo, loadedSet))

  console.log(`[loadPackage] load: ${packageFile}`)
  exportList && exportList.forEach((filePath) => exportPairList.push(parseResourcePath(filePath, packagePath)))
  mergePackageJSON && objectMergeDeep(packageJSON, mergePackageJSON)
  return packageInfo
}

const parseResourcePath = (resourcePath, packagePath) => typeof (resourcePath) === 'object'
  ? [ resolve(packagePath, resourcePath.from), resourcePath.to ]
  : [ resolve(packagePath, resourcePath), resourcePath ]

const doPack = async ({
  pathInput,
  pathOutput,
  outputName,
  outputVersion,
  outputDescription,
  isPublish = false,
  isPublishDev = false,
  isDryRun = false
}) => {
  const { packageJSON, exportPairList } = loadPackage(pathInput)
  if (outputName) packageJSON.name = outputName
  if (outputVersion) packageJSON.version = outputVersion
  if (outputDescription) packageJSON.description = outputDescription

  const fromOutput = (...args) => resolve(pathOutput, ...args)
  const logger = getLogger('pack')

  { // custom initOutput
    await resetDirectory(pathOutput)

    const { name, description } = packageJSON
    writeFileSync(resolve(pathOutput, 'package.json'), JSON.stringify(packageJSON))
    writeFileSync(resolve(pathOutput, 'README.md'), [
      `# ${name}`,
      '',
      '[![i:npm]][l:npm]',
      '[![i:size]][l:size]',
      '[![i:npm-dev]][l:npm]',
      '',
      `${description}`,
      '',
      // TODO: CHECK: may need custom url escape for name?
      `[i:npm]: https://img.shields.io/npm/v/${name}`,
      `[i:npm-dev]: https://img.shields.io/npm/v/${name}/dev`,
      `[l:npm]: https://npm.im/${name}`,
      `[i:size]: https://packagephobia.now.sh/badge?p=${name}`,
      `[l:size]: https://packagephobia.now.sh/result?p=${name}`
    ].join('\n'))

    await copyAndSavePackExportInitJSON({ pathPackage: pathOutput, exportPairList })
  }

  const pathPackagePack = await packOutput({ fromOutput, logger })
  await publishOutput({
    extraArgs: isDryRun ? [ '--dry-run' ] : [],
    isPublishAuto: false, isPublish, isPublishDev,
    packageJSON, pathPackagePack,
    logger
  })
}

export { doPack }
