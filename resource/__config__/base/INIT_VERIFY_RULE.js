const { escapeRegExp } = require('@dr-js/core/library/common/string')

const buildMatchRegexp = (stringList) => {
  if (stringList.length === 0) throw new Error('mission string to match for')
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
  messageBreakIn = '',
  messageSuggestIn = '',
  messageList = [],
  selectPathList = [ '.' ],
  selectFileExtension = '.js',
  selectFileExcludeRegexp = /(?:node_modules|-gitignore)/, // not check `node_modules` or `*-gitignore`
  selectFilterFile = selectFileExcludeRegexp
    ? (selectFileExtension ? (path) => path.endsWith(selectFileExtension) && !selectFileExcludeRegexp.test(path) : (path) => !selectFileExcludeRegexp.test(path))
    : (selectFileExtension ? (path) => path.endsWith(selectFileExtension) : undefined),
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

const VERIFY_RULE_LIST = [ { // @dr-js/core break change
  messageBreakIn: '@dr-js/core@0.2.0-dev.0',
  messageList: [ 'use `applyReceiveFileListListener` instead of `applyDragFileListListener` from `browser/DOM`' ],
  verifyNoList: [ 'applyDragFileListListener' ]
}, {
  messageBreakIn: '@dr-js/core@0.2.0-dev.5',
  messageList: [ 'use `modifyRename/renamePath/renameDirectoryInfoTree` instead of `modifyMove/movePath/moveDirectoryInfoTree`' ],
  verifyNoList: [ 'modifyMove', 'movePath', 'moveDirectoryInfoTree' ]
}, {
  messageBreakIn: '@dr-js/core@0.3.0-dev.0',
  messageList: [ 'mass code sort in `node/data/Stream`' ],
  verifyNoList: [ 'receiveBufferAsync', 'sendBufferAsync', 'pipeStreamAsync', 'createReadlineFromStreamAsync' ]
}, {
  messageBreakIn: '@dr-js/core@0.3.0-dev.1',
  messageList: [ 'use `requestHttp` instead of `requestAsync` from `node/net`' ],
  verifyNoList: [ 'requestAsync' ]
}, {
  messageBreakIn: '@dr-js/core@0.3.0-dev.1',
  messageList: [ 'use `objectFilter` instead of `objectDeleteUndefined`' ],
  verifyNoList: [ 'objectDeleteUndefined' ]
}, {
  messageBreakIn: '@dr-js/core@0.3.0-dev.5',
  messageList: [ 'use `AsyncLane` with `AsyncTaskQueue` support instead of `AsyncTaskLane`' ],
  verifyNoList: [ 'AsyncTaskLane' ]
}, {
  messageBreakIn: '@dr-js/core@0.3.0-dev.5',
  messageList: [ 'use `AsyncTaskQueue + AsyncLane` instead of `AsyncTaskRunnerCluster`' ],
  verifyNoList: [ 'AsyncTaskRunner' ]
}, {
  messageBreakIn: '@dr-js/core@0.3.0-dev.6',
  messageList: [ 'use `getDefaultOpenCommandList` instead of `getDefaultOpen`' ],
  verifyNoList: [ 'getDefaultOpen(' ]
}, {
  messageBreakIn: '@dr-js/core@0.3.0-dev.9',
  messageList: [ 'browser: use `onProgressUpload/onProgressDownload` instead of `onUploadProgress/onDownloadProgress` for `fetchLikeRequest`' ],
  verifyNoList: [ 'onUploadProgress', 'onDownloadProgress' ]
}, {
  messageBreakIn: '@dr-js/core@0.3.0-dev.11',
  messageList: [ 'drop `node/file/function`, use `fs` directly' ],
  verifyNoList: [ '@dr-js/core/library/node/file/function', '@dr-js/core/module/node/file/function' ]
}, {
  messageBreakIn: '@dr-js/core@0.3.0-dev.11',
  messageList: [ 'sort `node/file/Directory`' ],
  verifyNoList: [ 'getDirectorySubInfoList', 'DirectoryInfoTree' ]
}, {
  messageBreakIn: '@dr-js/core@0.3.0-dev.11',
  messageList: [ 'use `prettyStringifyTreeNode` instead of `prettyStringifyTree`' ],
  verifyNoList: [ 'prettyStringifyTree(' ]
}, { // @dr-js/node break change
  messageBreakIn: '@dr-js/node@0.2.0-dev.4',
  messageList: [ 'use `path:rename/PATH_RENAME` instead of `path:move/PATH_MOVE`' ],
  verifyNoList: [ 'path:move', 'PATH_MOVE' ]
}, {
  messageBreakIn: '@dr-js/node@0.3.0-dev.0',
  messageList: [ '`fileTLS*` option of `configureServerPack` from `module/ServerPack`, use `TLSSNIConfig|TLSDHParam` instead' ],
  verifyNoList: [ 'fileTLS' ]
}, {
  messageBreakIn: '@dr-js/node@0.3.0-dev.2',
  messageList: [ 'use `ResolveCommand` from `@dr-js/core`' ],
  verifyNoList: [ '@dr-js/node/library/module/ResolveCommand', '@dr-js/node/module/module/ResolveCommand' ]
}, {
  messageBreakIn: '@dr-js/node@0.3.0-dev.6',
  messageList: [ 'drop `compressFileConfig` from `module/Software/7z`' ],
  verifyPreNoList: [ 'module/Software/7z' ],
  verifyNoList: [ 'compressFileConfig' ]
}, { // @dr-js/dev break change
  messageBreakIn: 'dr-dev@0.0.6-dev.1',
  messageList: [ 'use `extraPresetList/extraPluginList` instead of `presetExtra/pluginExtra` for `getBabelConfig/getWebpackBabelConfig`' ],
  selectPathList: [ 'babel.config.js', 'script/' ],
  verifyPreNoList: [ 'getBabelConfig', 'getWebpackBabelConfig' ],
  verifyNoList: [ 'presetExtra', 'pluginExtra' ]
}, {
  messageBreakIn: '@dr-js/dev@0.3.0-dev.2',
  messageList: [ 'use `pathAutoLicenseFile` instead of `pathLicenseFile`' ],
  verifyNoList: [ 'pathLicenseFile' ]
}, {
  messageBreakIn: '@dr-js/dev@0.3.0-dev.2',
  messageList: [ 'use `getSourceJsFileListFromPathList` instead of `getScriptFileListFromPathList`' ],
  verifyNoList: [ 'getScriptFileListFromPathList' ]
}, {
  messageBreakIn: '@dr-js/dev@0.3.0-dev.2',
  messageList: [ 'use `collectSourceJsRouteMap` instead of `collectSourceRouteMap`' ],
  verifyNoList: [ 'collectSourceRouteMap' ]
}, { // suggest
  messageSuggestIn: '@dr-js/dev@0.1.1',
  messageList: [ 'use `execShell` instead of `execOptionRoot`' ],
  selectPathList: [ 'script/' ],
  verifyNoList: [ 'execOptionRoot' ]
}, {
  messageSuggestIn: '@dr-js/dev@0.1.1',
  messageList: [ 'use `logger` directly instead of `logger: { ... }` or `const { ... } = logger`' ],
  selectPathList: [ 'script/' ],
  verifyNoList: [ 'logger: { padLog', 'logger: { log', '} = logger' ]
}, {
  messageSuggestIn: '@dr-js/dev@0.2.0-dev.1',
  messageList: [ 'use `JSON.parse(String(readFile()))` instead of `JSON.parse(readFile())`' ],
  verifyNoList: [ 'JSON.parse(readFile', 'JSON.parse(await readFile' ]
}, {
  messageSuggestIn: '@dr-js/dev@0.2.3-dev.0',
  messageList: [ 'add `isTest` before `verifyGitStatusClean` to allow dev packing' ],
  selectPathList: [ 'script/' ],
  verifyNoList: [ '  await verifyGitStatusClean({ fromRoot, logger })' ]
}, {
  messageSuggestIn: '@dr-js/dev@0.2.3-dev.0',
  messageList: [ 'use `resolve(...)` instead of `resolve(process.cwd(), ...)`' ],
  verifyNoList: [ 'resolve(process.cwd()' ]
}, {
  messageSuggestIn: '@dr-js/dev@0.3.0-dev.10',
  messageList: [ 'use `request.destroy()|request.destroyed` instead of `request.abort()|request.aborted` follow: https://github.com/nodejs/node/pull/32807' ],
  verifyNoList: [ 'request.abort' ]
} ].map(normalizeRule)

module.exports = { VERIFY_RULE_LIST }
