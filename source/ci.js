import { resolve } from 'path'
import { arch, release } from 'os'

import { prettyStringifyConfigObject } from '@dr-js/core/module/common/format.js'

import { getPathNpm } from '@dr-js/core/module/node/module/Software/npm.js'

import { commonCombo } from './output.js'

const runInfoPatchCombo = ({ RUN, padLog, log }) => {
  padLog('Log info')
  log(`system: ${process.platform}-${release()}[${arch()}]`)
  log(`node: ${process.version}`)
  log(`npm: ${require(resolve(getPathNpm(), './package.json')).version}`)
  log(`with: ${[ '@dr-js/core', '@dr-js/dev' ].map((v) => `${v}@${require(`${v}/package.json`).version}`).join(', ')}`)

  if (process.platform === 'win32') {
    padLog('Patch git') // fix win32 CI cause `something to commit` test error: https://github.com/actions/checkout/issues/135#issuecomment-602171132
    RUN('git config core.autocrlf false')
    RUN('git config core.eol lf')
    RUN('git rm --cached -r .') // reset Git index, `rm .git/index` also work, check: https://stackoverflow.com/questions/5787937/git-status-shows-files-as-changed-even-though-contents-are-the-same/41041699#41041699
    RUN('git reset --hard')
  }
}

// NOTE: test local ci-patch with command like:
//   DRY_RUN=1 npx dr-js-dev-*.tgz -eI .github/ci-patch.js

/** @deprecated */ const commonInfoPatchCombo = (kitLogger, initConfig) => { // TODO: DEPRECATE
  const { config, RUN, ...extra } = commonCombo(kitLogger, initConfig)

  // patch config
  config.IS_WIN32 = process.platform === 'win32' // TODO: DEPRECATE
  config.COMMAND_SUDO_NPM = config.IS_WIN32 ? 'npm.cmd' : 'sudo npm' // win32 has no sudo & need .cmd extension // TODO: DEPRECATE
  kitLogger.log(`config:\n${prettyStringifyConfigObject(config, '  ', '    ')}`)
  runInfoPatchCombo({ ...kitLogger, RUN })

  return { config, RUN, ...extra }
}

export {
  runInfoPatchCombo,
  commonInfoPatchCombo // TODO: DEPRECATE
}
