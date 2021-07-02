import { relative } from 'path'

import { padTable } from '@dr-js/core/module/common/format.js'

import { isVersionSpecComplex } from 'source/common/packageJSON/Version.js'
import { loadPackageCombo } from 'source/node/package/function.js'
import { outdatedWithTempJSON } from 'source/node/package/Npm.js'

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

const logResult = ({ sameTable, complexTable, outdatedTable }) => {
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

  console.log(outputList.join('\n'))
}

const doCheckOutdated = async ({
  pathInput,
  pathTemp
}) => {
  console.log(`[checkOutdated] checking '${pathInput}'`)
  const { packageInfoList, dependencyMap, dependencyInfoMap, duplicateInfoList } = await loadPackageCombo(pathInput)
  console.log(`[checkOutdated] get ${packageInfoList.length} package`)
  for (const { name, versionSpec, packageInfo: { packageJSONPath }, existPackageInfo } of duplicateInfoList) {
    console.warn(`[WARN] dropped duplicate package: ${name} at ${relative(pathInput, packageJSONPath)} with version: ${versionSpec}, checking: ${existPackageInfo.versionSpec}`)
  }
  const outdatedMap = await outdatedWithTempJSON({ packageJSON: { dependencies: dependencyMap }, pathTemp })
  const { sameTable, complexTable, outdatedTable } = sortResult({ dependencyInfoMap, outdatedMap, pathInput })
  logResult({ sameTable, complexTable, outdatedTable })
  outdatedTable.length && process.exit(outdatedTable.length)
}

export { doCheckOutdated }
