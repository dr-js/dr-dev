import { resolve } from 'path'
import { strictEqual, stringifyEqual } from '@dr-js/core/module/common/verify.js'
import { readText } from '@dr-js/core/module/node/fs/File.js'
import { deleteDirectory, resetDirectory } from '@dr-js/core/module/node/fs/Directory.js'

import {
  // parseYAML, stringifyYAML,
  readYAML, writeYAML
} from './YAML.js'

const { describe, it, before, after } = global

const TEST_ROOT = resolve(__dirname, 'test-yaml-gitignore')
const fromRoot = (...args) => resolve(TEST_ROOT, ...args)

before(async () => resetDirectory(TEST_ROOT))
after(async () => deleteDirectory(TEST_ROOT))

const TEST_OBJECT = { a: 1, b: 2, c: { d: 42 } }
const TEST_YAML = `
a: 1
b: 2
c:
  d: 42
`

describe('Node.Config.YAML', () => {
  it('readYAML/writeYAML()', async () => {
    await writeYAML(fromRoot('test.yaml'), TEST_OBJECT)
    strictEqual(
      (await readText(fromRoot('test.yaml'))).trim(),
      TEST_YAML.trim()
    )

    const value = await readYAML(fromRoot('test.yaml'))
    stringifyEqual(value, TEST_OBJECT)
  })
})
