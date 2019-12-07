import { resolve, dirname, basename, relative } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { binary } from '@dr-js/core/module/common/format'
import { objectMergeDeep, objectSortKey } from '@dr-js/core/module/common/mutable/Object'
import { visibleAsync } from '@dr-js/core/module/node/file/function'
import { getFileList } from '@dr-js/core/module/node/file/Directory'
import { modifyCopy, modifyDeleteForce } from '@dr-js/core/module/node/file/Modify'

const formatPackagePath = (packagePath) => {
  const packageFile = packagePath.endsWith('.json') ? packagePath : resolve(packagePath, 'package.json')
  if (packagePath.endsWith('.json')) packagePath = dirname(packagePath)
  return { packageFile, packagePath }
}

const PACKAGE_KEY_SORT_REQUIRED = [
  'bundledDependencies',
  'peerDependencies',
  'dependencies',
  'devDependencies',
  'optionalDependencies'
]

const PACKAGE_KEY_ORDER = [
  'private',
  'name', 'version', 'description',
  'author', 'contributors', 'maintainers',
  'license', 'keywords',
  'repository', 'homepage', 'bugs',
  'main', 'bin', 'browser',
  'man', 'files', 'directories',
  'scripts', 'config', 'publishConfig',
  'os', 'cpu', 'engines', 'engineStrict',
  ...PACKAGE_KEY_SORT_REQUIRED
]
const getPackageKeyOrder = (key) => {
  const index = PACKAGE_KEY_ORDER.indexOf(key)
  return index === -1 ? Infinity : index
}

const writePackageJSON = ({
  path,
  packageJSON,
  isSortKey = true,
  log = console.log
}) => {
  isSortKey && PACKAGE_KEY_SORT_REQUIRED.forEach((key) => { packageJSON[ key ] && objectSortKey(packageJSON[ key ]) })
  isSortKey && objectSortKey(packageJSON, (a, b) => getPackageKeyOrder(a) - getPackageKeyOrder(b))
  const packageBuffer = Buffer.from(`${JSON.stringify(packageJSON, null, 2)}\n`)
  writeFileSync(path, packageBuffer)
  log(`[writePackageJSON] ${path} [${binary(packageBuffer.length)}B]`)
}

const loadPackage = (pathInput, path, collect) => {
  const packageSource = relative(pathInput, path)
  __DEV__ && console.log(`[loadPackage] ${packageSource}`)
  const {
    dependencies,
    devDependencies,
    peerDependencies,
    optionalDependencies
  } = JSON.parse(String(readFileSync(path)))
  dependencies && collect(dependencies, packageSource)
  devDependencies && collect(devDependencies, packageSource)
  peerDependencies && collect(peerDependencies, packageSource)
  optionalDependencies && collect(optionalDependencies, packageSource)
}

const createDependencyCollector = () => {
  let packageInfoMap = {} // [name]: { name, version, source }
  const collect = (dependencyObject, source) => Object.entries(dependencyObject).forEach(([ name, version ]) => {
    if (packageInfoMap[ name ]) return console.warn(`[collect] dropped duplicate package: ${name} at ${source} with version: ${version}, checking: ${packageInfoMap[ name ].version}`)
    packageInfoMap[ name ] = { name, version, source }
  })
  const getResult = () => {
    const result = objectSortKey(packageInfoMap)
    packageInfoMap = {}
    return result
  }
  return { collect, getResult }
}

const collectDependency = async (pathInput, isRecursive) => {
  const packageJsonList = isRecursive
    ? (await getFileList(pathInput)).filter((path) => basename(path) === 'package.json')
    : [ pathInput ]
  const { collect, getResult } = createDependencyCollector()
  packageJsonList.forEach((path) => loadPackage(pathInput, path, collect))
  return getResult()
}

const NAME_PACK_EXPORT = 'EXPORT'
const NAME_PACK_EXPORT_INIT_JSON = 'INIT.json'

const copyAndSavePackExportInitJSON = async (
  pathPackage,
  exportPairList
) => {
  const targetFileMap = {} // deduplicate
  const targetPackageJSONMap = {} // merge
  for (const [ source, targetRelative ] of exportPairList) {
    if (targetRelative.endsWith('package.json')) {
      let packageJSON = JSON.parse(String(readFileSync(source)))
      if (targetPackageJSONMap[ targetRelative ]) packageJSON = objectMergeDeep(targetPackageJSONMap[ targetRelative ], packageJSON)
      targetPackageJSONMap[ targetRelative ] = packageJSON
    } else targetFileMap[ targetRelative ] = source
  }

  for (const [ targetRelative, source ] of Object.entries(targetFileMap)) await modifyCopy(source, resolve(pathPackage, NAME_PACK_EXPORT, targetRelative))
  for (const [ targetRelative, packageJSON ] of Object.entries(targetPackageJSONMap)) writePackageJSON({ path: resolve(pathPackage, NAME_PACK_EXPORT, targetRelative), packageJSON })

  const initFilePrefix = resolve(pathPackage, NAME_PACK_EXPORT, 'INIT#')
  writeFileSync(
    resolve(pathPackage, NAME_PACK_EXPORT, NAME_PACK_EXPORT_INIT_JSON),
    JSON.stringify((await getFileList(resolve(pathPackage, NAME_PACK_EXPORT)))
      .filter((path) => path.startsWith(initFilePrefix))
      .map((path) => [
        basename(path), // relative source
        path.slice(initFilePrefix.length).replace(/#/g, '/') // relative output
      ]), null, 2)
  )
}

const loadAndCopyPackExportInitJSON = async (
  pathPackage,
  pathOutput,
  isReset = false
) => {
  const initPairList = JSON.parse(String(readFileSync(resolve(pathPackage, NAME_PACK_EXPORT, NAME_PACK_EXPORT_INIT_JSON)))) // get init list

  if (!isReset) { // check if file overwrite will happen
    for (const [ , relativeInitPath ] of initPairList) {
      if (await visibleAsync(resolve(pathOutput, relativeInitPath))) throw new Error(`quit reset existing file: ${relativeInitPath}`)
    }
  }

  for (const [ sourceName, relativeInitPath ] of initPairList) { // put/reset file to output path
    const sourcePath = resolve(pathPackage, NAME_PACK_EXPORT, sourceName)
    const initPath = resolve(pathOutput, relativeInitPath)
    await modifyDeleteForce(initPath)
    await modifyCopy(sourcePath, initPath)
    // update file content
    REGEXP_TEXT_FILE.test(relativeInitPath) && writeFileSync(initPath, String(readFileSync(initPath))
      .replace(/\{FLAVOR}/g, /@dr-js[/\\]dev-([\w-]+)$/.exec(pathPackage)[ 1 ])
      .replace(/\{FLAVOR-VERSION}/g, JSON.parse(String(readFileSync(resolve(pathPackage, 'package.json')))).version)
    )
    console.log(`[init] file: ${relativeInitPath}`)
  }
}
const REGEXP_TEXT_FILE = /\.(js|json|md|ya?ml|gitignore)$/

export {
  formatPackagePath,
  writePackageJSON,
  collectDependency,
  copyAndSavePackExportInitJSON,
  loadAndCopyPackExportInitJSON
}
