import { ConfigPreset, getOptionalFormatFlag, prepareOption, parseCompactFormat } from 'dr-js/module/node/module/Option/preset'

const { SinglePath, Toggle, Config } = ConfigPreset

const parseList = (...args) => args.map(parseCompactFormat)

const OPTION_CONFIG = {
  prefixENV: 'dr-dev',
  formatList: [
    Config,
    ...parseList(
      'help,h/T|show full help',
      'version,v/T|show version'
    ),
    {
      ...SinglePath,
      optional: getOptionalFormatFlag('check-outdated', 'pack'),
      name: 'path-input',
      shortName: 'i',
      description: `path to 'package.json', or directory with 'package.json' inside`
    },
    {
      ...Toggle,
      name: 'check-outdated',
      shortName: 'C',
      extendFormatList: parseList('path-temp/SP,O')
    },
    {
      ...Toggle,
      name: 'pack',
      shortName: 'P',
      extendFormatList: parseList(
        'path-output,o/SP|output path',
        'output-name/SS,O|output package name',
        'output-version/SS,O|output package version',
        'output-description/SS,O|output package description',
        'publish/T|run npm publish',
        'publish-dev/T|run npm publish-dev'
      )
    },
    {
      ...Toggle,
      name: 'step-package-version',
      shortName: 'S',
      description: `step up package version (expect '0.0.0-dev.0-local.0' format)`,
      extendFormatList: parseList(
        'sort-key,K/T|sort keys in package.json',
        'git-commit,G/T|step up main version, and prepare a git commit'
      )
    }
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { parseOption, formatUsage }
