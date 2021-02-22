import { resolve } from 'path'
import { arch, release } from 'os'

import { prettyStringifyConfigObject } from '@dr-js/core/module/common/format'
import { run, runDetached } from '@dr-js/core/module/node/run'

import { findUpPackageRoot, getPathNpm } from '@dr-js/node/module/module/Software/npm'

// NOTE: test local ci-patch with command like:
//   DRY_RUN=1 npx dr-js-dev-0.4.5-dev.3-local.0.tgz -eI .github/ci-patch.js

const commonInfoPatchCombo = async (logger, config = { PATH_ROOT: findUpPackageRoot(process.cwd()) }) => {
  // add common config
  if (process.env.DRY_RUN) config.DRY_RUN = true
  config.IS_WIN32 = process.platform === 'win32'
  config.COMMAND_SUDO_NPM = config.IS_WIN32 ? 'npm.cmd' : 'sudo npm' // win32 has no sudo & need .cmd extension

  logger.padLog('Log info')
  logger.log(`system: ${process.platform}-${release()}[${arch()}]`)
  logger.log(`node: ${process.version}`)
  logger.log(`npm: ${require(resolve(getPathNpm(), './package')).version}`)
  logger.log(`with: ${[ '@dr-js/core', '@dr-js/node', '@dr-js/dev' ].map((v) => `${v}@${require(`${v}/package`).version}`).join(', ')}`)
  logger.log(`config:\n${prettyStringifyConfigObject(config, '  ', '    ')}`)

  const RUN = async (argListOrString, isDetached = false) => {
    const argList = Array.isArray(argListOrString) ? argListOrString : argListOrString.split(' ').filter(Boolean) // prepend `'bash', '-c'` to run in bash shell
    logger.log(`[${config.DRY_RUN ? 'DRY_RUN' : 'RUN'}] "${argList.join(' ')}"`)
    if (!config.DRY_RUN) await (isDetached ? runDetached : run)(argList, { cwd: config.PATH_ROOT }).promise
  }

  if (config.IS_WIN32) {
    logger.padLog('Patch git') // fix win32 CI cause `something to commit` test error: https://github.com/actions/checkout/issues/135#issuecomment-602171132
    await RUN('git config core.autocrlf false')
    await RUN('git config core.eol lf')
    await RUN('git rm --cached -r .') // reset Git index, `rm .git/index` also work, check: https://stackoverflow.com/questions/5787937/git-status-shows-files-as-changed-even-though-contents-are-the-same/41041699#41041699
    await RUN('git reset --hard')
  }

  return {
    config,
    RUN,
    fromRoot: (...args) => resolve(config.PATH_ROOT, ...args)
  }
}

export { commonInfoPatchCombo }
