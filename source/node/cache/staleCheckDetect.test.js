const { resolve } = require('path')
const { promises: fsAsync } = require('fs')
const { setTimeoutAsync } = require('@dr-js/core/library/common/time')
const { getPathStat } = require('@dr-js/core/library/node/file/Path')
const { createDirectory } = require('@dr-js/core/library/node/file/Directory')
const { modifyDeleteForce } = require('@dr-js/core/library/node/file/Modify')

const PATH_ROOT = resolve(__dirname, 'stale-check-gitignore/')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const getStatTime = ({ atime, mtime, ctime, birthtime }) => [ atime.toISOString(), mtime.toISOString(), ctime.toISOString(), birthtime.toISOString() ].join(' | ')

// test with `npx @dr-js/core@0.4 -eI staleCheckDetect.test.js`

const main = async () => {
  await modifyDeleteForce(fromRoot())
  await createDirectory(fromRoot())

  const PATH_FILE = fromRoot('test')

  await fsAsync.writeFile(PATH_FILE, 'init')
  await setTimeoutAsync(10)
  console.log('init   ', getStatTime(await getPathStat(PATH_FILE)))

  await fsAsync.readFile(PATH_FILE)
  await setTimeoutAsync(10)
  console.log('read   ', getStatTime(await getPathStat(PATH_FILE)))

  await fsAsync.writeFile(PATH_FILE, 'write')
  await setTimeoutAsync(10)
  console.log('write  ', getStatTime(await getPathStat(PATH_FILE)))

  await fsAsync.readFile(PATH_FILE)
  await setTimeoutAsync(10)
  console.log('read   ', getStatTime(await getPathStat(PATH_FILE)))

  await fsAsync.writeFile(PATH_FILE, 'write')
  await setTimeoutAsync(10)
  console.log('write  ', getStatTime(await getPathStat(PATH_FILE)))

  await modifyDeleteForce(fromRoot())
}

main().catch(console.error)
