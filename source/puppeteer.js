import { readFileSync } from 'fs'

import { tryRequire } from '@dr-js/core/module/env/tryRequire.js'
import { catchAsync } from '@dr-js/core/module/common/error.js'
import { time } from '@dr-js/core/module/common/format.js'
import { createInsideOutPromise } from '@dr-js/core/module/common/function.js'
import { guardPromiseEarlyExit } from '@dr-js/core/module/node/system/ExitListener.js'

const GET_PUPPETEER = (log = console.warn) => {
  const Puppeteer = tryRequire('puppeteer')
  if (Puppeteer) return Puppeteer
  const error = new Error('[Puppeteer] failed to load package "puppeteer"')
  log(error)
  throw error
}

const puppeteerBrowserDisconnectListener = () => {
  console.warn('[Puppeteer] unexpected browser disconnect, exiting')
  process.exit(-2)
}

const clearPuppeteerBrowser = ({
  puppeteerBrowser,
  logger, kit, kitLogger = kit || logger // TODO: DEPRECATE: use 'kit' instead of 'logger'
}) => {
  kitLogger && kitLogger.log('[Puppeteer|Browser] clear')
  puppeteerBrowser.removeListener('disconnected', puppeteerBrowserDisconnectListener)
  return puppeteerBrowser.close().catch((error) => {
    kitLogger && kitLogger.log(`[Puppeteer] puppeteerBrowser clear error: ${String(error)}`)
    process.exit(-1)
  })
}

const initPuppeteerBrowser = async ({
  logger, kit, kitLogger = kit || logger, // TODO: DEPRECATE: use 'kit' instead of 'logger'
  Puppeteer = GET_PUPPETEER(kitLogger.log)
}) => {
  if (!Puppeteer) {
    const error = new Error('[Puppeteer] failed to load package "puppeteer"')
    kitLogger.log(error)
    throw error
  }
  kitLogger.log('[Puppeteer|Browser] init')
  const puppeteerBrowser = await Puppeteer.launch({
    args: [ '--no-sandbox' ],
    headless: true,
    // NOTE: already handled in above code, tell puppeteer to skip, or process exit function may not get called
    handleSIGHUP: false,
    handleSIGINT: false,
    handleSIGTERM: false,
    // For stable testing
    dumpio: Boolean(process.env.PUPPETEER_DUMPIO) // Whether to pipe the browser process stdout and stderr into process.stdout and process.stderr
  })
  puppeteerBrowser.addListener('disconnected', puppeteerBrowserDisconnectListener)
  kitLogger.log('[Puppeteer|Browser] init complete')
  return puppeteerBrowser
}

const clearPuppeteerPage = async ({
  puppeteerPage,
  logger, kit, kitLogger = kit || logger // TODO: DEPRECATE: use 'kit' instead of 'logger'
}) => {
  kitLogger && kitLogger.log('[Puppeteer|Page] clear')
  await puppeteerPage.close()
    .catch((error) => { kitLogger && kitLogger.log(`[Puppeteer] puppeteerPage clear error: ${String(error)}`) })
}

const initPuppeteerPage = async ({
  puppeteerBrowser, isDebug = false,
  logger, kit, kitLogger = kit || logger // TODO: DEPRECATE: use 'kit' instead of 'logger'
}) => {
  kitLogger.log('[Puppeteer|Page] init start')
  const puppeteerPage = await puppeteerBrowser.newPage()
  puppeteerPage.on('error', (error) => kitLogger.log(`[Puppeteer|Page] error: ${error.stack || error}`)) // Emitted when the puppeteerPage crashes.
  puppeteerPage.on('pageerror', (exceptionMessage) => kitLogger.log(`[Puppeteer|Page] page error: ${exceptionMessage}`)) // Emitted when an uncaught exception happens within the puppeteerPage.
  puppeteerPage.on('requestfailed', (request) => kitLogger.log(`[Puppeteer|Page] request failed with errorText: ${request.failure().errorText}, method: ${request.method()}, url: ${request.url()}`))
  puppeteerPage.on('response', (response) => response.status() >= 400 && kitLogger.log(`[Puppeteer|Page] abnormal response status: ${response.status()}, url: ${response.url()}`))
  puppeteerPage.on('console', (consoleMessage) => kitLogger.log(`[Puppeteer|Page] console [${consoleMessage.type()}] ${consoleMessage.text()} `))
  isDebug && puppeteerPage.on('request', (request) => kitLogger.log(`[DEBUG][Puppeteer|Page] request method: ${request.method()}, url: ${request.url()}`))
  isDebug && puppeteerPage.on('response', (response) => kitLogger.log(`[DEBUG][Puppeteer|Page] response status: ${response.status()}, url: ${response.url()}`))
  kitLogger.log('[Puppeteer|Page] init complete')
  return puppeteerPage
}

const setupPuppeteerPage = async ({
  puppeteerPage, pageUrl, pageDefaultTimeout = 10 * 1000,
  logger, kit, kitLogger = kit || logger // TODO: DEPRECATE: use 'kit' instead of 'logger'
}) => {
  kitLogger.log(`[Puppeteer|Page] setup start, pageUrl: ${pageUrl}`)
  await puppeteerPage.setDefaultTimeout(pageDefaultTimeout)
  await puppeteerPage.setUserAgent('Phantom WebKit') // TODO: CHECK: if still needed
  await puppeteerPage.goto(pageUrl, { waitUntil: 'networkidle2' }) // consider navigation to be finished when there are no more than 2 network connections for at least 500 ms.
  kitLogger.log('[Puppeteer|Page] setup ready')
}

const reloadPuppeteerPage = async ({
  puppeteerPage,
  logger, kit, kitLogger = kit || logger // TODO: DEPRECATE: use 'kit' instead of 'logger'
}) => {
  kitLogger.log('[Puppeteer|Page] reload start')
  await puppeteerPage.reload({ waitUntil: 'networkidle2' }) // consider navigation to be finished when there are no more than 2 network connections for at least 500 ms.
  kitLogger.log('[Puppeteer|Page] reload done')
}

const testBootPuppeteer = async ({
  logger, kit, kitLogger = kit || logger // TODO: DEPRECATE: use 'kit' instead of 'logger'
}) => {
  kitLogger.log(`[testBootPuppeteer] package version: ${(tryRequire('puppeteer/package.json') || {}).version}`)
  const puppeteerBrowser = await initPuppeteerBrowser({ logger, kit, kitLogger })
  kitLogger.log(`[testBootPuppeteer] browser version: ${await puppeteerBrowser.version()}, userAgent: ${await puppeteerBrowser.userAgent()}`)
  const puppeteerPage = await initPuppeteerPage({ puppeteerBrowser, logger, kit, kitLogger })
  kitLogger.log(`[testBootPuppeteer] page url: ${JSON.stringify(await puppeteerPage.url())}, viewport: ${JSON.stringify(await puppeteerPage.viewport())}`)
  await clearPuppeteerPage({ puppeteerPage, logger, kit, kitLogger })
  await clearPuppeteerBrowser({ puppeteerBrowser, logger, kit, kitLogger })
}

const runWithPuppeteer = async ({
  taskFunc,
  logger, kit, kitLogger = kit || logger // TODO: DEPRECATE: use 'kit' instead of 'logger'
}) => {
  const puppeteerBrowser = await initPuppeteerBrowser({ logger, kit, kitLogger })
  const puppeteerPage = await initPuppeteerPage({ puppeteerBrowser, logger, kit, kitLogger })
  kitLogger.log('[Puppeteer|Page] test start')
  const { result, error } = await catchAsync(taskFunc, { puppeteerPage, logger, kit, kitLogger })
  kitLogger.log('[Puppeteer|Page] test done')
  await clearPuppeteerPage({ puppeteerPage })
  await clearPuppeteerBrowser({ puppeteerBrowser })
  if (error) throw error
  return result
}

const DEFAULT_TIMEOUT_PAGE = 42 * 1000
const DEFAULT_TIMEOUT_TEST = 8 * 60 * 1000 // should done test in 8min

const wrapTestScriptStringToHTML = ({
  testSetupScriptString = readFileSync(require.resolve('@dr-js/dev/browser/test.js')), // script with test setup
  testScriptString, // bundled(webpack) script with test describe/it
  testTag,
  timeoutTest = DEFAULT_TIMEOUT_TEST
}) => [
  '<!DOCTYPE html>',
  '<meta charset="utf-8">',
  '<link rel="icon" href="data:,">', // stop fetch favicon
  `<title>${testTag}</title>`,
  // NOTE: each script tag can fail independently, so check should be done in the script tag after
  // if `window.TEST_SCRIPT_*` is set, meaning the script syntax is ok, and sync init pass, may still got async issues
  `<script>
    ${testSetupScriptString};
    window.TEST_SCRIPT_0 = true
  </script>`,
  `<script>
    window.TEST_REPORT = (failCount = 0) => console.log(JSON.stringify({ "${testTag}": { failCount } }))
    if (!window.TEST_SCRIPT_0) window.TEST_REPORT(-10) 
    else if (!window.DrDevTest) window.TEST_REPORT(-20) 
    else {
      const test = window.DrDevTest.createTest()
      test.TEST_SETUP({ timeout: ${timeoutTest} })
      window.addEventListener('load', () => test.TEST_RUN().then(
        ({ failList }) => { window.TEST_REPORT(failList.length) },
        (error) => { console.error(error); window.TEST_REPORT(-21) }
      ))
      window.TEST_CURRENT = test
    }
  </script>`,
  `<script>
    ${testScriptString};
    window.TEST_SCRIPT_1 = true
  </script>`,
  `<script>
    if (!window.TEST_SCRIPT_1) window.TEST_REPORT(-11)
  </script>`
].join('\n')

const testWithPuppeteer = async ({
  testTag = `BROWSER_TEST[${new Date().toISOString()}]`, // string mark for test complete
  timeoutPage = DEFAULT_TIMEOUT_PAGE,
  timeoutTest = DEFAULT_TIMEOUT_TEST,

  // test with script/HTML
  testScriptString,
  testHTML = testScriptString && wrapTestScriptStringToHTML({ testScriptString, testTag, timeoutTest }),

  // test with server page
  testUrl, // prepared script with server

  logger, kit, kitLogger = kit || logger // TODO: DEPRECATE: use 'kit' instead of 'logger'
}) => runWithPuppeteer({
  taskFunc: async ({ puppeteerPage }) => {
    kitLogger.padLog(`[testWithPuppeteer] timeoutPage: ${time(timeoutPage)}, timeoutTest: ${time(timeoutTest)}`)

    await puppeteerPage.setDefaultTimeout(timeoutPage) // for all page operation
    await puppeteerPage.setViewport({ width: 0, height: 0 }) // TODO: CHECK: if this will save render time

    kitLogger.log('[test] init')
    const { promise, resolve, reject } = createInsideOutPromise()
    puppeteerPage.on('console', (consoleMessage) => {
      const logType = consoleMessage.type()
      const logText = consoleMessage.text()
      kitLogger.log(`[test|${logType}] ${logText}`)
      if (!logText.includes(testTag)) return
      const { [ testTag ]: { failCount } } = JSON.parse(logText)
      failCount
        ? reject(new Error(`${failCount} test failed`))
        : resolve()
    })

    kitLogger.log('[test] load')
    if (testUrl) {
      const response = await puppeteerPage.goto(testUrl)
      kitLogger.log('[test] page navigate status:', response.status())
    } else if (testHTML) {
      await puppeteerPage.setContent(testHTML)
    } else throw new Error('expect set either `testUrl` or `testScriptString/testHTML`')

    kitLogger.log('[test] loaded')
    const timeoutToken = setTimeout(() => reject(new Error(`${testTag} test timeout`)), timeoutTest)
    await guardPromiseEarlyExit(
      () => {
        console.error('[TEST] detected early exit, broken promise/async chain?')
        process.exitCode = 42
      },
      promise
    )
    clearTimeout(timeoutToken)
    kitLogger.log('[test] done')
  },
  logger, kit, kitLogger
})

export {
  GET_PUPPETEER,
  initPuppeteerBrowser, clearPuppeteerBrowser,
  initPuppeteerPage, clearPuppeteerPage, setupPuppeteerPage, reloadPuppeteerPage,
  testBootPuppeteer,
  runWithPuppeteer,
  testWithPuppeteer, wrapTestScriptStringToHTML
}
