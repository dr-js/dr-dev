import { resolve } from 'path'
import { arch, release } from 'os'

import { prettyStringifyConfigObject } from '@dr-js/core/module/common/format.js'

import { getPathNpm } from '@dr-js/node/module/module/Software/npm.js'

import { commonCombo } from './output.js'

// NOTE: test local ci-patch with command like:
//   DRY_RUN=1 npx dr-js-dev-*.tgz -eI .github/ci-patch.js

const commonInfoPatchCombo = (logger, initConfig) => {
  const { config, RUN, ...extra } = commonCombo(logger, initConfig)

  // patch config
  config.IS_WIN32 = process.platform === 'win32'
  config.COMMAND_SUDO_NPM = config.IS_WIN32 ? 'npm.cmd' : 'sudo npm' // win32 has no sudo & need .cmd extension

  logger.padLog('Log info')
  logger.log(`system: ${process.platform}-${release()}[${arch()}]`)
  logger.log(`node: ${process.version}`)
  logger.log(`npm: ${require(resolve(getPathNpm(), './package.json')).version}`)
  logger.log(`with: ${[ '@dr-js/core', '@dr-js/node', '@dr-js/dev' ].map((v) => `${v}@${require(`${v}/package.json`).version}`).join(', ')}`)
  logger.log(`config:\n${prettyStringifyConfigObject(config, '  ', '    ')}`)

  if (config.IS_WIN32) {
    logger.padLog('Patch git') // fix win32 CI cause `something to commit` test error: https://github.com/actions/checkout/issues/135#issuecomment-602171132
    RUN('git config core.autocrlf false')
    RUN('git config core.eol lf')
    RUN('git rm --cached -r .') // reset Git index, `rm .git/index` also work, check: https://stackoverflow.com/questions/5787937/git-status-shows-files-as-changed-even-though-contents-are-the-same/41041699#41041699
    RUN('git reset --hard')
  }

  return { config, RUN, ...extra }
}

export { commonInfoPatchCombo }
