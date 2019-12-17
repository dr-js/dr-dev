import { Preset, getOptionalFormatFlag, prepareOption } from '@dr-js/core/module/node/module/Option/preset'

import { COMBO_COMMAND_CONFIG_MAP } from '@dr-js/dev/module/node/npm/comboCommand'

const { Config, parseCompactList } = Preset

const MODE_FORMAT_LIST = parseCompactList(
  [ 'pack/T', parseCompactList(
    'path-output/SP|output path',
    'output-name/SS,O|output package name',
    'output-version/SS,O|output package version',
    'output-description/SS,O|output package description',
    'publish/T|run npm publish',
    'publish-dev/T|run npm publish-dev',
    'dry-run/T|for testing publish procedure'
  ) ],
  [ 'check-outdated,C/T', parseCompactList(
    'path-temp/SP,O'
  ) ],
  [ 'step-package-version,S/T|step up package version (expect "0.0.0-dev.0-local.0" format)', parseCompactList(
    'sort-key,K/T|sort keys in package.json',
    'git-commit,G/T|step up patch version, and prepare a git commit'
  ) ],
  [ 'test-root,T/AP,O|root path to look test file from, default to "."', parseCompactList(
    'test-file-suffix,TFS/AS,O|pattern for test file, default to ".js"',
    'test-require,TR/AS,O|module or file to require before test files, mostly for "@babel/register"',
    'test-timeout,TT/SI,O|timeout for each test, in msec, default to 10*1000 (10sec)'
  ) ],
  [ 'init,I/AP,O/0-1|path for init a package, will not reset existing file, default to "."', parseCompactList(
    `init-resource-package,P/SP,O|path to resource package, default search for "./node_modules/@dr-js/dev-*/"`,
    'init-reset,R/T|allow init to reset existing file',
    'init-verify,V/T|do common init file content check, will skip file modify',
    'init-verify-rule,IVR/AP,O|path to verify rule, default search in "init-resource-package"'
  ) ],
  'parse-script,ps/AS,O|parse and echo: $@=scriptName,...extraArgs',
  'parse-script-list,psl/AS,O|combine multi-script, but no extraArgs: $@=...scriptNameList',
  'run-script,rs/AS,O|parse and run: $@=scriptName,...extraArgs',
  'run-script-list,rsl/AS,O|combine multi-script, but no extraArgs: $@=...scriptNameList',
  `npm-combo,nc,M/AS,O|useful npm combo, one of: ${Object.keys(COMBO_COMMAND_CONFIG_MAP).join(', ')}`,
  'npx-lazy,npx,nl,X/AS,O|skip npx re-install if package version fit: $@=package@version,...extraArgs'
)

const OPTION_CONFIG = {
  prefixENV: 'dr-dev',
  formatList: [
    Config,
    ...parseCompactList(
      'help,h/T|show full help',
      'version,v/T|show version',
      'debug,D/T|more debug log',
      [ 'path-input,i/SP|path to "package.json", or directory with "package.json" inside', {
        optional: getOptionalFormatFlag('check-outdated', 'pack')
      } ]
    ),
    ...MODE_FORMAT_LIST
  ]
}

const MODE_NAME_LIST = MODE_FORMAT_LIST.map(({ name }) => name)

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { MODE_NAME_LIST, parseOption, formatUsage }
