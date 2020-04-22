import Puppeteer from 'puppeteer'

import { catchAsync } from '@dr-js/core/module/common/error'
import { time } from '@dr-js/core/module/common/format'
import { createInsideOutPromise } from '@dr-js/core/module/common/function'
import { readFileAsync } from '@dr-js/core/module/node/file/function'

const puppeteerBrowserDisconnectListener = () => {
  __DEV__ && console.warn('[Puppeteer] unexpected browser disconnect, exiting')
  process.exit(-2)
}

const clearPuppeteerBrowser = ({ puppeteerBrowser }) => {
  puppeteerBrowser.removeListener('disconnected', puppeteerBrowserDisconnectListener)
  return puppeteerBrowser.close().catch((error) => {
    __DEV__ && console.warn('[Puppeteer] puppeteerBrowser clear error:', String(error))
    process.exit(-1)
  })
}

const initPuppeteerBrowser = async ({ logger }) => {
  logger.log('[Puppeteer|Browser] init')
  const puppeteerBrowser = await Puppeteer.launch({
    args: [ '--no-sandbox' ],
    headless: true,
    // NOTE: already handled, or process exit function may get called in puppeteer
    handleSIGHUP: false,
    handleSIGINT: false,
    handleSIGTERM: false
  })
  puppeteerBrowser.addListener('disconnected', puppeteerBrowserDisconnectListener)
  logger.log('[Puppeteer|Browser] init complete')
  return puppeteerBrowser
}

const clearPuppeteerPage = ({ puppeteerPage }) => puppeteerPage.close()
  .catch((error) => { __DEV__ && console.warn('[Puppeteer] puppeteerPage clear error:', String(error)) })

const initPuppeteerPage = async ({ puppeteerBrowser, logger }) => {
  logger.log('[Puppeteer|Page] init start')
  const puppeteerPage = await puppeteerBrowser.newPage()
  puppeteerPage.on('error', (error) => logger.log(`[Puppeteer|Page] error: ${error.stack || error}`)) // Emitted when the puppeteerPage crashes.
  puppeteerPage.on('pageerror', (exceptionMessage) => logger.log(`[Puppeteer|Page] page error: ${exceptionMessage}`)) // Emitted when an uncaught exception happens within the puppeteerPage.
  puppeteerPage.on('requestfailed', (request) => logger.log(`[Puppeteer|Page] request failed with errorText: ${request.failure().errorText}, method: ${request.method()}, url: ${request.url()}`))
  puppeteerPage.on('response', (response) => response.status() >= 400 && logger.log(`[Puppeteer|Page] abnormal response status: ${response.status()}, url: ${response.url()}`))
  // __DEV__ && puppeteerPage.on('console', (consoleMessage) => logger.log(`[Puppeteer|Page] console [${consoleMessage.type()}] ${consoleMessage.text()} `))
  // __DEV__ && puppeteerPage.on('request', (request) => logger.log(`[Puppeteer|Page] request method: ${request.method()}, url: ${request.url()}`))
  // __DEV__ && puppeteerPage.on('response', (response) => logger.log(`[Puppeteer|Page] response status: ${response.status()}, url: ${response.url()}`))
  logger.log('[Puppeteer|Page] init complete')
  return puppeteerPage
}

const runWithPuppeteer = async ({
  taskFunc,
  logger
}) => {
  const puppeteerBrowser = await initPuppeteerBrowser({ logger })
  const puppeteerPage = await initPuppeteerPage({ puppeteerBrowser, logger })
  logger.log('[Puppeteer|Page] test start')
  const { result, error } = await catchAsync(taskFunc, { puppeteerPage, logger })
  logger.log('[Puppeteer|Page] test done')
  await clearPuppeteerPage({ puppeteerPage })
  await clearPuppeteerBrowser({ puppeteerBrowser })
  if (error) throw error
  return result
}

const DEFAULT_TIMEOUT_PAGE = 42 * 1000
const DEFAULT_TIMEOUT_TEST = 8 * 60 * 1000 // should done test in 8min

const wrapTestScriptStringToHTML = async ({
  testScriptString,
  testTag,
  timeoutTest = DEFAULT_TIMEOUT_TEST
}) => [
  '<!DOCTYPE html>',
  '<meta charset="utf-8">',
  '<link rel="icon" href="data:,">', // stop fetch favicon
  `<title>${testTag}</title>`,
  `<script>${await readFileAsync(require.resolve('@dr-js/dev/browser/test.js'))}</script>`,
  `<script>(window.CURRENT_TEST = window.DrDevTest.createTest()).TEST_SETUP({ timeout: ${timeoutTest} })</script>`,
  `<script>${testScriptString}</script>`,
  `<script>window.addEventListener('load', () => window.CURRENT_TEST.TEST_RUN().then(({ failList }) => { console.log(JSON.stringify({ "${testTag}": { failCount: failList.length } })) }))</script>`
].join('\n')

const testWithPuppeteer = async ({
  testScriptString,
  testUrl,
  testTag = `BROWSER_TEST[${new Date().toISOString()}]`, // string mark for test complete

  timeoutPage = DEFAULT_TIMEOUT_PAGE,
  timeoutTest = DEFAULT_TIMEOUT_TEST,
  logger
}) => runWithPuppeteer({
  taskFunc: async ({ puppeteerPage }) => {
    logger.padLog(`[testWithPuppeteer] timeoutPage: ${time(timeoutPage)}, timeoutTest: ${time(timeoutTest)}`)

    await puppeteerPage.setDefaultTimeout(timeoutPage) // for all page operation
    await puppeteerPage.setViewport({ width: 0, height: 0 }) // TODO: CHECK: if this will save render time

    logger.log('[test] init')
    const { promise, resolve, reject } = createInsideOutPromise()
    puppeteerPage.on('console', (consoleMessage) => {
      const logType = consoleMessage.type()
      const logText = consoleMessage.text()
      logger.log(`[test|${logType}] ${logText}`)
      if (!logText.includes(testTag)) return
      const { [ testTag ]: { failCount } } = JSON.parse(logText)
      failCount
        ? reject(new Error(`${failCount} test failed`))
        : resolve()
    })

    logger.log('[test] load')
    if (testUrl) {
      const response = await puppeteerPage.goto(testUrl)
      logger.log('[test] page navigate status:', response.status())
    } else if (testScriptString) {
      const testHTML = await wrapTestScriptStringToHTML({ testScriptString, testTag, timeoutTest })
      await puppeteerPage.setContent(testHTML)
    } else throw new Error('expect set either `testUrl` or `testScriptString`')

    logger.log('[test] loaded')
    const timeoutToken = setTimeout(() => reject(new Error(`${testTag} test timeout`)), timeoutTest)
    await promise
    clearTimeout(timeoutToken)
    logger.log('[test] done')
  },
  logger
})

export {
  clearPuppeteerBrowser,
  initPuppeteerBrowser,
  clearPuppeteerPage,
  initPuppeteerPage,
  runWithPuppeteer,

  testWithPuppeteer, wrapTestScriptStringToHTML
}
