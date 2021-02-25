import { prettyStringifyConfigObject } from '@dr-js/core/module/common/format'
import { resolveCommandName } from '@dr-js/core/module/node/system/ResolveCommand'
import {
  docker, dockerSync,
  getContainerPsList
} from './docker'

const { describe, it, info = console.log } = global

describe('Docker', () => {
  __DEV__ && info(`DOCKER_BIN_PATH: ${resolveCommandName('docker')}`)
  if (!resolveCommandName('docker')) return info('no docker installed') // (GitHub CI Macos)

  it('docker()', async () => {
    const { promise, stdoutPromise } = docker([ 'version' ], { quiet: true })
    await promise
    info(String(await stdoutPromise))
  })

  it('dockerSync()', async () => {
    const { stdout } = dockerSync([ 'version' ], { quiet: true })
    info(String(stdout))
  })

  it('getContainerPsList()', async () => {
    info(prettyStringifyConfigObject(await getContainerPsList()))
  })
})
