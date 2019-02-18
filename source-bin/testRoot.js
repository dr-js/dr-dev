import { relative } from 'path'

import { toPosixPath } from 'dr-js/module/node/file/function'
import { getFileList } from 'dr-js/module/node/file/Directory'

import { TEST_SETUP, TEST_RUN, describe } from 'dr-dev/module/test'

const doTestRoot = async ({
  testRoot = process.cwd(),
  testFileSuffix = '.js',
  testRequireList = []
}) => {
  const fileList = await getFileList(testRoot, testFileSuffix
    ? (fileList, { path }) => path.endsWith(testFileSuffix) && fileList.push(path)
    : (fileList, { path }) => fileList.push(path)
  )
  if (!fileList.length) throw new Error([ `no test file selected`, testFileSuffix && `with suffix "${testFileSuffix}"`, `from ${testRoot}` ].filter(Boolean).join(' '))

  for (const testRequire of testRequireList) { // load pre require, mostly `@babel/register`
    try { require(testRequire) } catch (error) {
      console.error(`failed to require "${testRequire}"`)
      throw error
    }
  }

  TEST_SETUP()

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

export { doTestRoot }
