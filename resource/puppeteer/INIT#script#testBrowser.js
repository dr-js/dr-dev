import { FILTER_TEST_JS_FILE } from '@dr-js/dev/module/node/preset.js'
import { getFileListFromPathList } from '@dr-js/dev/module/node/file.js'
import { compileWithWebpack, commonFlag } from '@dr-js/dev/module/webpack.js'
import { testWithPuppeteer } from '@dr-js/dev/module/puppeteer.js'
import { runMain, commonCombo, readFileSync } from '@dr-js/dev/module/main.js'

const NAME_TEST_BROWSER = 'test-browser'

runMain(async (logger) => {
  const { fromRoot, fromTemp } = commonCombo(logger)
  const PATH_TEST_BROWSER_JS = fromTemp(`${NAME_TEST_BROWSER}.js`)

  const mode = 'production'
  const isWatch = false
  const { getCommonWebpackConfig } = await commonFlag({ mode, isWatch, fromRoot, logger })

  const config = getCommonWebpackConfig({
    output: { path: fromTemp(), filename: '[name].js', library: 'TEST_BROWSER', libraryTarget: 'window' },
    entry: {
      [ NAME_TEST_BROWSER ]: await getFileListFromPathList([
        'source'
      ], fromRoot, FILTER_TEST_JS_FILE)
    }
  })

  logger.padLog(`compile with webpack mode: ${mode}, PATH_TEMP: ${fromTemp()}`)
  await compileWithWebpack({ config, isWatch, logger })
  await testWithPuppeteer({ testScriptString: String(readFileSync(PATH_TEST_BROWSER_JS)), logger })
}, NAME_TEST_BROWSER)
