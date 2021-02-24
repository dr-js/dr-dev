import { commonInfoPatchCombo } from './ci'
import { getLogger } from 'source/node/logger'

const { describe, it, info = console.log } = global

describe('CI', () => {
  it('commonInfoPatchCombo()', async () => {
    process.env.DRY_RUN = true
    commonInfoPatchCombo(getLogger('test-ci', false, 32, info))
    delete process.env.DRY_RUN
  })
})
