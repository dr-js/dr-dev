import {
  toPackageJSONPath,
  toPackageRootPath,
  writePackageJSON,
  editPackageJSON,
  loadPackageInfo,
  loadPackageInfoList,
  loadPackageCombo,
  savePackageInfo
} from '@dr-js/core/module/node/module/PackageJSON.js'

/** @deprecated */ const toPackageJSONPathExport = toPackageJSONPath // TODO: DEPRECATE
/** @deprecated */ const toPackageRootPathExport = toPackageRootPath // TODO: DEPRECATE
/** @deprecated */ const writePackageJSONExport = writePackageJSON // TODO: DEPRECATE
/** @deprecated */ const editPackageJSONExport = editPackageJSON // TODO: DEPRECATE
/** @deprecated */ const loadPackageInfoExport = loadPackageInfo // TODO: DEPRECATE
/** @deprecated */ const loadPackageInfoListExport = loadPackageInfoList // TODO: DEPRECATE
/** @deprecated */ const loadPackageComboExport = loadPackageCombo // TODO: DEPRECATE
/** @deprecated */ const savePackageInfoExport = savePackageInfo // TODO: DEPRECATE

export {
  toPackageJSONPathExport as toPackageJSONPath, // TODO: DEPRECATE
  toPackageRootPathExport as toPackageRootPath, // TODO: DEPRECATE
  writePackageJSONExport as writePackageJSON, // TODO: DEPRECATE
  editPackageJSONExport as editPackageJSON, // TODO: DEPRECATE
  loadPackageInfoExport as loadPackageInfo, // TODO: DEPRECATE
  loadPackageInfoListExport as loadPackageInfoList, // TODO: DEPRECATE
  loadPackageComboExport as loadPackageCombo, // TODO: DEPRECATE
  savePackageInfoExport as savePackageInfo, // TODO: DEPRECATE
  savePackageInfoExport as savePackageJSON // TODO: DEPRECATE: bad naming
}
