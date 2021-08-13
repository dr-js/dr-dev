import { resolve, dirname } from 'path'
import { objectMergeDeep } from '@dr-js/core/module/common/mutable/Object.js'
import { readJSON, writeText } from '@dr-js/core/module/node/fs/File.js'
import { resetDirectory } from '@dr-js/core/module/node/fs/Directory.js'
import { modifyCopy } from '@dr-js/core/module/node/fs/Modify.js'
import { writePackageJSON } from '@dr-js/core/module/node/module/PackageJSON.js'

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
  configJSONFile, kit,
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

    kit.log(`load: ${configJSONFile}`)
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
  kit
}) => {
  const { packageJSON, exportPairList } = await loadConfig({ configJSONFile, kit })
  if (outputName) packageJSON.name = outputName
  if (outputVersion) packageJSON.version = outputVersion
  if (outputDescription) packageJSON.description = outputDescription

  // custom initOutput
  await resetDirectory(pathOutput)
  await writePackageJSON(resolve(pathOutput, 'package.json'), packageJSON, 'sort-key')
  await writeText(resolve(pathOutput, 'README.md'), getREADME(packageJSON))
  await copyAndSavePackExportInitJSON({ pathPackage: pathOutput, exportPairList })

  const pathPackagePack = await packOutput({ kit, fromOutput: (...args) => resolve(pathOutput, ...args) })
  await publishOutput({
    extraArgs: isDryRun ? [ '--dry-run' ] : [],
    isPublishAuto: false, isPublish, isPublishDev,
    packageJSON, pathPackagePack,
    kit
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
