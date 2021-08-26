const { resolve } = require('path')
const { setTimeoutAsync } = require('@dr-js/core/library/common/time.js')
const { getPathStat } = require('@dr-js/core/library/node/fs/Path.js')
const { readText, writeText } = require('@dr-js/core/library/node/fs/File.js')
const { createDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyDeleteForce } = require('@dr-js/core/library/node/fs/Modify.js')

const PATH_ROOT = resolve(__dirname, 'stale-check-gitignore/')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const getStatTime = ({ atime, mtime, ctime, birthtime }) => [ atime.toISOString(), mtime.toISOString(), ctime.toISOString(), birthtime.toISOString() ].join(' | ')

// test with `npx @dr-js/core@0.4 -eI staleCheckDetect.test.js`

const main = async () => {
  await modifyDeleteForce(fromRoot())
  await createDirectory(fromRoot())

  const PATH_FILE = fromRoot('test')

  await writeText(PATH_FILE, 'init')
  await setTimeoutAsync(10)
  console.log('init   ', getStatTime(await getPathStat(PATH_FILE)))

  await readText(PATH_FILE)
  await setTimeoutAsync(10)
  console.log('read   ', getStatTime(await getPathStat(PATH_FILE)))

  await writeText(PATH_FILE, 'write')
  await setTimeoutAsync(10)
  console.log('write  ', getStatTime(await getPathStat(PATH_FILE)))

  await readText(PATH_FILE)
  await setTimeoutAsync(10)
  console.log('read   ', getStatTime(await getPathStat(PATH_FILE)))

  await writeText(PATH_FILE, 'write')
  await setTimeoutAsync(10)
  console.log('write  ', getStatTime(await getPathStat(PATH_FILE)))

  await modifyDeleteForce(fromRoot())
}

main().catch(console.error)
