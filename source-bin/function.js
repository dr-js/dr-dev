import { resolve, dirname } from 'path'
import { writeFileSync } from 'fs'
import { binary } from 'dr-js/module/common/format'
import { objectSortKey } from 'dr-js/module/common/mutable/Object'

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

const writePackageJSON = async ({
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

export {
  formatPackagePath,
  writePackageJSON
}
