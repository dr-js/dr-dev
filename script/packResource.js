import { resolve, dirname } from 'path'
import { objectMergeDeep } from '@dr-js/core/module/common/mutable/Object.js'
import { readJSON, writeText } from '@dr-js/core/module/node/fs/File.js'
import { resetDirectory } from '@dr-js/core/module/node/fs/Directory.js'
import { modifyCopy } from '@dr-js/core/module/node/fs/Modify.js'

import { writePackageJSON } from 'source/node/package/function.js'
import { getLogger } from 'source/node/logger.js'
import { packOutput, publishOutput } from 'source/output.js'
import { getFromPackExport, writePackExportInitJSON } from 'source-bin/function.js'

const copyAndSavePackExportInitJSON = async ({
  pathPackage,
  exportPairList
}) => {
  const fromPackExport = getFromPackExport(pathPackage)
  const targetFileMap = {} // deduplicate
  const targetPackageJSONMap = {} // merge
  for (const [ source, targetRelative ] of exportPairList) {
    if (targetRelative.endsWith('package.json')) {
      let packageJSON = await readJSON(source)
      if (targetPackageJSONMap[ targetRelative ]) packageJSON = objectMergeDeep(targetPackageJSONMap[ targetRelative ], packageJSON)
      targetPackageJSONMap[ targetRelative ] = packageJSON
    } else targetFileMap[ targetRelative ] = source
  }

  for (const [ targetRelative, source ] of Object.entries(targetFileMap)) await modifyCopy(source, fromPackExport(targetRelative))
  for (const [ targetRelative, packageJSON ] of Object.entries(targetPackageJSONMap)) await writePackageJSON(fromPackExport(targetRelative), packageJSON, 'sort-key')

  await writePackExportInitJSON({ pathPackage })
}

const loadConfig = async ({
  configJSONFile, logger,
  packageJSON = {}, exportPairList = [], loadedSet = new Set()
}) => {
  const loopLoad = async (configJSONFile) => {
    if (loadedSet.has(configJSONFile)) return
    loadedSet.add(configJSONFile)

    const {
      __FLAVOR__, // drop __FLAVOR__ from packageJSON
      IMPORT: importList = [],
      EXPORT: exportList = [],
      ...mergePackageJSON
    } = await readJSON(configJSONFile)

    const configRootPath = dirname(configJSONFile)
    for (const importPackagePath of importList) await loopLoad(resolve(configRootPath, importPackagePath, 'package.json'))

    logger.log(`load: ${configJSONFile}`)
    exportList && exportList.forEach((filePath) => exportPairList.push(parseResourcePath(filePath, configRootPath)))
    mergePackageJSON && objectMergeDeep(packageJSON, mergePackageJSON)
  }

  await loopLoad(configJSONFile)
  return { packageJSON, exportPairList }
}

const parseResourcePath = (resourcePath, configRootPath) => typeof (resourcePath) === 'object'
  ? [ resolve(configRootPath, resourcePath.from), resourcePath.to ]
  : [ resolve(configRootPath, resourcePath), resourcePath ]

const doPackResource = async ({
  configJSONFile, pathOutput,
  outputName, outputVersion, outputDescription,
  isPublish = false, isPublishDev = false, isDryRun = false,
  logger = getLogger('pack')
}) => {
  const { packageJSON, exportPairList } = await loadConfig({ configJSONFile, logger })
  if (outputName) packageJSON.name = outputName
  if (outputVersion) packageJSON.version = outputVersion
  if (outputDescription) packageJSON.description = outputDescription

  const fromOutput = (...args) => resolve(pathOutput, ...args)

  // custom initOutput
  await resetDirectory(pathOutput)
  await writePackageJSON(resolve(pathOutput, 'package.json'), packageJSON, 'sort-key')
  await writeText(resolve(pathOutput, 'README.md'), getREADME(packageJSON))
  await copyAndSavePackExportInitJSON({ pathPackage: pathOutput, exportPairList })

  const pathPackagePack = await packOutput({ fromOutput, logger })
  await publishOutput({
    extraArgs: isDryRun ? [ '--dry-run' ] : [],
    isPublishAuto: false, isPublish, isPublishDev,
    packageJSON, pathPackagePack,
    logger
  })
}

const getREADME = ({ name, description }) => [
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
].join('\n')

export { doPackResource }
