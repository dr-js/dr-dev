import { tryRequire } from '@dr-js/core/module/env/tryRequire.js'

import { catchAsync } from '@dr-js/core/module/common/error.js'
import { isBasicArray } from '@dr-js/core/module/common/check.js'
import { string, basicFunction } from '@dr-js/core/module/common/verify.js'
import { autoEllipsis, indentLine } from '@dr-js/core/module/common/string.js'

import { readBuffer } from '@dr-js/core/module/node/fs/File.js'
import { fromNpmNodeModules } from '@dr-js/core/module/node/module/Software/npm.js'
import { configureTerminalColor } from '@dr-js/core/module/node/module/TerminalColor.js'
import { resolveCommand } from '@dr-js/core/module/node/system/ResolveCommand.js'
import { runStdoutSync } from '@dr-js/core/module/node/run.js'
import { getKitLogger } from '@dr-js/core/module/node/kit.js'

const textS = (value) => autoEllipsis(JSON.stringify(String(value)), 128, 64, 32)
const textM = (value) => autoEllipsis(JSON.stringify(String(value)), 256, 128, 64)
// const textL = (value) => autoEllipsis(JSON.stringify(String(value)), 1024, 512, 256)

const toList = (value) => isBasicArray(value) ? value : [ value ]

const KIT_LOGGER = getKitLogger({ title: 'verify', isNoEnvKey: true })
const useKitLogger = (nextKitLogger) => Object.assign(KIT_LOGGER, nextKitLogger)

const COLOR_FG = configureTerminalColor().fg

const verifyString = (string, matchStringOrRegExpList) => {
  matchStringOrRegExpList = toList(matchStringOrRegExpList)
  KIT_LOGGER.log(`[verifyString] ${textS(string)}`)
  matchStringOrRegExpList.forEach((matchStringOrRegExp) => {
    const isPass = typeof (matchStringOrRegExp) === 'string'
      ? string.includes(matchStringOrRegExp)
      : matchStringOrRegExp.test(string)
    KIT_LOGGER.log(`  ${isPass ? '-' : '!'} ${textS(matchStringOrRegExp)}`)
    if (!isPass) throw new Error(`[verifyString] expect ${textM(string)} to match ${textM(matchStringOrRegExp)}`)
  })
}

const verifyFile = async (filePath, verifyBuffer) => {
  const { result: buffer, error } = catchAsync(readBuffer, filePath)
  if (error) throw new Error(`[verifyFile] failed to load file "${filePath}": ${textM(error)}`)
  return verifyBuffer(buffer)
}

const verifySemVer = (actual, expect) => {
  KIT_LOGGER.log(`[verifySemVer] "${textS(actual)}" to match "${expect}"`)
  const SemVer = tryRequire(fromNpmNodeModules('semver')) // check: https://www.npmjs.com/package/semver
  if (!SemVer) throw new Error('[verifySemVer] failed to load package "semver" from "npm"')
  if (!SemVer.satisfies(SemVer.clean(actual, { loose: true }), expect)) throw new Error(`[verifySemVer] expect "${textM(actual)}" to match "${textM(expect)}"`)
}

const verifyCommand = (commandStringOrArray, option = {}) => {
  const argList = isBasicArray(commandStringOrArray) ? [ ...commandStringOrArray ] : commandStringOrArray.split(' ')
  KIT_LOGGER.log(`[verifyCommand] ${textS(argList.join(' '))}`)
  argList[ 0 ] = resolveCommand(argList[ 0 ])
  return String(runStdoutSync(argList, {
    ...option, env: { ...process.env, ...option.env }, quiet: true, describeError: true
  }))
}

// COMBO: common combined verify
const verifyCommandSemVer = async (
  commandStringOrArray,
  expectVersion,
  stdoutProcessFunc = async (string) => string
) => verifySemVer( // combo for `node -v` or `npm -v`
  String(await stdoutProcessFunc(verifyCommand(commandStringOrArray))).trim(),
  expectVersion
)
const verifyFileString = async (filePath, matchStringOrRegExpList) => verifyFile(
  filePath,
  (buffer) => verifyString(String(buffer), matchStringOrRegExpList)
)

const toTask = (
  title, // = '' // short title, should optimize for search
  message, // = '' // explain what this test, and where to start fix
  task, // = async () => {} // fail task by throw error
  allowFail = false // if set to true, task fail will be warning
) => {
  string(title, '[toTask] expect "title"')
  string(message, '[toTask] expect "message"')
  basicFunction(task, '[toTask] expect "task"')
  return { title, message, task, allowFail }
}

const runTaskList = async (taskList = []) => {
  const passList = []
  const warnList = []
  const errorList = []
  for (const { task, title, message, allowFail = false } of taskList.filter(Boolean)) {
    KIT_LOGGER.stepLog(`[${title}]`)
    try {
      await task()
      passList.push({ error: undefined, task, title, message })
      KIT_LOGGER.log('PASS')
    } catch (error) {
      (allowFail ? warnList : errorList).push({ error, task, title, message })
      KIT_LOGGER.log((allowFail ? COLOR_FG.yellow : COLOR_FG.red)(`FAIL: ${error.message}`))
    }
  }
  const formatOutcomeList = (tag, outcomeList) => [
    '',
    `[${tag}] failed: ${outcomeList.length}`,
    ...outcomeList.map(({ error, title, message }) => [
      `  ${tag} [${title}]`,
      indentLine(message, '  - '),
      indentLine(String(error), '  > ') // indentLine((error && error.stack) || String(error), '  > ') // TODO: do not log long error stack
    ].join('\n')),
    `[${tag}] failed: ${outcomeList.length}`
  ].join('\n')
  warnList.length && KIT_LOGGER.log(COLOR_FG.yellow(formatOutcomeList('WARN', warnList)))
  errorList.length && KIT_LOGGER.log(COLOR_FG.red(formatOutcomeList('ERROR', errorList)))

  const summary = `[verifyTaskList] pass: ${passList.length}, warn: ${warnList.length}, error: ${errorList.length}`
  KIT_LOGGER.padLog(summary)
  return { summary, passList, warnList, errorList }
}

const verifyTaskList = async (taskList = []) => {
  const { summary, errorList } = await runTaskList(taskList)
  if (errorList.length) throw new Error(summary)
}

export {
  verifyString,
  verifyFile,
  verifySemVer,
  verifyCommand,

  verifyFileString,
  verifyCommandSemVer,

  useKitLogger,
  toTask, runTaskList, verifyTaskList
}
