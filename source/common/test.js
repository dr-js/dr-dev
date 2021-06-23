import { getGlobal } from '@dr-js/core/module/env/global.js'

import { string, basicFunction } from '@dr-js/core/module/common/verify.js'
import { isString, isBasicFunction } from '@dr-js/core/module/common/check.js'
import { catchSync, catchAsync } from '@dr-js/core/module/common/error.js'
import { clock } from '@dr-js/core/module/common/time.js'
import { time } from '@dr-js/core/module/common/format.js'
import { indentLine } from '@dr-js/core/module/common/string.js'
import { withTimeoutAsync } from '@dr-js/core/module/common/function.js'
import { createTreeDepthFirstSearchAsync } from '@dr-js/core/module/common/data/Tree.js'

const LIST_NAME_BEFORE = 'beforeList'
const LIST_NAME_IT = 'itList'
const LIST_NAME_AFTER = 'afterList'

const createScope = (
  upperScope = null,
  level = 0,
  title = ''
) => ({
  upperScope, level, title,
  [ LIST_NAME_BEFORE ]: [],
  [ LIST_NAME_IT ]: [],
  [ LIST_NAME_AFTER ]: []
})

const walkScopeAsync = createTreeDepthFirstSearchAsync((scope) => scope.func ? [] : [
  ...scope[ LIST_NAME_BEFORE ],
  ...scope[ LIST_NAME_IT ],
  ...scope[ LIST_NAME_AFTER ]
])

const getTitleStack = (title, upperScope) => {
  const titleStack = [ title ]
  while (upperScope) {
    titleStack.unshift(upperScope.title)
    upperScope = upperScope.upperScope
  }
  return titleStack
}

const info = (...args) => console.log(indentLine(args.join(' '), '      > '))

const createTest = ({
  colorFallback = (text) => text,
  colorError = colorFallback,
  colorMain = colorFallback,
  colorTitle = colorFallback,
  colorText = colorFallback,
  colorTime = colorFallback
} = {}) => {
  let ROOT_SCOPE
  let CURRENT_SCOPE
  let RESULT
  let CONFIG

  const openScope = (title) => {
    if (CURRENT_SCOPE === undefined) throw new Error(`should run TEST_SETUP() before add test: ${title}`)
    const innerScope = createScope(CURRENT_SCOPE, CURRENT_SCOPE.level + 1, title)
    CURRENT_SCOPE[ LIST_NAME_IT ].push(innerScope)
    CURRENT_SCOPE = innerScope
  }
  const closeScope = () => {
    CURRENT_SCOPE = CURRENT_SCOPE.upperScope
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

  const getPushScopeFunc = (type, typeListName) => (title, func) => {
    if (func === undefined && isBasicFunction(title)) [ title, func ] = [ func, title ] // swap to support auto naming, but this is not a good test habit
    if (!isString(title)) title = `${CURRENT_SCOPE.title} - ${type} #${CURRENT_SCOPE[ typeListName ].length}`
    string(title, `invalid ${type} title`)
    basicFunction(func, `invalid ${type} func`)
    CURRENT_SCOPE[ typeListName ].push({
      upperScope: CURRENT_SCOPE,
      level: CURRENT_SCOPE.level + 1,
      title,
      func
    })
  }

  const before = getPushScopeFunc('before', LIST_NAME_BEFORE)
  const it = getPushScopeFunc('it', LIST_NAME_IT)
  const after = getPushScopeFunc('after', LIST_NAME_AFTER)

  const TEST_SETUP = ({
    log = console.log,
    logLevel = (level, ...args) => log(indentLine(args.join(' '), '  '.repeat(level))),
    timeout = 42 * 1000, // 42 sec, for each test
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

      func
    }) => {
      if (!func) { // describe
        CONFIG.logLevel(level, colorTitle(title))
      } else {
        const funcStart = clock()
        const { error } = await catchAsync(withTimeoutAsync, func, CONFIG.timeout)
        const funcDuration = clock() - funcStart
        const timeLog = funcDuration > 64 ? colorTime(`(${time(funcDuration)})`) : ''
        if (error) {
          RESULT.failList.push({ titleStack: getTitleStack(title, upperScope), error })
          CONFIG.logLevel(level, colorError(`[FAIL] ${title}`), timeLog)
          CONFIG.logLevel(level, colorError(indentLine(error.stack || error, '    ')))
        } else {
          RESULT.passList.push({ title })
          CONFIG.logLevel(level, colorText(title), timeLog)
        }
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

  return {
    TEST_SETUP, TEST_RUN,
    describe, it, before, after, info
  }
}

export { createTest }
