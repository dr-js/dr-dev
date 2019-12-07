import { Preset, getOptionalFormatFlag, prepareOption } from '@dr-js/core/module/node/module/Option/preset'

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
  [ 'init,I/AP,O/0-1|path to init a package, will not reset file, default to "."', parseCompactList(
    `init-resource-package,P/SP,O|path to resource package, default search for "./node_modules/@dr-js/dev-*/"`,
    'init-reset,R/T|allow reset file'
    // 'init-verify,V/T|do common init file content check' // TODO: useful?
  ) ]
)

const OPTION_CONFIG = {
  prefixENV: 'dr-dev',
  formatList: [
    Config,
    ...parseCompactList(
      'help,h/T|show full help',
      'version,v/T|show version',
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
