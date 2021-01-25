import { readFileSync } from 'fs'

import { runSync } from '@dr-js/core/module/node/run'

import { formatPackagePath, writePackageJSON } from '../function'

const REGEXP_PACKAGE_VERSION = /^(\d+\.\d+\.\d+(?:-\w+\.\d+)*?)(?:-local\.)?(\d+)?$/ // check: https://regexr.com/419ol

const REGEXP_PACKAGE_MAIN_VERSION = /^(\d+\.\d+)\.(\d+)(?:-dev\.)?(\d+)?$/ // check: https://regexr.com/41ccr

const stepPackageVersion = (version, isStepPatchVersion) => {
  const [ , mainVersion, labelLocalString ] = REGEXP_PACKAGE_VERSION.exec(version) || []
  if (!mainVersion) throw new Error(`[StepPackageVersion] invalid version format: ${version}, expect: ${REGEXP_PACKAGE_VERSION}`)

  let nextMainVersion = mainVersion
  if (isStepPatchVersion) {
    const [ , majorMinorString, patchString, labelDevString ] = REGEXP_PACKAGE_MAIN_VERSION.exec(mainVersion) || []
    if (!majorMinorString || !patchString) throw new Error(`[StepPackageVersion] invalid main version format: ${mainVersion}, expect: ${REGEXP_PACKAGE_MAIN_VERSION}`)

    let patch = Number(patchString)
    let labelDev = labelDevString ? Number(labelDevString) : 0
    labelDevString ? labelDev++ : patch++
    nextMainVersion = `${majorMinorString}.${patch}-dev.${labelDev}`
  }

  const labelLocal = isStepPatchVersion ? 0
    : labelLocalString ? Number(labelLocalString) + 1
      : 0
  const nextVersion = `${nextMainVersion}-local.${labelLocal}`

  return { version, nextVersion, mainVersion, nextMainVersion }
}

const doStepPackageVersion = async ({
  pathInput,
  isSortKey = false,
  isGitCommit = false,
  log = console.log
}) => {
  const { packageFile, packagePath } = formatPackagePath(pathInput)
  const packageJSON = JSON.parse(String(readFileSync(packageFile)))
  const { name, version } = packageJSON
  const { nextVersion, nextMainVersion } = stepPackageVersion(version, isGitCommit)

  log(`[StepPackageVersion] next: ${nextVersion}, prev: ${version}`)
  writePackageJSON({ path: packageFile, packageJSON: { ...packageJSON, version: nextVersion }, isSortKey })

  if (!isGitCommit) return

  const messageTitle = `${name}@${nextMainVersion}`
  const messageContent = [
    `[WIP] ${name}@${nextVersion}`,
    'notable change:',
    '- break: use `NEW` instead of `OLD`',
    '- deprecate: `OLD`, use `NEW`',
    '- fix: some strange bug in `PATH`',
    '- add: `FUNC` to `PATH`',
    '- script sort',
    '- package update'
  ].join('\n')

  log(`[StepPackageVersion] git commit message: '${messageTitle}'`)
  runSync([ 'git', 'add', packageFile ], { cwd: packagePath })
  runSync([ 'git', 'commit', '-m', messageTitle, '-m', messageContent ], { cwd: packagePath })
}

export { doStepPackageVersion }
