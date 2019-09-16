import { relative } from 'path'
import { readFileSync } from 'fs'
import { objectSortKey } from '@dr-js/core/module/common/mutable/Object'
import { getFileList } from '@dr-js/core/module/node/file/Directory'

const loadPackage = (pathInput, path, collect) => {
  const packageSource = relative(pathInput, path)
  __DEV__ && console.log(`[loadPackage] ${packageSource}`)
  const {
    dependencies,
    devDependencies,
    peerDependencies,
    optionalDependencies
  } = JSON.parse(readFileSync(path))
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
    ? (await getFileList(pathInput)).filter((path) => path.endsWith('package.json'))
    : [ pathInput ]
  const { collect, getResult } = createDependencyCollector()
  packageJsonList.forEach((path) => loadPackage(pathInput, path, collect))
  return getResult()
}

export { collectDependency }
