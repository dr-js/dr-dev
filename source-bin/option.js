import { Preset, getOptionalFormatFlag, prepareOption } from 'dr-js/module/node/module/Option/preset'

const { Config, parseCompact, parseCompactList } = Preset

const OPTION_CONFIG = {
  prefixENV: 'dr-dev',
  formatList: [
    Config,
    ...parseCompactList(
      'help,h/T|show full help',
      'version,v/T|show version'
    ),
    {
      ...parseCompact('path-input,i/SP|path to "package.json", or directory with "package.json" inside'),
      optional: getOptionalFormatFlag('check-outdated', 'pack')
    },
    {
      ...parseCompact('check-outdated,C/T'),
      extendFormatList: parseCompactList('path-temp/SP,O')
    },
    {
      ...parseCompact('pack,p/T'),
      extendFormatList: parseCompactList(
        'path-output,o/SP|output path',
        'output-name/SS,O|output package name',
        'output-version/SS,O|output package version',
        'output-description/SS,O|output package description',
        'publish/T|run npm publish',
        'publish-dev/T|run npm publish-dev'
      )
    },
    {
      ...parseCompact('step-package-version,S/T|step up package version (expect "0.0.0-dev.0-local.0" format)'),
      extendFormatList: parseCompactList(
        'sort-key,K/T|sort keys in package.json',
        'git-commit,G/T|step up main version, and prepare a git commit'
      )
    }
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { parseOption, formatUsage }
