import { relative } from 'path'

import { toPosixPath } from '@dr-js/core/module/node/file/Path'
import { getFileList } from '@dr-js/core/module/node/file/Directory'

import { TEST_SETUP, TEST_RUN, describe } from '@dr-js/dev/module/common/test'

const doTestRoot = async ({
  testRoot = process.cwd(),
  testFileSuffixList = [ '.js' ],
  testRequireList = [],
  testTimeout = 10 * 1000
}) => {
  const testPathFunc = (testFileSuffixList && testFileSuffixList.length)
    ? (path) => testFileSuffixList.find((testFileSuffix) => path.endsWith(testFileSuffix))
    : null
  const fileList = await getFileList(testRoot, testPathFunc
    ? (fileList, { path }) => testPathFunc(path) && fileList.push(path)
    : (fileList, { path }) => fileList.push(path)
  )
  if (!fileList.length) throw new Error([ 'no test file selected', `with suffix "${testFileSuffixList.join(',')}"`, `from ${testRoot}` ].filter(Boolean).join(' '))

  for (const testRequire of testRequireList) { // load pre require, mostly `@babel/register`
    try { require(testRequire) } catch (error) {
      console.error(`failed to require "${testRequire}"`)
      throw error
    }
  }

  TEST_SETUP({ timeout: testTimeout })

  for (const file of fileList) {
    try {
      describe( // add one more scope for file
        `[FILE] ${toPosixPath(relative(testRoot, file))}`,
        () => { require(file) }
      )
    } catch (error) {
      console.error(`failed to load test file "${file}"`)
      throw error
    }
  }

  const { passList, failList } = await TEST_RUN()

  const failCount = failList.length
  const testCount = passList.length + failCount
  if (failCount) throw new Error(`${failCount} of ${testCount} test fail from ${fileList.length} file`)
}

const doTestRootList = async ({
  testRootList = [ process.cwd() ],
  testFileSuffixList = [ '.js' ],
  testRequireList = [],
  testTimeout = 10 * 1000
}) => {
  for (const testRoot of testRootList) {
    await doTestRoot({
      testRoot,
      testFileSuffixList,
      testRequireList,
      testTimeout
    })
  }
}

export {
  doTestRoot,
  doTestRootList
}
