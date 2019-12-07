import { resolve } from 'path'
import { stringifyEqual, doThrowAsync } from '@dr-js/core/module/common/verify'

import {
  findPathFragList
} from './file'

const { describe, it } = global

const PATH_ROOT = resolve(__dirname, __dirname.includes('output-gitignore') ? '../../../' : '../../')

__DEV__ && console.log({ PATH_ROOT })

describe('File', () => {
  it('findPathFragList()', async () => {
    await doThrowAsync(async () => findPathFragList(PATH_ROOT, [ {} ]))
    await doThrowAsync(async () => findPathFragList(PATH_ROOT, [ 1 ]))
    stringifyEqual(
      await findPathFragList(PATH_ROOT, [ 'non-exist-file' ]),
      undefined
    )
    stringifyEqual(
      await findPathFragList(PATH_ROOT, [ 'package.json' ]),
      resolve(PATH_ROOT, 'package.json')
    )
    stringifyEqual(
      await findPathFragList(PATH_ROOT, [ /pa\w+\.json$/ ]),
      resolve(PATH_ROOT, 'package.json')
    )
    stringifyEqual(
      await findPathFragList(PATH_ROOT, [ 'source/node/file.js' ]),
      resolve(PATH_ROOT, 'source/node/file.js')
    )
    stringifyEqual(
      await findPathFragList(PATH_ROOT, [ 'source', 'node/file.js' ]),
      resolve(PATH_ROOT, 'source/node/file.js')
    )
    stringifyEqual(
      await findPathFragList(PATH_ROOT, [ 'source', /node?/, 'file.js' ]),
      resolve(PATH_ROOT, 'source/node/file.js')
    )
  })
})
