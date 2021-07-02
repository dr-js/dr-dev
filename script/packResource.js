import { resolve, dirname } from 'path'
import { objectMergeDeep } from '@dr-js/core/module/common/mutable/Object.js'
import { readJSON, writeText } from '@dr-js/core/module/node/fs/File.js'
import { resetDirectory } from '@dr-js/core/module/node/file/Directory.js'
import { modifyCopy } from '@dr-js/core/module/node/file/Modify.js'

import { savePackageJSON } from 'source/node/package/function.js'
import { getLogger } from 'source/node/logger.js'
import { packOutput, publishOutput } from 'source/output.js'
import { getFromPackExport, writePackExportInitJSON } from 'source-bin/function.js'

const GET_INITIAL_PACKAGE_INFO = () => ({ packageJSON: {}, exportPairList: [] })

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
  for (const [ targetRelative, packageJSON ] of Object.entries(targetPackageJSONMap)) await savePackageJSON({ packageJSONPath: fromPackExport(targetRelative), packageJSON })

  await writePackExportInitJSON({ pathPackage })
}

const loadPackage = async (configJSONFile, packageInfo = GET_INITIAL_PACKAGE_INFO(), loadedSet = new Set()) => {
  const configRootPath = dirname(configJSONFile)

  if (loadedSet.has(configJSONFile)) return packageInfo
  loadedSet.add(configJSONFile)

  const {
    __FLAVOR__, // drop __FLAVOR__ from packageJSON
    IMPORT: importList = [],
    EXPORT: exportList = [],
    ...mergePackageJSON
  } = require(configJSONFile)
  const { packageJSON, exportPairList } = packageInfo

  for (const importPackagePath of importList) await loadPackage(resolve(configRootPath, importPackagePath, 'package.json'), packageInfo, loadedSet)

  console.log(`[loadPackage] load: ${configJSONFile}`)
  exportList && exportList.forEach((filePath) => exportPairList.push(parseResourcePath(filePath, configRootPath)))
  mergePackageJSON && objectMergeDeep(packageJSON, mergePackageJSON)
  return packageInfo
}

const parseResourcePath = (resourcePath, configRootPath) => typeof (resourcePath) === 'object'
  ? [ resolve(configRootPath, resourcePath.from), resourcePath.to ]
  : [ resolve(configRootPath, resourcePath), resourcePath ]

const doPackResource = async ({
  configJSONFile,
  pathOutput,
  outputName,
  outputVersion,
  outputDescription,
  isPublish = false,
  isPublishDev = false,
  isDryRun = false
}) => {
  const { packageJSON, exportPairList } = await loadPackage(configJSONFile)
  if (outputName) packageJSON.name = outputName
  if (outputVersion) packageJSON.version = outputVersion
  if (outputDescription) packageJSON.description = outputDescription

  const fromOutput = (...args) => resolve(pathOutput, ...args)
  const logger = getLogger('pack')

  // custom initOutput
  await resetDirectory(pathOutput)
  await savePackageJSON({ packageJSONPath: resolve(pathOutput, 'package.json'), packageJSON })
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
