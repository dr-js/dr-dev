import { objectSortKey } from '@dr-js/core/module/common/mutable/Object.js'

const dupJSON = (packageJSON) => JSON.parse(JSON.stringify(packageJSON))

const PACKAGE_KEY_DEV_EXEC_COMMAND_MAP = 'devExecCommands'

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
  'scripts',
  PACKAGE_KEY_DEV_EXEC_COMMAND_MAP, // extend from this package
  'config', 'publishConfig',
  'os', 'cpu', 'engines', 'engineStrict',
  ...PACKAGE_KEY_SORT_REQUIRED
]
const getPackageKeyOrder = (key) => {
  const index = PACKAGE_KEY_ORDER.indexOf(key)
  return index === -1 ? PACKAGE_KEY_ORDER.length : index
}

const sortPackageJSON = (packageJSON) => {
  packageJSON = dupJSON(packageJSON)
  PACKAGE_KEY_SORT_REQUIRED.forEach((key) => { packageJSON[ key ] && objectSortKey(packageJSON[ key ]) })
  objectSortKey(packageJSON, (a, b) => getPackageKeyOrder(a) - getPackageKeyOrder(b))
  return packageJSON
}
const packPackageJSON = (packageJSON) => `${JSON.stringify(packageJSON, null, 2)}\n` // npm will add extra `\n` to the output

const toPackageInfo = ({
  packageJSON,
  packageJSONPath = '', packageRootPath = ''
}) => ({
  sourcePackageJSON: dupJSON(packageJSON), // backup, do not edit
  packageJSON, // allow edit
  packageJSONPath, packageRootPath
})

const collectDependency = (packageInfo, {
  dependencyMap = {},
  dependencyInfoMap = {},
  duplicateInfoList = []
} = {}) => { // allow merge multiple package
  const {
    dependencies = {},
    devDependencies = {},
    peerDependencies = {},
    optionalDependencies = {}
  } = packageInfo.packageJSON
  for (const dependencyObject of [
    dependencies,
    devDependencies,
    peerDependencies,
    optionalDependencies
  ]) {
    for (const [ name, versionSpec ] of Object.entries(dependencyObject)) {
      if (dependencyInfoMap[ name ]) duplicateInfoList.push({ name, versionSpec, packageInfo, existPackageInfo: dependencyInfoMap[ name ] })
      else {
        dependencyMap[ name ] = versionSpec
        dependencyInfoMap[ name ] = { name, versionSpec, packageInfo }
      }
    }
  }
  return { dependencyMap, dependencyInfoMap, duplicateInfoList }
}

export {
  PACKAGE_KEY_DEV_EXEC_COMMAND_MAP,
  sortPackageJSON, packPackageJSON,
  toPackageInfo,
  collectDependency
}
