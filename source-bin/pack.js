import { resolve } from 'path'
import { writeFileSync } from 'fs'
import { objectMergeDeep } from '@dr-js/core/module/common/mutable/Object'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { modifyCopy } from '@dr-js/core/module/node/file/Modify'

import { getLogger } from '@dr-js/dev/module/node/logger'
import { resetDirectory } from '@dr-js/dev/module/node/file'
import { packOutput, publishOutput } from '@dr-js/dev/module/output'

import { formatPackagePath, writePackageJSON } from './function'

const GET_INITIAL_PACKAGE_INFO = () => ({
  packageJSON: {},
  exportFilePairList: [],
  installFilePairList: []
})

const loadPackage = (inputPath, packageInfo = GET_INITIAL_PACKAGE_INFO(), loadedSet = new Set()) => {
  const { packageFile, packagePath } = formatPackagePath(inputPath)

  if (loadedSet.has(packageFile)) return packageInfo
  loadedSet.add(packageFile)

  const {
    __EXTRA__, // drop __EXTRA__ for config
    IMPORT: importList,
    EXPORT: exportList,
    INSTALL: installList,
    ...mergePackageJSON
  } = require(packageFile)
  const { packageJSON, exportFilePairList, installFilePairList } = packageInfo

  importList && importList.forEach((importPackagePath) => loadPackage(resolve(packagePath, importPackagePath), packageInfo, loadedSet))

  console.log(`[loadPackage] load: ${packageFile}`)
  installList && installList.forEach((filePath) => installFilePairList.push(parseResourcePath(filePath, packagePath)))
  exportList && exportList.forEach((filePath) => exportFilePairList.push(parseResourcePath(filePath, packagePath)))
  mergePackageJSON && objectMergeDeep(packageJSON, mergePackageJSON)
  return packageInfo
}

const parseResourcePath = (resourcePath, packagePath) => typeof (resourcePath) === 'object'
  ? [ resolve(packagePath, resourcePath.from), resourcePath.to ]
  : [ resolve(packagePath, resourcePath), resourcePath ]

const doPack = async ({
  pathInput,
  pathOutput,
  pathOutputInstall = resolve(pathOutput, 'install'),
  outputName,
  outputVersion,
  outputDescription,
  isPublish = false,
  isPublishDev = false,
  isDryRun = false
}) => {
  const { packageJSON, exportFilePairList, installFilePairList } = loadPackage(pathInput)
  if (outputName) packageJSON.name = outputName
  if (outputVersion) packageJSON.version = outputVersion
  if (outputDescription) packageJSON.description = outputDescription

  const fromOutput = (...args) => resolve(pathOutput, ...args)
  const logger = getLogger('pack')

  { // custom initOutput
    await resetDirectory(pathOutput)
    await createDirectory(pathOutputInstall)

    const { name, description } = packageJSON
    await writePackageJSON({ path: resolve(pathOutput, 'package.json'), packageJSON })
    writeFileSync(resolve(pathOutput, 'README.md'), [
      `# ${name}`,
      '',
      `[![i:npm]][l:npm]`,
      `[![i:size]][l:size]`,
      `[![i:npm-dev]][l:npm]`,
      '',
      `${description}`,
      '',
      // TODO: CHECK: may need custom url escape for name?
      `[i:npm]: https://img.shields.io/npm/v/${name}.svg`,
      `[i:npm-dev]: https://img.shields.io/npm/v/${name}/dev.svg`,
      `[l:npm]: https://npm.im/${name}`,
      `[i:size]: https://packagephobia.now.sh/badge?p=${name}`,
      `[l:size]: https://packagephobia.now.sh/result?p=${name}`
    ].join('\n'))

    for (const [ source, targetRelative ] of exportFilePairList) await modifyCopy(source, resolve(pathOutput, targetRelative))
    for (const [ source, targetRelative ] of installFilePairList) await modifyCopy(source, resolve(pathOutputInstall, targetRelative))
  }

  const pathPackagePack = await packOutput({ fromOutput, logger })
  await publishOutput({ extraArgs: isDryRun ? [ '--dry-run' ] : [], isPublish, isPublishDev, packageJSON, pathPackagePack, logger })
}

export { doPack }
