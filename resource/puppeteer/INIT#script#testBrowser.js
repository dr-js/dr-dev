import { readText } from '@dr-js/core/module/node/fs/File.js'
import { runKit } from '@dr-js/core/module/node/kit.js'

import { FILTER_TEST_JS_FILE } from '@dr-js/dev/module/node/preset.js'
import { getFileListFromPathList } from '@dr-js/dev/module/node/file.js'
import { compileWithWebpack, commonFlag } from '@dr-js/dev/module/webpack.js'
import { testWithPuppeteer } from '@dr-js/dev/module/puppeteer.js'

const NAME_TEST_BROWSER = 'test-browser'

runKit(async (kit) => {
  const PATH_TEST_BROWSER_JS = kit.fromTemp(`${NAME_TEST_BROWSER}.js`)

  const mode = 'production'
  const isWatch = false
  const { getCommonWebpackConfig } = await commonFlag({ mode, isWatch, kit })

  const config = getCommonWebpackConfig({
    output: { path: kit.fromTemp(), filename: '[name].js', library: 'TEST_BROWSER', libraryTarget: 'window' },
    entry: {
      [ NAME_TEST_BROWSER ]: await getFileListFromPathList([
        'source'
      ], kit.fromRoot, FILTER_TEST_JS_FILE)
    }
  })

  kit.padLog(`compile with webpack mode: ${mode}, PATH_TEMP: ${kit.fromTemp()}`)
  await compileWithWebpack({ config, isWatch, kit })
  await testWithPuppeteer({ testScriptString: await readText(PATH_TEST_BROWSER_JS), kit })
}, { title: NAME_TEST_BROWSER })
