import { resolve } from 'path'
import { isString, isBasicObject, isBasicArray } from '@dr-js/core/module/common/check'
import { objectFromEntries } from '@dr-js/core/module/common/immutable/Object'

import { findUpPackageRoot } from '@dr-js/node/module/module/Software/npm'

import { runPassThrough } from 'source/node/run'

import { PACKAGE_KEY_DEV_EXEC_COMMAND_MAP } from '../function'

const doExec = async (argList, {
  env,
  cwd = process.cwd()
}) => runPassThrough(argList, {
  env: { ...process.env, ...parseEnvStringOrObject(env) },
  cwd
})

const parseEnvStringOrObject = (envStringOrObject) => {
  if (!envStringOrObject) return
  if (isString(envStringOrObject)) return objectFromEntries(new URLSearchParams(envStringOrObject))
  if (isBasicObject(envStringOrObject)) return envStringOrObject
  throw new Error(`unexpected env: ${envStringOrObject}`)
}

const doExecLoad = async ({
  pathInput,
  name,
  extraArgList = []
}) => {
  const packageRoot = findUpPackageRoot(pathInput)
  const { [ PACKAGE_KEY_DEV_EXEC_COMMAND_MAP ]: devExecCommandMap } = require(resolve(packageRoot, 'package.json'))

  const devExecCommand = devExecCommandMap[ name ]
  if (!devExecCommand) throw new Error(`missing ${PACKAGE_KEY_DEV_EXEC_COMMAND_MAP}.${name}`)

  const { command: commandStringOrArray, env, cwd } = devExecCommand
  const argList = parseCommandStringOrArray(commandStringOrArray)

  return doExec([ ...argList, ...extraArgList ], {
    env,
    cwd: resolve(packageRoot, cwd || '')
  })
}

const parseCommandStringOrArray = (commandStringOrArray) => {
  if (isString(commandStringOrArray)) return commandStringOrArray.split(' ')
  if (isBasicArray(commandStringOrArray)) return commandStringOrArray
  throw new Error(`unexpected command: ${commandStringOrArray}`)
}

export {
  doExec,
  doExecLoad
}
