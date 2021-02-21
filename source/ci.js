import { resolve } from 'path'
import { arch, release } from 'os'

import { prettyStringifyConfigObject } from '@dr-js/core/module/common/format'
import { run, runDetached } from '@dr-js/core/module/node/run'

import { getPathNpm } from '@dr-js/node/module/module/Software/npm'

const commonInfoPatchCombo = (logger, { PATH_ROOT, ...extraInfo } = {}) => {
  if (process.env.DRY_RUN) extraInfo.DRY_RUN = true

  logger.padLog('Log info')
  logger.log(`system: ${process.platform}-${release()}[${arch()}]`)
  logger.log(`node: ${process.version}`)
  logger.log(`npm: ${require(resolve(getPathNpm(), './package')).version}`)
  logger.log(`with: ${[ '@dr-js/core', '@dr-js/node', '@dr-js/dev' ].map((v) => `${v}@${require(`${v}/package`).version}`).join(', ')}`)
  logger.log(`extra:\n${prettyStringifyConfigObject({ PATH_ROOT, ...extraInfo }, '  ', '    ')}`)

  const RUN = async (argListOrString, isDetached = false) => {
    const argList = Array.isArray(argListOrString) ? argListOrString : argListOrString.split(' ').filter(Boolean) // prepend `'bash', '-c'` to run in bash shell
    logger.log(`[RUN] "${argList.join(' ')}"`)
    !extraInfo.DRY_RUN && await (isDetached ? runDetached : run)(argList, { cwd: PATH_ROOT }).promise
  }

  const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

  return { RUN, fromRoot }
}

export { commonInfoPatchCombo }
