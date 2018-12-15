import { readFileSync } from 'fs'

import { runSync } from 'dr-js/module/node/system/Run'

import { formatPackagePath, writePackageJSON } from './function'

const REGEXP_PACKAGE_VERSION = /^(\d+\.\d+\.\d+(?:-\w+\.\d+)*?)(?:-local\.)?(\d+)?$/ // check: https://regexr.com/419ol

const REGEXP_PACKAGE_MAIN_VERSION = /^(\d+\.\d+)\.(\d+)(?:-dev\.)?(\d+)?$/ // check: https://regexr.com/41ccr

const stepPackageVersion = (version, isStepMainVersion) => {
  const [ , mainVersion, labelLocalString ] = REGEXP_PACKAGE_VERSION.exec(version) || []
  if (!mainVersion) throw new Error(`[StepPackageVersion] invalid version format: ${version}, expect: ${REGEXP_PACKAGE_VERSION}`)

  let nextMainVersion = mainVersion
  if (isStepMainVersion) {
    const [ , majorMinorString, patchString, labelDevString ] = REGEXP_PACKAGE_MAIN_VERSION.exec(mainVersion) || []
    if (!majorMinorString || !patchString) throw new Error(`[StepPackageVersion] invalid main version format: ${mainVersion}, expect: ${REGEXP_PACKAGE_MAIN_VERSION}`)

    let patch = Number(patchString)
    let labelDev = labelDevString ? Number(labelDevString) : 0
    labelDevString ? labelDev++ : patch++
    nextMainVersion = `${majorMinorString}.${patch}-dev.${labelDev}`
  }

  const labelLocal = isStepMainVersion ? 0
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
  const packageJSON = JSON.parse(readFileSync(packageFile))
  const { name, version } = packageJSON
  const { nextVersion, nextMainVersion } = stepPackageVersion(version, isGitCommit)

  log(`[StepPackageVersion] next: ${nextVersion}, prev: ${version}`)
  await writePackageJSON({ path: packageFile, packageJSON: { ...packageJSON, version: nextVersion }, isSortKey })

  if (!isGitCommit) return

  const messageTitle = `${name}@${nextMainVersion}`
  const messageContent = [
    `notable change:`,
    `- [WIP] name: ${name}`,
    `- [WIP] version: ${nextVersion}`
  ].join('\n')

  log(`[StepPackageVersion] git commit message: '${messageTitle}'`)
  runSync({ command: 'git', argList: [ 'add', packageFile ], option: { cwd: packagePath, shell: false } })
  runSync({ command: 'git', argList: [ 'commit', '-m', messageTitle, '-m', messageContent ], option: { cwd: packagePath, shell: false } })
}

export { doStepPackageVersion }
