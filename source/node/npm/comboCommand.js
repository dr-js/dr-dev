import { resolve } from 'path'
import { execSync } from 'child_process'
import { isString, isBasicFunction } from '@dr-js/core/module/common/check'
import { indentLine } from '@dr-js/core/module/common/string'
import { writeFileAsync } from '@dr-js/core/module/node/file/function'
import { modifyDelete } from '@dr-js/core/module/node/file/Modify'

// [ command or function, message ]
const CC_CONFIG = [
  [ 'npm config set update-notifier false', 'per-user config, stop npm auto check for update, good for server' ],
  [ 'npm config list', 'list non-default config' ]
]
const CC_INSTALL_OFFLINE = [
  [ 'npm i --prefer-offline', 'prefer local version when install' ]
]
const CC_INSTALL_CLEAR = [
  [ async ({ pathRoot }) => modifyDelete(resolve(pathRoot, 'node_modules/')), 'delete "node_modules"' ],
  [ async ({ pathRoot }) => writeFileAsync(resolve(pathRoot, 'package-lock.json'), ''), 'empty "package-lock.json"' ]
]
const CC_PACKAGE_DEDUPE = [
  [ 'npm i', 'first install' ],
  [ 'npm ddp', 'try dedupe, may change "package-lock.json"' ],
  [ 'npm i', 'restore "package-lock.json"' ]
]
const CC_PACKAGE_RESET = [
  ...CC_INSTALL_CLEAR,
  [ 'npm i', 're-install' ]
]

const COMBO_COMMAND_CONFIG_MAP = { // TODO: add more combo?
  'config': CC_CONFIG, 'c': CC_CONFIG,
  'install-offline': CC_INSTALL_OFFLINE, 'io': CC_INSTALL_OFFLINE,
  'install-clear': CC_INSTALL_CLEAR, 'ic': CC_INSTALL_CLEAR,
  'package-dedupe': CC_PACKAGE_DEDUPE, 'ddp': CC_PACKAGE_DEDUPE, 'pd': CC_PACKAGE_DEDUPE,
  'package-reset': CC_PACKAGE_RESET, 'pr': CC_PACKAGE_RESET
}

const comboCommand = async ({
  name,
  pathRoot = process.cwd(), // current all default to cwd
  tabLog = (level, ...args) => {}
}) => {
  const comboCommandConfig = COMBO_COMMAND_CONFIG_MAP[ name ]
  if (!comboCommandConfig) throw new Error(`[combo-command] invalid name: ${name}`)
  tabLog(0, `[combo-command] ${name}`)
  for (const [ commandOrFunction, message ] of comboCommandConfig) {
    if (isString(commandOrFunction)) {
      tabLog(1, `$ ${commandOrFunction}   # ${message}`)
      const output = String(execSync(commandOrFunction, { cwd: pathRoot })).trimEnd()
      output && tabLog(0, indentLine(output, '    '))
    } else if (isBasicFunction(commandOrFunction)) {
      tabLog(1, `$ TASK   # ${message}`)
      const output = String(await commandOrFunction({ pathRoot })).trimEnd()
      output && tabLog(0, indentLine(output, '    '))
    }
  }
}

export {
  COMBO_COMMAND_CONFIG_MAP,
  comboCommand
}
