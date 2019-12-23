const { escapeRegExp } = require('@dr-js/core/library/common/string')

const buildMatchRegexp = (stringList) => {
  if (stringList.length === 0) throw new Error(`mission string to match for`)
  return new RegExp(stringList.map(escapeRegExp).join('|'))
}
const buildVerifyFunc = ({ verifyPreNoList, verifyNoList }) => {
  if (!verifyNoList || !verifyNoList.length) return
  const regExpVerifyNo = buildMatchRegexp(verifyNoList)
  if (!verifyPreNoList || !verifyPreNoList.length) return (string) => regExpVerifyNo.test(string) === false // return true to pass
  const regExpVerifyPreNo = buildMatchRegexp(verifyNoList)
  return (string) => ( // return true to pass
    regExpVerifyPreNo.test(string) === false || // pre-check
    regExpVerifyNo.test(string) === false
  )
}
const normalizeRule = ({
  messageBreakIn,
  messageSuggestIn,
  messageList = [],
  selectPathList = [],
  selectFileExtension,
  selectFileAllowNodeModule = false,
  selectFilterFile = selectFileAllowNodeModule
    ? (selectFileExtension ? (path) => path.endsWith(selectFileExtension) : undefined)
    : (selectFileExtension ? (path) => path.endsWith(selectFileExtension) && !path.includes('node_modules') : (path) => !path.includes('node_modules')),
  verifyPreNoList,
  verifyNoList,
  verifyFunc = buildVerifyFunc({ verifyPreNoList, verifyNoList })
}) => {
  messageSuggestIn && messageList.push(`suggested in \`${messageSuggestIn}\``)
  messageBreakIn && messageList.push(`break change in \`${messageBreakIn}\``)
  return {
    messageList,
    selectPathList, selectFilterFile,
    verifyFunc
  }
}

const VERIFY_RULE_LIST = [ {
  messageList: [ 'use `extraPresetList/extraPluginList` instead of `presetExtra/pluginExtra` for `getBabelConfig/getWebpackBabelConfig`' ],
  messageBreakIn: 'dr-dev@0.0.6-dev.1',
  selectPathList: [ 'babel.config.js', 'script/' ],
  selectFileExtension: '.js',
  verifyPreNoList: [ 'getBabelConfig', 'getWebpackBabelConfig' ],
  verifyNoList: [ 'presetExtra', 'pluginExtra' ]
}, {
  messageList: [ 'use `execShell` instead of `execOptionRoot`' ],
  messageSuggestIn: '@dr-js/dev@0.1.1',
  selectPathList: [ 'script/' ],
  selectFileExtension: '.js',
  verifyNoList: [ 'execOptionRoot' ]
}, {
  messageList: [ 'use `logger` directly instead of `logger: { padLog }`' ],
  messageSuggestIn: '@dr-js/dev@0.1.1',
  selectPathList: [ 'script/' ],
  selectFileExtension: '.js',
  verifyNoList: [ 'logger: { padLog' ]
}, {
  messageList: [ 'use `JSON.parse(String(readFile()))` instead of `JSON.parse(readFile())`' ],
  messageSuggestIn: '@dr-js/dev@0.2.0-dev.1',
  selectPathList: [ 'script/', 'source/', 'source-bin/' ],
  selectFileExtension: '.js',
  verifyNoList: [ 'JSON.parse(readFile', 'JSON.parse(await readFile' ]
}, {
  messageList: [ 'use `modifyRename/renamePath/renameDirectoryInfoTree` instead of `modifyMove/movePath/moveDirectoryInfoTree`' ],
  messageBreakIn: '@dr-js/core@0.2.0-dev.5',
  selectPathList: [ 'script/', 'source/', 'source-bin/' ],
  selectFileExtension: '.js',
  verifyNoList: [ 'modifyMove', 'movePath', 'moveDirectoryInfoTree' ]
}, {
  messageList: [ 'use `path:rename/PATH_RENAME` instead of `path:move/PATH_MOVE`' ],
  messageBreakIn: '@dr-js/node@0.2.0-dev.4',
  selectPathList: [ 'script/', 'source/', 'source-bin/' ],
  selectFileExtension: '.js',
  verifyNoList: [ 'path:move', 'PATH_MOVE' ]
}, {
  messageList: [ 'add `isTest` before `verifyGitStatusClean` to allow dev packing' ],
  messageSuggestIn: '@dr-js/dev@0.2.3-dev.0',
  selectPathList: [ 'script/' ],
  selectFileExtension: '.js',
  verifyNoList: [ '  await verifyGitStatusClean({ fromRoot, logger })' ]
}, {
  messageList: [ 'use `resolve(...)` instead of `resolve(process.cwd(), ...)`' ],
  messageSuggestIn: '@dr-js/dev@0.2.3-dev.0',
  selectPathList: [ 'script/', 'source/', 'source-bin/' ],
  selectFileExtension: '.js',
  verifyNoList: [ 'resolve(process.cwd()' ]
} ].map(normalizeRule)

module.exports = { VERIFY_RULE_LIST }
