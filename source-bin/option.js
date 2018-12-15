import { getOptionalFormatFlag } from 'dr-js/module/common/module/Option/preset'
import { ConfigPresetNode, prepareOption } from 'dr-js/module/node/module/Option'

const { SingleString, SinglePath, BooleanFlag, Config } = ConfigPresetNode

const OPTION_CONFIG = {
  prefixENV: 'dr-dev',
  formatList: [
    Config,
    { ...BooleanFlag, name: 'help', shortName: 'h' },
    { ...BooleanFlag, name: 'version', shortName: 'v' },
    {
      ...SinglePath,
      optional: getOptionalFormatFlag('check-outdated', 'pack'),
      name: 'path-input',
      shortName: 'i',
      description: `path to 'package.json', or directory with 'package.json' inside`
    },
    {
      ...BooleanFlag,
      name: 'check-outdated',
      shortName: 'C',
      extendFormatList: [
        { ...SinglePath, optional: true, name: 'path-temp' }
      ]
    },
    {
      ...BooleanFlag,
      name: 'pack',
      shortName: 'P',
      extendFormatList: [
        { ...SinglePath, name: 'path-output', shortName: 'o', description: `output path` },
        { ...SingleString, optional: true, name: 'output-name', description: `output package name` },
        { ...SingleString, optional: true, name: 'output-version', description: `output package version` },
        { ...SingleString, optional: true, name: 'output-description', description: `output package description` },
        { ...BooleanFlag, name: 'publish', description: `run npm publish` },
        { ...BooleanFlag, name: 'publish-dev', description: `run npm publish-dev` }
      ]
    },
    {
      ...BooleanFlag,
      name: 'step-package-version',
      shortName: 'S',
      description: `step up package version (expect '0.0.0-dev.0-local.0' format)`,
      extendFormatList: [
        { ...BooleanFlag, name: 'sort-key', shortName: 'K', description: `sort keys in package.json` },
        { ...BooleanFlag, name: 'git-commit', shortName: 'G', description: `step up main version, and prepare a git commit` }
      ]
    }
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { parseOption, formatUsage }
