const { resolve } = require('path')
const { homedir } = require('os')

module.exports = {
  // cacheStep: '', // pass from CLI
  prunePolicy: 'unused',

  pathStatFile: './persist-gitignore/cache-stat',

  pathChecksumList: [
    '../../source/',
    '../../source-bin/',
    '../../package-lock.json'
  ],
  pathChecksumFile: './temp-gitignore/cache-step-checksum-file',

  pathStaleCheckList: [
    resolve(homedir(), '.npm/')
    // node_modules is managed, so no stale-check required
  ],
  pathStaleCheckFile: './temp-gitignore/cache-step-stale-check-file',
  maxStaleDay: 8
}
