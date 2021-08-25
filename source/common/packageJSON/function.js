import {
  sortPackageJSON,
  packPackageJSON,
  toPackageInfo,
  collectDependency,
  getFirstBinPath
} from '@dr-js/core/module/common/module/PackageJSON.js'

/** @deprecated */ const PACKAGE_KEY_DEV_EXEC_COMMAND_MAP = 'devExecCommands' // TODO: DEPRECATE

/** @deprecated */ const sortPackageJSONExport = sortPackageJSON // TODO: DEPRECATE
/** @deprecated */ const packPackageJSONExport = packPackageJSON // TODO: DEPRECATE
/** @deprecated */ const toPackageInfoExport = toPackageInfo // TODO: DEPRECATE
/** @deprecated */ const collectDependencyExport = collectDependency // TODO: DEPRECATE
/** @deprecated */ const getFirstBinPathExport = getFirstBinPath // TODO: DEPRECATE

export {
  PACKAGE_KEY_DEV_EXEC_COMMAND_MAP, // TODO: DEPRECATE
  sortPackageJSONExport as sortPackageJSON, // TODO: DEPRECATE
  packPackageJSONExport as packPackageJSON, // TODO: DEPRECATE
  toPackageInfoExport as toPackageInfo, // TODO: DEPRECATE
  collectDependencyExport as collectDependency, // TODO: DEPRECATE
  getFirstBinPathExport as getFirstBinPath // TODO: DEPRECATE
}
