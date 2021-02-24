import { prettyStringifyConfigObject } from '@dr-js/core/module/common/format'
import { resolveCommandName } from '@dr-js/core/module/node/system/ResolveCommand'
import { runDocker, getContainerPsList } from './docker'

const { describe, it, info = console.log } = global

describe('Docker', () => {
  __DEV__ && info(`DOCKER_BIN_PATH: ${resolveCommandName('docker')}`)
  if (!resolveCommandName('docker')) return info('no docker installed') // (GitHub CI Macos)

  it('runDocker()', async () => {
    const { promise, stdoutPromise } = runDocker([ 'version' ], { quiet: true })
    await promise
    info(String(await stdoutPromise))
  })
  it('getContainerPsList()', async () => {
    info(prettyStringifyConfigObject(await getContainerPsList()))
  })
})
