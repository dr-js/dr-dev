import { relative } from 'path'

import { toPosixPath } from '@dr-js/core/module/node/fs/Path.js'
import { getFileList } from '@dr-js/core/module/node/fs/Directory.js'
import { guardPromiseEarlyExit } from '@dr-js/core/module/node/system/ExitListener.js'
import { configureTerminalColor } from '@dr-js/core/module/node/module/TerminalColor.js'

import { createTest } from 'source/common/test.js'

const test = async ({
  testRoot = process.cwd(),
  testFileSuffixList = [ '.js' ],
  testRequireList = [],
  testTimeout = 42 * 1000
}) => {
  const testPathFunc = (testFileSuffixList && testFileSuffixList.length)
    ? (path) => testFileSuffixList.find((testFileSuffix) => path.endsWith(testFileSuffix))
    : null
  const fileList = await getFileList(testRoot, testPathFunc
    ? (fileList, { path }) => { testPathFunc(path) && fileList.push(path) }
    : (fileList, { path }) => { fileList.push(path) }
  )
  if (!fileList.length) throw new Error([ 'no test file selected', `with suffix "${testFileSuffixList.join(',')}"`, `from ${testRoot}` ].filter(Boolean).join(' '))

  for (const testRequire of testRequireList) { // load pre require, mostly `@babel/register`
    try { require(testRequire) } catch (error) {
      console.error(`failed to require "${testRequire}"`)
      throw error
    }
  }

  const TerminalColor = configureTerminalColor()
  const { TEST_SETUP, TEST_RUN, describe } = createTest({ // setup colors
    colorError: TerminalColor.fg.red,
    colorMain: TerminalColor.fg.cyan,
    colorTitle: TerminalColor.fg.green,
    colorText: TerminalColor.fg.darkGray,
    colorTime: TerminalColor.fg.yellow
  })

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

  const { passList, failList } = await guardPromiseEarlyExit(
    () => {
      console.error('[TEST] detected early exit, broken promise/async chain?')
      process.exitCode = 42
    },
    TEST_RUN()
  )

  const failCount = failList.length
  const testCount = passList.length + failCount
  if (failCount) throw new Error(`${failCount} of ${testCount} test fail from ${fileList.length} file`)
}

const doTest = async ({
  testRootList = [ process.cwd() ],
  testFileSuffixList = [ '.js' ],
  testRequireList = [],
  testTimeout = 42 * 1000
}) => {
  for (const testRoot of testRootList) {
    await test({
      testRoot,
      testFileSuffixList,
      testRequireList,
      testTimeout
    })
  }
}

export { doTest }
