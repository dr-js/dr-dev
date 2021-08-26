import { Preset, prepareOption } from '@dr-js/core/module/node/module/Option/preset.js'

import { COMBO_COMMAND_CONFIG_MAP } from 'source/node/npm/comboCommand.js' // TODO: DEPRECATE: unused
import { PACKAGE_KEY_DEV_EXEC_COMMAND_MAP } from './mode/exec.js'

const { Config, parseCompactList, pickOneOf } = Preset

const MODE_FORMAT_LIST = parseCompactList(
  // new mode (no short commands for now to avoid conflict)
  'shell-alias,SA,A/AS,O|run shell alias: $@=aliasName,...aliasArgList',

  // version-bump
  'version-bump-git-branch,VBGB/T|bump package version by git branch: -G=isGitCommit, -D=isLongCommitText, $0=gitBranch/current',
  'version-bump-last-number,VBLN/T|bump the last number found in package version: -G, -D',
  'version-bump-to-identifier,VBTI/AS,O/0-1|bump package version to identifier: -G, -D, $0=labelIdentifier/dev',
  'version-bump-to-local,VBTL/T|bump package version to append identifier "local", for local testing: -G, -D',

  // keep mode
  [ 'test,test-root,T/AP,O|list of path to look test file from, default to "."', parseCompactList( // TODO: DEPRECATE: name `test-root`
    'test-file-suffix,TFS/AS,O|pattern for test file, default to ".js"',
    'test-require,TR/AS,O|module or file to require before test files, mostly for "@babel/register"',
    'test-timeout,TT/SI,O|timeout for each test, in msec, default to 42*1000 (42sec)' // TODO: move to "timeout"
  ) ],

  'parse-script,ps/AS,O|parse and echo: $@=scriptName,...extraArgs',
  'parse-script-list,psl/AS,O|combine multi-script, but no extraArgs: $@=...scriptNameList',
  'run-script,rs/AS,O|parse and run: $@=scriptName,...extraArgs',
  'run-script-list,rsl/AS,O|combine multi-script, but no extraArgs: $@=...scriptNameList',

  // shared mode
  'eval,e/A,O|eval file or string: -O=outputFile, -I/$0=scriptFile/scriptString, $@=...evalArgv',
  'repl,i/T|start node REPL',

  // TODO: DEPRECATE: reorder & rename options
  [ 'check-outdated,C/AP,O/0-1|check dependency version from "package.json", or all under the folder: $0/-R=checkPath/"./package.json"', parseCompactList( // TODO: get path from this option
    'write-back,wb/T',
    'path-temp/SP,O|use "AUTO" for os temp,set will disable in-place check for single "package.json"'
  ) ],

  [ 'step-package-version,S/T|step up package version (expect "0.0.0-dev.0-local.0" format): -G=isGitCommit', parseCompactList(
    'sort-key,K/T|sort keys in package.json'
  ) ],

  [ 'init/AP,O/0-1|path for init a package, will not reset existing file, default to "."', parseCompactList( // TODO: DEPRECATE: simplify or remove
    'init-resource-package/SP,O|path to resource package, default search for "./node_modules/@dr-js/dev-*/"',
    'init-reset/T|allow init to reset existing file',
    'init-verify/T|do common init file content check, will skip file modify',
    'init-verify-rule/AP,O|path to verify rule, default search in "init-resource-package"'
  ) ],

  [ 'exec,E/AS,O|exec command, allow set env and cwd: $@=command, ...argList', parseCompactList(
    'exec-env,EE/O/0-1|use URLSearchParams format String, or key-value Object', // TODO: "&" will cause command split in win32
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
      'root,path-input,R/SP,O|common option, may be path to repo folder, or "package.json" file: $0=path/cwd', // TODO: DEPRECATE: name "path-input"

      'git-commit,G/T|common option, mostly for version marking'

      // 'timeout,T/SI,O|common option, 0 for unlimited: $0=msec/undefined',
      // 'json,J/T|output JSON, if supported',
    ),
    ...MODE_FORMAT_LIST
  ]
}

const MODE_NAME_LIST = MODE_FORMAT_LIST.map(({ name }) => name)

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { MODE_NAME_LIST, parseOption, formatUsage }
