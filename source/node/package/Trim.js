import { join, relative } from 'node:path'

import { toPosixPath } from '@dr-js/core/module/node/fs/Path.js'
import { getFileList } from '@dr-js/core/module/node/fs/Directory.js'
import { modifyDelete } from '@dr-js/core/module/node/fs/Modify.js'

const getRelativePosixFileList = async (pathRoot) => getFileList(pathRoot, (fileList, { path }) => {
  fileList.push(toPosixPath(`./${relative(pathRoot, path)}`))
})

const trimFile = async ( // TODO: NOTE: now only file will get deleted, may leave some empty folder
  pathRoot,
  shouldTrim = (relativeFile) => false // return true to trim
) => {
  const relativeFileList = await getRelativePosixFileList(pathRoot)
  const trimFileList = []
  for (const relativeFile of relativeFileList) {
    if (!shouldTrim(relativeFile)) continue
    trimFileList.push(relativeFile)
    await modifyDelete(join(pathRoot, relativeFile))
  }
  return trimFileList
}

// from: https://github.com/tj/node-prune/blob/v1.2.0/internal/prune/prune.go
// also: https://superuser.com/questions/126290/find-files-filtered-by-multiple-extensions
const shouldTrimNodeModules = (relativeFile) => {
  relativeFile = relativeFile.toLowerCase()

  // special keep
  for (const mark of [
    '/.bin/',
    '/.local-chromium/'
  ]) if (relativeFile.includes(mark)) return false

  // trim all dot file & folder
  if (relativeFile.includes('/.')) return true

  // directory
  for (const pattern of [
    // common pattern to remove
    '/test/', '/tests/', '/__tests__/', '/powered-test/',
    '/doc/', '/docs/',
    '/example/', '/examples/',
    '/coverage/', '/coverages/'
    // trim for specific package
    // '/ajv/dist/',
    // '/bluebird/js/browser/',
    // '/uri-js/dist/esnext/'
  ]) if (relativeFile.includes(pattern)) return true

  // file
  for (const pattern of [
    // common extension to remove
    '.md', '.mkd', '.markdown',
    '.test.js', '.spec.js',
    '.conf.js', '.config.js', '.config.json',
    '.ts', '.jst', '.coffee',
    '.map',
    '.css', '.html', '.htm',
    '.tgz', '.swp',
    '.c', '.cc', '.cpp', '.h',
    '.bat', '.cmd',
    // file name
    '/makefile', '/configure',
    '/readme', '/changelog', '/changes',
    '/authors', '/contributors',
    '/package-lock.json', '/yarn.lock'
  ]) if (relativeFile.endsWith(pattern)) return true

  return false // keep
}

const shouldTrimRubyGem = (relativeFile) => {
  relativeFile = relativeFile.toLowerCase()

  // trim all dot file & folder
  if (relativeFile.includes('/.')) return true

  // directory
  for (const pattern of [
    // common pattern to remove
    '/doc/', '/docs/',
    '/example/', '/examples/',
    '/coverage/', '/coverages/',
    '/tmp/'
  ]) if (relativeFile.includes(pattern)) return true

  // file
  for (const pattern of [
    // common extension to remove
    '.md', '.mkd', '.markdown',
    '.rdoc',
    '.c', '.cc', '.cpp', '.h',
    '.bat', '.cmd',
    'gemfile.lock', // https://stackoverflow.com/questions/7919913/are-you-supposed-to-include-gemfile-lock-in-a-published-gem
    // file name
    '/makefile', '/configure',
    '/readme', '/changelog', '/changes',
    '/authors', '/contributors'
  ]) if (relativeFile.endsWith(pattern)) return true

  return false // keep
}

const trimFileNodeModules = async (pathNodeModules) => trimFile(pathNodeModules, shouldTrimNodeModules)
const trimFileRubyGem = async (pathRubyGem) => trimFile(pathRubyGem, shouldTrimRubyGem)

export {
  trimFile,
  trimFileNodeModules, trimFileRubyGem
}
