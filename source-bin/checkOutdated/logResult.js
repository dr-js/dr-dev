import { padTable } from 'dr-js/module/common/format'
import { compareSemVer } from 'dr-js/module/common/module/SemVer'

const logResult = async (packageInfoMap, npmOutdatedOutputString) => {
  const sameTable = []
  const outdatedTable = []
  npmOutdatedOutputString.split('\n').forEach((outputLine) => {
    const [ , name, versionWanted, versionLatest ] = REGEXP_NPM_OUTDATED_OUTPUT.exec(outputLine.replace(REGEXP_ANSI_ESCAPE_CODE, '')) || []
    if (!packageInfoMap[ name ]) return
    const { version, source } = packageInfoMap[ name ]
    const versionTarget = compareSemVer(versionWanted, versionLatest) <= 0
      ? versionLatest
      : versionWanted
    const rowList = [ name, version, versionTarget, source ] // must match PAD_FUNC_LIST
    version.endsWith(versionTarget)
      ? sameTable.push(rowList)
      : outdatedTable.push(rowList)
  })

  const total = sameTable.length + outdatedTable.length
  __DEV__ && console.log(`Total: ${total} | Same: ${sameTable.length} | Outdated: ${outdatedTable.length}`)

  sameTable.sort(sortTableRow)
  sameTable.length && console.log(`SAME[${sameTable.length}/${total}]:\n${formatPadTable(sameTable)}`)
  outdatedTable.sort(sortTableRow)
  outdatedTable.length && console.error(`OUTDATED[${outdatedTable.length}/${total}]:\n${formatPadTable(outdatedTable)}`)

  return outdatedTable.length
}
const REGEXP_ANSI_ESCAPE_CODE = /\033\[[0-9;]*[a-zA-Z]/g // Match the terminal color code, Check: https://superuser.com/a/380778
const REGEXP_NPM_OUTDATED_OUTPUT = /(\S+)\s+\S+\s+(\S+)\s+(\S+)/ // Will Match: `(Package) Current (Wanted) (Latest) Location`
const sortTableRow = ([ nameA, , , sourceA ], [ nameB, , , sourceB ]) => (sourceA !== sourceB) ? sourceA.localeCompare(sourceB) : nameA.localeCompare(nameB)
const formatPadTable = (table) => padTable({ table, cellPad: ' | ', padFuncList: [ 'R', 'L', 'L', 'L' ] })

export { logResult }
