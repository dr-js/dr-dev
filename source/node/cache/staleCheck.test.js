import { resolve } from 'path'
import { promises as fsAsync } from 'fs'
import { setTimeoutAsync } from '@dr-js/core/module/common/time.js'
import { getSampleRange } from '@dr-js/core/module/common/math/sample.js'
import { createDirectory, resetDirectory } from '@dr-js/core/module/node/file/Directory.js'
import { modifyDelete } from '@dr-js/core/module/node/file/Modify.js'

import {
  staleCheckSetup, staleCheckMark, staleCheckCalcReport,
  loadStatFile, saveStatFile
} from './staleCheck.js'

const { describe, it, before, after, info = console.log } = global

const TEST_ROOT = resolve(__dirname, './test-stale-check-gitignore/')
const fromRoot = (...args) => resolve(TEST_ROOT, ...args)

const TEST_CONFIG = {
  pathStaleCheckList: [
    // fromRoot('sample-cache-file-0'),
    fromRoot('sample-cache-file-1'),
    fromRoot('sample-cache-file-2'),
    fromRoot('sample-cache-file-3'),
    fromRoot('sample-cache-file-4'),

    // fromRoot('sample-cache-dir-0/'),
    fromRoot('sample-cache-dir-1/'),
    fromRoot('sample-cache-dir-2/'),
    fromRoot('sample-cache-dir-3/'),
    fromRoot('sample-cache-dir-4/'),

    fromRoot('sample-cache-path-not-exist/')
  ],
  pathStatFile: fromRoot('sample-stat'),
  maxStaleDay: 60 / (24 * 60 * 60 * 1000) // 60msec
}

before(async () => {
  await resetDirectory(TEST_ROOT)

  await fsAsync.writeFile(fromRoot('sample-cache-file-0'), 'sample-cache-file-0')
  await fsAsync.writeFile(fromRoot('sample-cache-file-1'), 'sample-cache-file-1')
  await fsAsync.writeFile(fromRoot('sample-cache-file-2'), 'sample-cache-file-2')

  await createDirectory(fromRoot('sample-cache-dir-0'))
  for (const index of getSampleRange(0, 5)) await fsAsync.writeFile(fromRoot('sample-cache-dir-0', `dir-0-${index}`), `dir-0-${index}`)

  await setTimeoutAsync(50)

  await fsAsync.writeFile(fromRoot('sample-cache-file-3'), 'sample-cache-file-3')

  await createDirectory(fromRoot('sample-cache-dir-1'))
  for (const index of getSampleRange(0, 5)) await fsAsync.writeFile(fromRoot('sample-cache-dir-1', `dir-1-${index}`), `dir-1-${index}`)
})
after(async () => {
  await modifyDelete(TEST_ROOT)
})

describe('Node.Cache.StaleCheck', () => {
  it('staleCheck setup/mark/calc-report', async () => {
    await staleCheckSetup(TEST_CONFIG)
    await setTimeoutAsync(10)

    await fsAsync.writeFile(fromRoot('sample-cache-file-4'), 'sample-cache-file-4')

    await createDirectory(fromRoot('sample-cache-dir-2'))
    for (const index of getSampleRange(0, 5)) await fsAsync.writeFile(fromRoot('sample-cache-dir-2', `dir-2-${index}`), `dir-2-${index}`)

    await createDirectory(fromRoot('sample-cache-dir-3'))
    for (const index of getSampleRange(0, 5)) await fsAsync.writeFile(fromRoot('sample-cache-dir-3', `dir-3-${index}`), `dir-3-${index}`)

    await staleCheckMark(TEST_CONFIG)
    await setTimeoutAsync(10)

    await createDirectory(fromRoot('sample-cache-dir-3'))
    for (const index of getSampleRange(3, 5)) await fsAsync.readFile(fromRoot('sample-cache-dir-2', `dir-2-${index}`))
    for (const index of getSampleRange(0, 5)) await fsAsync.writeFile(fromRoot('sample-cache-dir-3', `dir-3-${index}`), `dir-3-${index}`)
    await createDirectory(fromRoot('sample-cache-dir-4'))
    for (const index of getSampleRange(0, 5)) await fsAsync.writeFile(fromRoot('sample-cache-dir-4', `dir-4-${index}`), `dir-4-${index}`)

    const { report } = await staleCheckCalcReport(TEST_CONFIG)

    // console.log({ report })
    info(JSON.stringify(report, null, 2))

    await saveStatFile(await loadStatFile(TEST_CONFIG))
  })
})
