import { getLogger } from 'source/node/logger'
import { commonInfoPatchCombo } from './ci'

const { describe, it, info = console.log } = global

describe('CI', () => {
  it('commonInfoPatchCombo()', async () => {
    process.env.DRY_RUN = true
    const result = commonInfoPatchCombo(getLogger('test-ci', false, 32, info))
    delete process.env.DRY_RUN
    __DEV__ && console.log(result)
  })
})
