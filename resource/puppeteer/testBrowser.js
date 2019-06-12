import { resolve } from 'path'

import { getScriptFileListFromPathList } from 'dr-dev/module/node/fileList'
import { runMain } from 'dr-dev/module/main'
import { testWithPuppeteer } from 'dr-dev/module/puppeteer'
import { compileWithWebpack, commonFlag } from 'dr-dev/module/webpack'

import { readFileAsync } from 'dr-js/module/node/file/function'
import { createDirectory } from 'dr-js/module/node/file/File'
import { modify } from 'dr-js/module/node/file/Modify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_TEMP = resolve(__dirname, '../.temp-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromTemp = (...args) => resolve(PATH_TEMP, ...args)

const NAME_TEST_BROWSER = 'test-browser'
const PATH_TEST_BROWSER_JS = fromTemp(`${NAME_TEST_BROWSER}.js`)

runMain(async (logger) => {
  const mode = 'production'
  const isWatch = false
  const { profileOutput, assetMapOutput, getCommonWebpackConfig } = await commonFlag({ mode, isWatch, fromRoot, logger })

  const config = getCommonWebpackConfig({
    output: { path: PATH_TEMP, filename: '[name].js', library: 'TEST_BROWSER', libraryTarget: 'window' },
    entry: {
      [ NAME_TEST_BROWSER ]: await getScriptFileListFromPathList([
        'source'
      ], fromRoot, (path) => path.endsWith('.test.js'))
    }
  })

  logger.padLog(`compile with webpack mode: ${mode}, PATH_TEMP: ${PATH_TEMP}`)
  await createDirectory(PATH_TEMP)
  await compileWithWebpack({ config, isWatch, profileOutput, assetMapOutput, logger })
  const testScriptString = await readFileAsync(PATH_TEST_BROWSER_JS)
  await modify.delete(PATH_TEST_BROWSER_JS)

  await testWithPuppeteer({ testScriptString, logger })
}, NAME_TEST_BROWSER)