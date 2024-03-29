import { resolve } from 'node:path'
import { strictEqual } from '@dr-js/core/module/common/verify.js'
import { getSampleRange } from '@dr-js/core/module/common/math/sample.js'
import { writeText } from '@dr-js/core/module/node/fs/File.js'
import { createDirectory, resetDirectory } from '@dr-js/core/module/node/fs/Directory.js'
import { modifyDelete } from '@dr-js/core/module/node/fs/Modify.js'
import { describeChecksumOfPathList } from '@dr-js/core/module/node/fs/Checksum.js'

import {
  loadStatFile, saveStatFile,
  checksumUpdate, checksumDetectChange
} from './checksum.js'

const { describe, it, before, after, info = console.log } = globalThis

const TEST_ROOT = resolve(__dirname, './test-checksum-gitignore/')
const fromRoot = (...args) => resolve(TEST_ROOT, ...args)

const TEST_CONFIG = {
  pathChecksumList: [
    fromRoot('sample-cache-file-0'),
    fromRoot('sample-cache-file-1'),

    fromRoot('sample-cache-dir-0/'),
    fromRoot('sample-cache-dir-1/')
  ],
  pathChecksumFile: fromRoot('sample-checksum-file'),
  pathStatFile: fromRoot('sample-stat')
}

before(async () => {
  await resetDirectory(TEST_ROOT)

  await writeText(fromRoot('sample-cache-file-0'), 'sample-cache-file-0')
  await writeText(fromRoot('sample-cache-file-1'), 'sample-cache-file-1')

  await createDirectory(fromRoot('sample-cache-dir-0'))
  for (const index of getSampleRange(0, 5)) await writeText(fromRoot('sample-cache-dir-0', `dir-0-${index}`), `dir-0-${index}`)
  await createDirectory(fromRoot('sample-cache-dir-1'))
  for (const index of getSampleRange(0, 5)) await writeText(fromRoot('sample-cache-dir-1', `dir-1-${index}`), `dir-1-${index}`)
})
after(async () => {
  await modifyDelete(TEST_ROOT)
})

describe('Node.Cache.Checksum', () => {
  it('checksumUpdate', async () => {
    __DEV__ && info(await describeChecksumOfPathList({ pathList: TEST_CONFIG.pathChecksumList }))

    strictEqual((await checksumUpdate(TEST_CONFIG, 'checksum-file-only')).isHashChanged, undefined)
    strictEqual((await checksumUpdate(TEST_CONFIG)).isHashChanged, false)
    strictEqual((await checksumUpdate(TEST_CONFIG)).isHashChanged, false)
    strictEqual((await checksumDetectChange(TEST_CONFIG)).isHashChanged, false)
    strictEqual((await checksumDetectChange(TEST_CONFIG)).isHashChanged, false)

    await writeText(fromRoot('sample-cache-file-1'), 'sample-cache-file-1 UPDATE')
    __DEV__ && info(await describeChecksumOfPathList({ pathList: TEST_CONFIG.pathChecksumList }))

    strictEqual((await checksumUpdate(TEST_CONFIG)).isHashChanged, true)
    strictEqual((await checksumUpdate(TEST_CONFIG)).isHashChanged, true)
    strictEqual((await checksumDetectChange(TEST_CONFIG)).isHashChanged, true)
    strictEqual((await checksumDetectChange(TEST_CONFIG)).isHashChanged, false)
    strictEqual((await checksumUpdate(TEST_CONFIG)).isHashChanged, false)
    strictEqual((await checksumUpdate(TEST_CONFIG, 'checksum-file-only')).isHashChanged, undefined)

    await saveStatFile(await loadStatFile(TEST_CONFIG))
  })
})
