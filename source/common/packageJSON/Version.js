import { parseSemVer } from '@dr-js/core/module/common/module/SemVer.js'

// bump version by current git branch name
//   main/master:
//     1.0.0 -> 1.0.1
//     1.0.0-with-label -> 1.0.0
//   other-dev-branch:
//     1.0.0 -> 1.0.1-otherdevbranch.0
//     1.0.0-with-label -> 1.0.0-otherdevbranch.0
//     1.0.0-otherdevbranch.0 -> 1.0.0-otherdevbranch.1
const versionBumpByGitBranch = (version, {
  gitBranch, // = getGitBranch(),
  getIsMajorBranch = (gitBranch) => [ 'master', 'main' ].includes(gitBranch),
  isMajorBranch = getIsMajorBranch(gitBranch)
}) => {
  const { major, minor, patch, label } = parseSemVer(version)
  if (isMajorBranch) { // X.Y.Z for non-dev branch
    const bumpPatch = label
      ? patch // just drop label
      : parseInt(patch) + 1 // bump patch
    return `${major}.${minor}.${bumpPatch}`
  } else { // X.Y.Z-labelGitBranch.A for dev branch
    const labelGitBranch = gitBranch.replace(/\W/g, '')
    return versionBumpToIdentifier(version, { identifier: labelGitBranch })
  }
}

// bump version to have label identifier
//   1.0.0 -> 1.0.1-TEST.0
//   1.0.0-dev.0 -> 1.0.0-TEST.0
//   1.0.0-TEST.0 -> 1.0.0-TEST.1
const versionBumpToIdentifier = (version, {
  identifier = 'TEST'
}) => {
  const { major, minor, patch, label } = parseSemVer(version)
  if (label.startsWith(`-${identifier}.`)) {
    const revString = label.slice(`-${identifier}.`.length)
    if (/\d+/.test(revString)) return versionBumpLastNumber(version)
  }
  return `${major}.${minor}.${label ? patch : patch + 1}-${identifier}.0`
}

// bump visible last number, including number in label
//   1.0.0 -> 1.0.1
//   1.0.0-dev.0 -> 1.0.0-dev.1
//   1.0.0-dev19abc -> 1.0.0-dev20abc
const versionBumpLastNumber = (version) => {
  parseSemVer(version) // verify
  if (!REGEXP_LAST_NUMBER.test(version)) throw new Error(`[versionBumpLastNumber] no number to bump in version: ${version}`)
  return version.replace(REGEXP_LAST_NUMBER, (match, $1, $2) => `${parseInt($1) + 1}${$2}`)
}
const REGEXP_LAST_NUMBER = /(\d+)(\D*)$/

// bump version so local package do not mask later release (the local version should be smaller than next release version)
//   1.0.0 -> 1.0.0-local.0
//   1.0.0-local.0 -> 1.0.0-local.1
//   1.0.0-with-label -> 1.0.0-with-label.local.0
//   1.0.0-with-label.local.0 -> 1.0.0-with-label.local.1
const versionBumpToLocal = (version) => {
  const { major, minor, patch, label } = parseSemVer(version)
  if (!label) return `${major}.${minor}.${patch}-local.0` // non-dev version, append with "-"
  else if (!REGEXP_LABEL_LOCAL.test(label)) return `${major}.${minor}.${patch}${label}.local.0` // non-local dev version, append with "."
  else return versionBumpLastNumber(version) // local dev version, bump
}
const REGEXP_LABEL_LOCAL = /^-(?:.*\.)?local\.\d+$/

const isVersionSpecComplex = (versionSpec) => ( // https://docs.npmjs.com/cli/v7/configuring-npm/package-json#dependencies
  versionSpec.includes(' ') || // multiple version: `>a <b`, `a || b`
  versionSpec.includes(':') || // protocol: `file:`, `npm:`, `https:`
  versionSpec.includes('/') // url or local path
)

export {
  versionBumpByGitBranch,
  versionBumpToIdentifier,
  versionBumpLastNumber,
  versionBumpToLocal,
  isVersionSpecComplex
}
