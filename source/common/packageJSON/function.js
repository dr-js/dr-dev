const toPackageInfo = ({
  packageJSON,
  packageJSONPath = '', packageRootPath = ''
}) => ({
  sourcePackageJSON: JSON.parse(JSON.stringify(packageJSON)), // backup, do not edit
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
  toPackageInfo,
  collectDependency
}
