import { getGlobal } from '@dr-js/core/module/env/global'

import { string, basicFunction } from '@dr-js/core/module/common/verify'
import { catchSync, catchAsync } from '@dr-js/core/module/common/error'
import { clock } from '@dr-js/core/module/common/time'
import { time } from '@dr-js/core/module/common/format'
import { indentLine } from '@dr-js/core/module/common/string'
import { withTimeoutAsync } from '@dr-js/core/module/common/function'
import { createTreeDepthFirstSearchAsync } from '@dr-js/core/module/common/data/Tree'

import { TerminalColor } from './terminalColor'

const colorFallback = (text) => text
const colorError = __ENV_NODE__ ? TerminalColor.fg.red : colorFallback
const colorMain = __ENV_NODE__ ? TerminalColor.fg.cyan : colorFallback
const colorTitle = __ENV_NODE__ ? TerminalColor.fg.green : colorFallback
const colorText = __ENV_NODE__ ? TerminalColor.fg.darkGray : colorFallback
const colorTime = __ENV_NODE__ ? TerminalColor.fg.yellow : colorFallback

const createScope = (
  upperScope = null,
  level = 0,
  title = ''
) => ({
  upperScope,
  title,
  level,

  beforeList: [],
  mainList: [],
  afterList: []
})

const createScopeFunc = (
  upperScope = null,
  level = 0,
  title = '',
  func,
  type // it/before/after
) => ({
  upperScope,
  title,
  level,

  func,
  type
})

const openScope = (title) => {
  if (CURRENT_SCOPE === undefined) throw new Error(`should run TEST_SETUP() before add test: ${title}`)
  const innerScope = createScope(CURRENT_SCOPE, CURRENT_SCOPE.level + 1, title)
  CURRENT_SCOPE.mainList.push(innerScope)
  CURRENT_SCOPE = innerScope
}
const closeScope = () => {
  CURRENT_SCOPE = CURRENT_SCOPE.upperScope
}
const walkScopeAsync = createTreeDepthFirstSearchAsync((scope) => scope.func ? [] : [
  ...scope.beforeList,
  ...scope.mainList,
  ...scope.afterList
])
const getTitleStack = (title, upperScope) => {
  const titleStack = [ title ]
  while (upperScope) {
    titleStack.unshift(upperScope.title)
    upperScope = upperScope.upperScope
  }
  return titleStack
}

const describe = (title, setupFunc) => {
  string(title, 'invalid describe title')
  basicFunction(setupFunc, 'invalid describe setupFunc')

  openScope(title)
  const { result, error } = catchSync(setupFunc) // TODO: should be sync
  if (result instanceof Promise) throw new Error(`unexpect Promise from describe: ${title}`)
  if (error) {
    CONFIG.log(colorError(`error from describe: ${title}`))
    throw error
  }
  closeScope()
}

const it = (title, func) => {
  string(title, 'invalid it title')
  basicFunction(func, 'invalid it func')
  CURRENT_SCOPE.mainList.push(createScopeFunc(CURRENT_SCOPE, CURRENT_SCOPE.level + 1, title, func, 'it'))
}

const before = (title = `[before] ${CURRENT_SCOPE.title}`, func) => {
  string(title, 'invalid before title')
  basicFunction(func, 'invalid before func')
  CURRENT_SCOPE.beforeList.push(createScopeFunc(CURRENT_SCOPE, CURRENT_SCOPE.level + 1, title, func, 'before'))
}

const after = (title = `[after] ${CURRENT_SCOPE.title}`, func) => {
  string(title, 'invalid after title')
  basicFunction(func, 'invalid after func')
  CURRENT_SCOPE.afterList.push(createScopeFunc(CURRENT_SCOPE, CURRENT_SCOPE.level + 1, title, func, 'after'))
}

let ROOT_SCOPE
let CURRENT_SCOPE
let RESULT
let CONFIG

const TEST_SETUP = ({
  log = console.log,
  logLevel = (level, ...args) => log(indentLine(args.join(' '), '  '.repeat(level))),
  timeout = 10 * 1000, // 10 sec, for each test
  isSkipGlobalAssign = false
} = {}) => {
  ROOT_SCOPE = CURRENT_SCOPE = createScope(null, 0, 'root')
  RESULT = { passList: [], failList: [] }
  CONFIG = { log, logLevel, timeout }

  // inject global for test script
  !isSkipGlobalAssign && Object.assign(getGlobal(), { describe, it, before, after, info })

  CONFIG.log(colorMain('[TEST] setup'))
}

const TEST_RUN = async () => {
  CONFIG.log(colorMain('[TEST] run'))

  // reset
  const scope = ROOT_SCOPE
  ROOT_SCOPE = CURRENT_SCOPE = undefined

  const runStart = clock()

  await walkScopeAsync(scope, async ({
    upperScope,
    title,
    level,

    func,
    type
  }) => {
    if (!func) { // describe
      CONFIG.logLevel(level, colorTitle(title))
    } else {
      const isMain = type === 'it'
      const funcStart = clock()
      const { error } = await catchAsync(withTimeoutAsync, func, CONFIG.timeout)
      const funcDuration = clock() - funcStart
      const timeLog = funcDuration > 64 ? colorTime(`(${time(funcDuration)})`) : ''
      if (error) {
        if (isMain) RESULT.failList.push({ titleStack: getTitleStack(title, upperScope), error })
        CONFIG.logLevel(level, colorError(`[FAIL] ${title}`), timeLog)
        CONFIG.logLevel(level, colorError(indentLine(error.stack || error, '    ')))
      } else if (isMain) {
        RESULT.passList.push({ title })
        CONFIG.logLevel(level, colorText(title), timeLog)
      } else {} // before/after func, no logging
    }
  })

  CONFIG.log(colorMain([
    `[TEST] done in ${time(clock() - runStart)}`,
    `  pass: ${RESULT.passList.length}`,
    `  fail: ${RESULT.failList.length}`
  ].join('\n')))

  for (let index = 0, indexMax = RESULT.failList.length; index < indexMax; index++) {
    const { titleStack, error } = RESULT.failList[ index ]
    CONFIG.log(colorError(`[FAIL|${index}]`))
    titleStack.forEach((title, level) => level && CONFIG.logLevel(level, colorError(title))) // skip root level
    CONFIG.logLevel(titleStack.length, colorError(indentLine(error.stack || error, '    ')))
  }

  return RESULT
}

const info = (...args) => console.log(indentLine(args.join(' '), '      > '))

export {
  TEST_SETUP, TEST_RUN,
  describe, it, before, after, info
}
