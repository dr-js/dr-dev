import { relative } from 'path'

import { padTable } from '@dr-js/core/module/common/format.js'
import { isVersionSpecComplex } from '@dr-js/core/module/common/module/SemVer.js'
import { loadPackageCombo, writePackageJSON } from '@dr-js/core/module/node/module/PackageJSON.js'

import { outdatedJSON, outdatedWithTempJSON } from 'source/node/package/Npm.js'

const sortResult = ({ dependencyInfoMap, outdatedMap, pathInput }) => {
  const sameTable = []
  const complexTable = []
  const outdatedTable = []

  for (const [ name, { wanted: versionWanted } ] of Object.entries(outdatedMap)) {
    const { versionSpec, packageInfo: { packageJSONPath } } = dependencyInfoMap[ name ]

    const rowList = [ name, versionSpec, versionWanted, relative(pathInput, packageJSONPath) || '-' ] // must match PAD_FUNC_LIST
    if (isVersionSpecComplex(versionSpec)) complexTable.push(rowList) // hard to parse
    else if (versionSpec.endsWith(versionWanted)) sameTable.push(rowList)
    else outdatedTable.push(rowList)
  }

  return { sameTable, complexTable, outdatedTable }
}

const logResult = ({ sameTable, complexTable, outdatedTable, log = console.log }) => {
  const total = sameTable.length + complexTable.length + outdatedTable.length
  __DEV__ && console.log(`Total: ${total} | Same: ${sameTable.length} | Complex: ${complexTable.length} | Outdated: ${outdatedTable.length}`)

  const outputList = []
  const sortPushTable = (table, title) => {
    table.sort(([ nameA, , , sourceA ], [ nameB, , , sourceB ]) => (sourceA !== sourceB) ? sourceA.localeCompare(sourceB) : nameA.localeCompare(nameB))
    table.length && outputList.push(`${title} [${table.length}/${total}]:`, padTable({ table, cellPad: ' | ' }))
  }
  sortPushTable(sameTable, 'SAME')
  sortPushTable(complexTable, 'COMPLEX')
  sortPushTable(outdatedTable, 'OUTDATED')

  log(outputList.join('\n'))
}

const writeBack = async ({ dependencyInfoMap, outdatedTable, log = console.log }) => {
  for (const [ name, versionSpec, versionWanted ] of outdatedTable) {
    const { packageInfo: { packageJSON, packageJSONPath } } = dependencyInfoMap[ name ]
    const versionSpecNext = [ versionSpec.split(/\d/)[ 0 ], versionWanted ].join('') // keep prefix like "^" & "~"
    const tryUpdate = (key) => {
      if (!packageJSON[ key ] || packageJSON[ key ][ name ] !== versionSpec) return
      log(`[writeBack] update ${key}/${name} from "${versionSpec}" to "${versionSpecNext}" in: ${packageJSONPath}`)
      packageJSON[ key ][ name ] = versionSpecNext
    }
    tryUpdate('dependencies')
    tryUpdate('devDependencies')
    tryUpdate('peerDependencies')
    tryUpdate('optionalDependencies')
    await writePackageJSON(packageJSONPath, packageJSON)
  }
}

const doCheckOutdated = async ({
  pathInput,
  pathTemp,
  isWriteBack = false,
  log = console.log
}) => {
  log(`[checkOutdated] checking '${pathInput}'`)
  const { packageInfoList, dependencyMap, dependencyInfoMap, duplicateInfoList } = await loadPackageCombo(pathInput)
  log(`[checkOutdated] get ${packageInfoList.length} package`)
  for (const { name, versionSpec, packageInfo: { packageJSONPath }, existPackageInfo } of duplicateInfoList) {
    log(`[WARN] dropped duplicate package: ${name} at ${relative(pathInput, packageJSONPath)} with version: ${versionSpec}, checking: ${existPackageInfo.versionSpec}`)
  }
  const outdatedMap = (!pathTemp && packageInfoList.length === 1)
    ? await outdatedJSON({ packageRoot: packageInfoList[ 0 ].packageRootPath }) // check in-place
    : await outdatedWithTempJSON({ // create temp path, do not work for private repo or altered ".npmrc"
      packageJSON: { dependencies: dependencyMap },
      pathTemp: (pathTemp && pathTemp !== 'AUTO') ? pathTemp : undefined
    })
  const { sameTable, complexTable, outdatedTable } = sortResult({ dependencyInfoMap, outdatedMap, pathInput })
  logResult({ sameTable, complexTable, outdatedTable, log })
  if (isWriteBack) await writeBack({ dependencyInfoMap, outdatedTable, log })
  else if (outdatedTable.length) throw new Error(`[checkOutdated] found ${outdatedTable.length} outdated package`)
}

export { doCheckOutdated }
