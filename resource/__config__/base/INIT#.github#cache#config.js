module.exports = {
  // cacheStep: '', // pass from CLI
  prunePolicy: 'unused',
  pathStatFile: './persist-gitignore/stat',
  pathChecksumList: [ // NOTE: this list of file should decide when the cache content should change, if the cache is npm only, `package-lock.json` should be enough
    // '../../source/',
    '../../package-lock.json'
  ],
  pathChecksumFile: './temp-gitignore/checksum-file',
  pathStaleCheckList: [
    // './node_modules/', // NOTE: 'node_modules' is managed, so no stale-check required
    '~/.npm/' // NOTE: win32 need to reset cache location
  ],
  pathStaleCheckFile: './temp-gitignore/stale-check-file',
  maxStaleDay: 8
}
