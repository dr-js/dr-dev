import { resolve, basename } from 'path'
import { readFileSync } from 'fs'

import { indentLine } from '@dr-js/core/module/common/string'
import { stringifyEqual, doThrow, doNotThrow, doThrowAsync, doNotThrowAsync } from '@dr-js/core/module/common/verify'
import { visibleAsync } from '@dr-js/core/module/node/file/function'
import { modifyDeleteForce } from '@dr-js/core/module/node/file/Modify'

import {
  initOutput,
  packOutput, getPackageTgzName,
  // verifyOutputBin,
  verifyNoGitignore,
  publishOutput, getPublishFlag, verifyPublishVersion
} from './output'
import { getLogger } from './node/logger'
import { resetDirectory } from './node/file'

const { describe, it, before, after, info = console.log } = global

const PATH_TEST_ROOT = resolve(__dirname, './test-output-gitignore/')
const PATH_ROOT = resolve(__dirname, __dirname.includes('output-gitignore') ? '../../' : '../')
if (!PATH_ROOT) throw new Error('unexpected PATH_ROOT')

before('prepare', async () => {
  await resetDirectory(PATH_TEST_ROOT)
})

after('clear', async () => {
  await modifyDeleteForce(PATH_TEST_ROOT)
})

describe('Output', () => {
  const fromTestRoot = (...args) => resolve(PATH_TEST_ROOT, ...args)
  const fromRoot = (...args) => resolve(PATH_ROOT, ...args) // use outer package
  const logList = []
  const logger = getLogger(undefined, undefined, undefined, (log) => {
    logList.unshift(log)
    logList.length = 8
    info(log)
  })
  const verifyLog = (expectLog) => {
    if (logList.some((log) => log && log.includes(expectLog))) return
    throw new Error(`[verifyLog] expectLog: ${expectLog}, get:\n${logList.map((log) => indentLine(log, '  > ', ' >> ')).join('\n')}`)
  }

  it('initOutput()', async () => {
    const fromOutput = (...args) => fromTestRoot('output-initOutput', ...args)
    const replaceReadmeNonPackageContent = '\n\nTEST_REPLACE_README_NON_PACKAGE_CONTENT'

    await initOutput({
      fromOutput,
      fromRoot,
      // deleteKeyList = [ 'private', 'scripts', 'devDependencies' ],
      // copyPathList = [ 'README.md' ],
      copyMapPathList: [ [ '.gitignore', '.gitignore-map-0' ], [ '.gitignore', '.gitignore-map-1' ] ],
      replaceReadmeNonPackageContent, // set to false to skip
      // pathAutoLicenseFile = fromRoot('LICENSE'), // set to false, or do not set `packageJSON.license` to skip
      logger
    })

    stringifyEqual(
      await visibleAsync(fromOutput('.gitignore')),
      false,
      'should apply copyMapPathList'
    )
    stringifyEqual(
      String(readFileSync(fromRoot('.gitignore'))),
      String(readFileSync(fromOutput('.gitignore-map-0'))),
      'should apply copyMapPathList'
    )
    stringifyEqual(
      String(readFileSync(fromRoot('.gitignore'))),
      String(readFileSync(fromOutput('.gitignore-map-1'))),
      'should apply copyMapPathList'
    )
    stringifyEqual(
      String(readFileSync(fromOutput('README.md'))).includes(replaceReadmeNonPackageContent),
      true,
      'should apply replaceReadmeNonPackageContent'
    )
  })

  it('packOutput() & getPackageTgzName()', async () => {
    const fromOutput = (...args) => fromTestRoot('output-packOutput', ...args)
    const packageJSON = await initOutput({ fromOutput, fromRoot, logger })

    const pathPackagePack = await packOutput({ fromOutput, fromRoot: fromTestRoot, logger })

    stringifyEqual(
      basename(pathPackagePack),
      getPackageTgzName(packageJSON),
      'should match getPackageTgzName'
    )
  })

  it('verifyNoGitignore()', async () => {
    await doNotThrowAsync(async () => verifyNoGitignore({ path: fromRoot('script'), logger }))
    await doThrowAsync(async () => verifyNoGitignore({ path: fromTestRoot(), logger }))
  })

  it('publishOutput()', async () => {
    const fromOutput = (...args) => fromTestRoot('output-publishOutput', ...args)
    const packageJSON = await initOutput({ fromOutput, fromRoot, logger })
    const pathPackagePack = await packOutput({ fromOutput, fromRoot: fromTestRoot, logger })

    packageJSON.version = '0.0.0-dev.0' // reset for test

    // should do nothing
    await publishOutput({ isPublish: false, isPublishDev: false, packageJSON, pathPackagePack, extraArgs: [ '--dry-run' ], logger })
    verifyLog('skipped publish output, no flag found')

    // should --dry-run
    info('test publish with --dry-run')
    await publishOutput({ isPublish: false, isPublishDev: true, packageJSON, pathPackagePack, extraArgs: [ '--dry-run' ], logger })
    verifyLog('publish-dev')
  })

  it('getPublishFlag()', () => {
    stringifyEqual(getPublishFlag([ 'a', 'b', 'c', 'dev' ]), { isPublish: false, isPublishDev: false })
    stringifyEqual(getPublishFlag([ 'publish' ]), { isPublish: true, isPublishDev: false })
    stringifyEqual(getPublishFlag([ 'publish-dev' ]), { isPublish: false, isPublishDev: true })
    doThrow(() => getPublishFlag([ 'publish', 'publish-dev' ]), 'should prevent set both flag')
  })

  it('verifyPublishVersion()', () => {
    doNotThrow(() => verifyPublishVersion({ version: '1.1.1', isPublishDev: false }))
    doNotThrow(() => verifyPublishVersion({ version: '1111.1111.1111', isPublishDev: false }))
    doNotThrow(() => verifyPublishVersion({ version: '1.1.1-dev.1', isPublishDev: true }))
    doNotThrow(() => verifyPublishVersion({ version: '1111.1111.1111-dev.1111', isPublishDev: true }))

    doThrow(() => verifyPublishVersion({ version: '', isPublishDev: false }))
    doThrow(() => verifyPublishVersion({ version: '1', isPublishDev: false }))
    doThrow(() => verifyPublishVersion({ version: '1.1', isPublishDev: false }))
    doThrow(() => verifyPublishVersion({ version: '1.1.1.1', isPublishDev: false }))
    doThrow(() => verifyPublishVersion({ version: '', isPublishDev: true }))
    doThrow(() => verifyPublishVersion({ version: '1', isPublishDev: true }))
    doThrow(() => verifyPublishVersion({ version: '1.1', isPublishDev: true }))
    doThrow(() => verifyPublishVersion({ version: '1.1.1.1', isPublishDev: true }))
    doThrow(() => verifyPublishVersion({ version: '1.1.1-dev.1-local.1', isPublishDev: true }))
  })
})
