import { prettyStringifyConfigObject } from '@dr-js/core/module/common/format.js'
import { resolveCommandName } from '@dr-js/core/module/node/system/ResolveCommand.js'
import {
  getContainerLsList
} from './docker.js'

const { describe, it, info = console.log } = global

describe('Docker', () => {
  __DEV__ && info(`DOCKER_BIN_PATH: ${resolveCommandName('docker')}`)

  if (resolveCommandName('docker')) {
    it('getContainerLsList()', async () => {
      info(prettyStringifyConfigObject(await getContainerLsList()))
    })
  } else { // no docker installed (GitHub CI Macos)
    info('no docker installed')
  }
})
