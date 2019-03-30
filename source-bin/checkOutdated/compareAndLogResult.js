import { padTable } from 'dr-js/module/common/format'
import { compareSemVer } from 'dr-js/module/common/module/SemVer'

const compareAndLogResult = async (packageInfoMap, npmOutdatedOutputString) => {
  const sameTable = []
  const complexTable = []
  const outdatedTable = []

  npmOutdatedOutputString.split('\n').forEach((outputLine) => {
    const [ , name, versionWanted, versionLatest ] = REGEXP_NPM_OUTDATED_OUTPUT.exec(outputLine.replace(REGEXP_ANSI_ESCAPE_CODE, '')) || []
    if (!packageInfoMap[ name ]) return

    const { version, source } = packageInfoMap[ name ]
    const versionTarget = compareSemVer(versionWanted, versionLatest) <= 0 // select bigger version
      ? versionLatest
      : versionWanted

    const rowList = [ name, version, versionTarget, source ] // must match PAD_FUNC_LIST

    if (version.includes('||') || version.includes('&&')) complexTable.push(rowList) // TODO: try parse later?
    else if (version.endsWith(versionTarget)) sameTable.push(rowList)
    else outdatedTable.push(rowList)
  })

  const total = sameTable.length + complexTable.length + outdatedTable.length
  __DEV__ && console.log(`Total: ${total} | Same: ${sameTable.length} | Complex: ${complexTable.length} | Outdated: ${outdatedTable.length}`)

  const outputList = []
  const sortPushTable = (table, title) => {
    table.sort(([ nameA, , , sourceA ], [ nameB, , , sourceB ]) => (sourceA !== sourceB) ? sourceA.localeCompare(sourceB) : nameA.localeCompare(nameB))
    table.length && outputList.push(`${title} [${table.length}/${total}]:`, padTable({ table, cellPad: ' | ', padFuncList: [ 'R', 'L', 'L', 'L' ] }))
  }

  sortPushTable(sameTable, 'SAME')
  sortPushTable(complexTable, 'COMPLEX')
  sortPushTable(outdatedTable, 'OUTDATED')

  console.log(outputList.join('\n'))

  return outdatedTable.length
}

const REGEXP_ANSI_ESCAPE_CODE = /\033\[[0-9;]*[a-zA-Z]/g // Match the terminal color code, Check: https://superuser.com/a/380778
const REGEXP_NPM_OUTDATED_OUTPUT = /(\S+)\s+\S+\s+(\S+)\s+(\S+)/ // Will Match: `(Package) Current (Wanted) (Latest) Location`

export { compareAndLogResult }
