import { prettyStringifyConfigObject } from '@dr-js/core/module/common/format.js'
import { resolveCommandName } from '@dr-js/core/module/node/system/ResolveCommand.js'
import {
  docker, dockerSync,
  compose, composeSync,
  getContainerLsList
} from './docker.js'

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

  it('compose()', async () => {
    const { promise, stdoutPromise } = compose([ 'version' ], { quiet: true })
    await promise
    info(String(await stdoutPromise))
  })

  it('composeSync()', async () => {
    const { stdout } = composeSync([ 'version' ], { quiet: true })
    info(String(stdout))
  })

  it('getContainerLsList()', async () => {
    info(prettyStringifyConfigObject(await getContainerLsList()))
  })
})
