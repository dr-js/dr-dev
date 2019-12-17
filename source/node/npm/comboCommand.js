import { execSync } from 'child_process'
import { indentLine } from '@dr-js/core/module/common/string'

const COMBO_COMMAND_CONFIG_MAP = { // TODO: add more combo?
  'config': [
    // [ command, message ]
    [ 'npm config set update-notifier false', 'per-user config, stop npm auto check for update, good for server' ],
    [ 'npm config list', 'list non-default config' ]
  ],
  'install-offline': [
    [ 'npm i --prefer-offline', 'prefer local version when install' ]
  ],
  'package-dedupe': [
    [ 'npm i', 'first install' ],
    [ 'npm ddp', 'try dedupe, may change "package-lock.json"' ],
    [ 'npm i', 'restore "package-lock.json"' ]
  ]
}

// alias
COMBO_COMMAND_CONFIG_MAP[ 'c' ] = COMBO_COMMAND_CONFIG_MAP[ 'config' ]
COMBO_COMMAND_CONFIG_MAP[ 'io' ] = COMBO_COMMAND_CONFIG_MAP[ 'install-offline' ]
COMBO_COMMAND_CONFIG_MAP[ 'pd' ] = COMBO_COMMAND_CONFIG_MAP[ 'package-dedupe' ]

const comboCommand = (
  name,
  tabLog = (level, ...args) => {}
) => {
  const comboCommandConfig = COMBO_COMMAND_CONFIG_MAP[ name ]
  if (!comboCommandConfig) throw new Error(`[combo-command] invalid name: ${name}`)
  tabLog(0, `[combo-command] ${name}`)
  for (const [ command, message ] of comboCommandConfig) {
    tabLog(1, `$ ${command}   # ${message}`)
    const output = String(execSync(command)).trimEnd()
    output && tabLog(0, indentLine(output, '    '))
  }
}

export {
  COMBO_COMMAND_CONFIG_MAP,
  comboCommand
}
