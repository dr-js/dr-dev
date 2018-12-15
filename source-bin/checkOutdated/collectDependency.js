import { relative } from 'path'
import { readFileSync } from 'fs'
import { objectSortKey } from 'dr-js/module/common/mutable/Object'
import { getPathStat } from 'dr-js/module/node/file/File'
import { getFileList } from 'dr-js/module/node/file/Directory'

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
  let dependencyMap = {} // [name]: version
  const collect = (dependencyObject, source) => Object.entries(dependencyObject).forEach(([ name, version ]) => {
    if (packageInfoMap[ name ]) return console.warn(`[collect] dropped duplicate package: ${name} at ${source} with version: ${version}, checking: ${packageInfoMap[ name ].version}`)
    packageInfoMap[ name ] = { name, version, source }
    dependencyMap[ name ] = version
  })
  const getResult = () => {
    objectSortKey(dependencyMap)
    const result = { packageInfoMap, dependencyMap }
    packageInfoMap = {}
    dependencyMap = {}
    return result
  }
  return { collect, getResult }
}

const collectDependency = async (pathInput) => {
  const { collect, getResult } = createDependencyCollector()
  const isDirectory = (await getPathStat(pathInput)).isDirectory()
  if (isDirectory) {
    (await getFileList(pathInput))
      .filter((path) => path.endsWith('package.json'))
      .forEach((path) => loadPackage(pathInput, path, collect))
  } else {
    loadPackage(pathInput, pathInput, collect)
  }
  const { packageInfoMap, dependencyMap } = getResult()
  return {
    isDirectory,
    packageInfoMap,
    dependencyMap
  }
}

export { collectDependency }
