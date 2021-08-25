import {
  versionBumpByGitBranch,
  versionBumpToIdentifier,
  versionBumpLastNumber,
  versionBumpToLocal,
  isVersionSpecComplex
} from '@dr-js/core/module/common/module/SemVer.js'

/** @deprecated */ const versionBumpByGitBranchExport = versionBumpByGitBranch // TODO: DEPRECATE
/** @deprecated */ const versionBumpToIdentifierExport = versionBumpToIdentifier // TODO: DEPRECATE
/** @deprecated */ const versionBumpLastNumberExport = versionBumpLastNumber // TODO: DEPRECATE
/** @deprecated */ const versionBumpToLocalExport = versionBumpToLocal // TODO: DEPRECATE
/** @deprecated */ const isVersionSpecComplexExport = isVersionSpecComplex // TODO: DEPRECATE

export {
  versionBumpByGitBranchExport as versionBumpByGitBranch, // TODO: DEPRECATE
  versionBumpToIdentifierExport as versionBumpToIdentifier, // TODO: DEPRECATE
  versionBumpLastNumberExport as versionBumpLastNumber, // TODO: DEPRECATE
  versionBumpToLocalExport as versionBumpToLocal, // TODO: DEPRECATE
  isVersionSpecComplexExport as isVersionSpecComplex // TODO: DEPRECATE
}
