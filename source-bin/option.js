import { Preset, getOptionalFormatFlag, prepareOption } from 'dr-js/module/node/module/Option/preset'

const { Config, parseCompactList } = Preset

const MODE_FORMAT_LIST = parseCompactList(
  [ 'check-outdated,C/T', parseCompactList(
    'path-temp/SP,O'
  ) ],
  [ 'pack,p/T', parseCompactList(
    'path-output,o/SP|output path',
    'output-name/SS,O|output package name',
    'output-version/SS,O|output package version',
    'output-description/SS,O|output package description',
    'publish/T|run npm publish',
    'publish-dev/T|run npm publish-dev'
  ) ],
  [ 'step-package-version,S/T|step up package version (expect "0.0.0-dev.0-local.0" format)', parseCompactList(
    'sort-key,K/T|sort keys in package.json',
    'git-commit,G/T|step up main version, and prepare a git commit'
  ) ],
  [ 'test-root,T/AP,O|root path to look test file from, default to cwd', parseCompactList(
    'test-file-suffix,TFS/AS,O|pattern for test file, default to ".js"',
    'test-require,TR/AS,O|module or file to require before test files, mostly for "@babel/register"',
    'test-timeout,TT/SI,O|timeout for each test, in msec, default to 10*1000 (10sec)'
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
