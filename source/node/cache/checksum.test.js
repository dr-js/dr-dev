import { promises as fsAsync } from 'fs'
import { resolve } from 'path'
import { strictEqual, doThrowAsync } from '@dr-js/core/module/common/verify'
import { getSampleRange } from '@dr-js/core/module/common/math/sample'
import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { modifyDelete } from '@dr-js/core/module/node/file/Modify'
import { resetDirectory } from '../file'

import {
  describeChecksumOfPathList,

  loadStatFile, saveStatFile,
  checksumUpdate, checksumDetectChange
} from './checksum'

const { describe, it, before, after, info = console.log } = global

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

before('prepare', async () => {
  await resetDirectory(TEST_ROOT)

  await fsAsync.writeFile(fromRoot('sample-cache-file-0'), 'sample-cache-file-0')
  await fsAsync.writeFile(fromRoot('sample-cache-file-1'), 'sample-cache-file-1')

  await createDirectory(fromRoot('sample-cache-dir-0'))
  for (const index of getSampleRange(0, 5)) await fsAsync.writeFile(fromRoot('sample-cache-dir-0', `dir-0-${index}`), `dir-0-${index}`)
  await createDirectory(fromRoot('sample-cache-dir-1'))
  for (const index of getSampleRange(0, 5)) await fsAsync.writeFile(fromRoot('sample-cache-dir-1', `dir-1-${index}`), `dir-1-${index}`)
})
after('clear', async () => {
  await modifyDelete(TEST_ROOT)
})

describe('Node.Cache.Checksum', () => {
  it('getChecksumFileOfPathList', async () => strictEqual(
    await describeChecksumOfPathList({
      pathList: [
        fromRoot('sample-cache-file-0'),
        fromRoot('sample-cache-file-1'),
        fromRoot('sample-cache-dir-0/'),
        fromRoot('sample-cache-dir-1/')
      ]
    }),
    await describeChecksumOfPathList({
      pathList: [
        fromRoot('sample-cache-dir-0/'),
        fromRoot('sample-cache-dir-1/'),
        fromRoot('sample-cache-file-0'),
        fromRoot('sample-cache-file-1')
      ]
    }),
    'path order should not matter'
  ))

  it('getChecksumFileOfPathList path must exist', async () => doThrowAsync(() => describeChecksumOfPathList({
    pathList: [
      fromRoot('sample-cache-file-not-exist')
    ]
  })))

  it('checksumUpdate', async () => {
    __DEV__ && info(await describeChecksumOfPathList({ pathList: TEST_CONFIG.pathChecksumList }))

    strictEqual((await checksumUpdate(TEST_CONFIG)).isHashChanged, false)
    strictEqual((await checksumUpdate(TEST_CONFIG)).isHashChanged, false)
    strictEqual((await checksumDetectChange(TEST_CONFIG)).isHashChanged, false)
    strictEqual((await checksumDetectChange(TEST_CONFIG)).isHashChanged, false)

    await fsAsync.writeFile(fromRoot('sample-cache-file-1'), 'sample-cache-file-1 UPDATE')
    __DEV__ && info(await describeChecksumOfPathList({ pathList: TEST_CONFIG.pathChecksumList }))

    strictEqual((await checksumUpdate(TEST_CONFIG)).isHashChanged, true)
    strictEqual((await checksumUpdate(TEST_CONFIG)).isHashChanged, true)
    strictEqual((await checksumDetectChange(TEST_CONFIG)).isHashChanged, true)
    strictEqual((await checksumDetectChange(TEST_CONFIG)).isHashChanged, false)
    strictEqual((await checksumUpdate(TEST_CONFIG)).isHashChanged, false)

    await saveStatFile(await loadStatFile(TEST_CONFIG))
  })
})
