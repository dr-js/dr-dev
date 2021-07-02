import { Preset, getOptionalFormatFlag, prepareOption } from '@dr-js/core/module/node/module/Option/preset.js'

import { PACKAGE_KEY_DEV_EXEC_COMMAND_MAP } from 'source/common/packageJSON/function.js'
import { COMBO_COMMAND_CONFIG_MAP } from 'source/node/npm/comboCommand.js' // TODO: DEPRECATE: unused

const { Config, parseCompactList, pickOneOf } = Preset

const MODE_FORMAT_LIST = parseCompactList(
  // new mode (no short commands for now to avoid conflict)

  // keep mode
  [ 'test,test-root,T/AP,O|list of path to look test file from, default to "."', parseCompactList( // TODO: DEPRECATE: name `test-root`
    'test-file-suffix,TFS/AS,O|pattern for test file, default to ".js"',
    'test-require,TR/AS,O|module or file to require before test files, mostly for "@babel/register"',
    'test-timeout,TT/SI,O|timeout for each test, in msec, default to 42*1000 (42sec)'
  ) ],

  'parse-script,ps/AS,O|parse and echo: $@=scriptName,...extraArgs',
  'parse-script-list,psl/AS,O|combine multi-script, but no extraArgs: $@=...scriptNameList',
  'run-script,rs/AS,O|parse and run: $@=scriptName,...extraArgs',
  'run-script-list,rsl/AS,O|combine multi-script, but no extraArgs: $@=...scriptNameList',

  // shared mode
  'eval,e/A,O|eval file or string: -O=outputFile, -I/$0=scriptFile/scriptString, $@=...evalArgv',
  'repl,i/T|start node REPL',

  // TODO: DEPRECATE: reorder & rename options
  [ 'check-outdated,C/T', parseCompactList(
    'path-temp/SP,O'
  ) ],

  [ 'step-package-version,S/T|step up package version (expect "0.0.0-dev.0-local.0" format)', parseCompactList(
    'sort-key,K/T|sort keys in package.json',
    'git-commit,G/T|step up patch version, and prepare a git commit'
  ) ],

  [ 'init/AP,O/0-1|path for init a package, will not reset existing file, default to "."', parseCompactList( // TODO: DEPRECATE: simplify or remove
    'init-resource-package,P/SP,O|path to resource package, default search for "./node_modules/@dr-js/dev-*/"',
    'init-reset,R/T|allow init to reset existing file',
    'init-verify,V/T|do common init file content check, will skip file modify',
    'init-verify-rule,IVR/AP,O|path to verify rule, default search in "init-resource-package"'
  ) ],

  [ 'exec,E/AS,O|exec command, allow set env and cwd: $@=command, ...argList', parseCompactList(
    'exec-env,EE/O/0-1|use URLSearchParams format String, or key-value Object',
    'exec-cwd,EC/P,O/0-1|reset cwd to path'
  ) ],
  `exec-load,EL/AS,O|load and exec command from package.json[ "${PACKAGE_KEY_DEV_EXEC_COMMAND_MAP}" ]: $@=commandName, ...extraArgList`,

  [ 'cache-step,cs/SS,O', { // enable checksum, stale-check, and delete, will only stale-check on checksum change
    ...pickOneOf([
      'setup', 'mark', 'prune',
      'is-hash-changed', 'IHC', // allow repeatable shell check before the actual prune, exit with 0 as shell `true` when hash changed
      'checksum-file-only', 'CFO' // only write the checksum file
    ]),
    extendFormatList: parseCompactList(
      [ 'prune-policy/SS,O', pickOneOf([ 'unused', 'stale-only', 'debug' ], '"prune" only, ') ],
      'path-stat-file/SP,O|path of stat file, used to help detect checksum change and compare stale-check time, only optional for "checksum-file-only" mode',
      'path-checksum-list,pcl/AP|list of file or directory to calc checksum',
      'path-checksum-file,pcf/SP|path for generated checksum file',
      'path-stale-check-list/AP,O/0-|list of cache file or directory to check time',
      'path-stale-check-file/SP,O|path for generated stale-check report file, also useful for debugging',
      'max-stale-day/SI,O|how old unused file is stale, default: 8day'
    )
  } ],

  `npm-combo,nc,M/AS,O|useful npm combo, one of: ${Object.keys(COMBO_COMMAND_CONFIG_MAP).join('|')}`, // TODO: DEPRECATE: unused
  'npx-lazy,npx,nl,X/AS,O|skip npx re-install if package version fit: $@=package@version,...extraArgs',

  // shared mode
  'fetch,f/AS,O/1-4|fetch url with http_proxy env support: -I=requestBody/null, -O=outputFile/stdout, $@=initialUrl,method/GET,jumpMax/4,timeout/0' // TODO: DEPRECATE: drop mode 'fetch'
)

const OPTION_CONFIG = {
  prefixENV: 'dr-dev',
  formatList: [
    Config,
    ...parseCompactList(
      'help,h/T|show full help',
      'version,v/T|show version',
      'note,N/AS,O|noop, tag for ps/htop',

      'quiet,q/T|less log',
      'debug,D/T|more debug log, mute by "quiet"',

      'input-file,I/SP,O|common option',
      'output-file,O/SP,O|common option',
      'pid-file,pid/SP,O|common option',

      [ 'path-input/SP|path to "package.json", or directory with "package.json" inside', { // TODO: DEPRECATE: change to input-file
        optional: getOptionalFormatFlag('check-outdated')
      } ]
    ),
    ...MODE_FORMAT_LIST
  ]
}

const MODE_NAME_LIST = MODE_FORMAT_LIST.map(({ name }) => name)

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { MODE_NAME_LIST, parseOption, formatUsage }
