import { resolve } from 'path'
import { statSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { binary } from '@dr-js/core/module/common/format'
import { objectMergeDeep } from '@dr-js/core/module/common/mutable/Object'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { modifyCopy, modifyDeleteForce } from '@dr-js/core/module/node/file/Modify'
import { runSync } from '@dr-js/core/module/node/system/Run'

import { getPackageTgzName } from '@dr-js/dev/module/output'

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
  isPublish,
  isPublishDev
}) => {
  const { packageJSON, exportFilePairList, installFilePairList } = loadPackage(pathInput)
  if (outputName) packageJSON.name = outputName
  if (outputVersion) packageJSON.version = outputVersion
  if (outputDescription) packageJSON.description = outputDescription

  await modifyDeleteForce(pathOutput)
  await createDirectory(pathOutput)
  await createDirectory(pathOutputInstall)

  await writePackageJSON({ path: resolve(pathOutput, 'package.json'), packageJSON })
  writeFileSync(resolve(pathOutput, 'README.md'), [
    `# ${packageJSON.name}\n`,
    `[![i:npm]][l:npm]`,
    `[![i:size]][l:size]`,
    `[![i:npm-dev]][l:npm]`,
    '',
    `${packageJSON.description}`,
    '',
    // TODO: CHECK: may need custom url escape for name?
    `[i:npm]: https://img.shields.io/npm/v/${packageJSON.name}.svg`,
    `[i:npm-dev]: https://img.shields.io/npm/v/${packageJSON.name}/dev.svg`,
    `[l:npm]: https://npm.im/${packageJSON.name}`,
    `[i:size]: https://packagephobia.now.sh/badge?p=${packageJSON.name}`,
    `[l:size]: https://packagephobia.now.sh/result?p=${packageJSON.name}`
  ].join('\n'))

  for (const [ source, targetRelative ] of exportFilePairList) await modifyCopy(source, resolve(pathOutput, targetRelative))
  for (const [ source, targetRelative ] of installFilePairList) await modifyCopy(source, resolve(pathOutputInstall, targetRelative))

  execSync('npm --no-update-notifier pack', { cwd: pathOutput, stdio: 'inherit', shell: true })
  const outputFileName = getPackageTgzName(packageJSON)
  const outputFilePath = resolve(pathOutput, outputFileName)
  console.log(`done pack: ${outputFileName} [${binary(statSync(outputFilePath).size)}B]`)

  // NOTE: if this process is run under yarn, the registry will be pointing to `https://registry.yarnpkg.com/`, and auth for publish will not work
  // if (isPublish || isPublishDev) runSync({ command: 'npm', argList: [ 'config', 'get', 'userconfig' ] })
  // if (isPublish || isPublishDev) runSync({ command: 'npm', argList: [ 'config', 'get', 'registry' ] })
  // if (isPublish || isPublishDev) runSync({ command: 'npm', argList: [ 'whoami' ] })
  if (isPublish || isPublishDev) runSync({ command: 'npm', argList: [ 'publish', outputFilePath, '--tag', isPublishDev ? 'dev' : 'latest', '--access', 'public' ], option: { shell: true } })
}

export { doPack }
