import { resolve } from 'node:path'
import { strictEqual } from '@dr-js/core/module/common/verify.js'
import { readText } from '@dr-js/core/module/node/fs/File.js'
import { deleteDirectory, resetDirectory } from '@dr-js/core/module/node/fs/Directory.js'

import {
  // outputConfig,
  outputConfigMap
} from './Output.js'

const { describe, it, before, after, info = console.log } = global

const TEST_ROOT = resolve(__dirname, 'test-ouptut-gitignore')
const fromRoot = (...args) => resolve(TEST_ROOT, ...args)

before(async () => resetDirectory(TEST_ROOT))
after(async () => deleteDirectory(TEST_ROOT))

const verifyFile = async (file, expectString) => strictEqual(
  (await readText(file)).trim(),
  expectString.trim()
)

const TEST_OBJECT = { a: 1, b: 2, c: { d: 42 } }

const TEST_OUTPUT_CONFIG = {
  'basic.json': TEST_OBJECT,
  'combo.json|combo.yml|combo.yaml|combo.nginx.conf': TEST_OBJECT
}

const TEST_OUTPUT_JSON = `{
  "a": 1,
  "b": 2,
  "c": {
    "d": 42
  }
}`
const TEST_OUTPUT_YAML = `
a: 1
b: 2
c:
  d: 42
`
const TEST_OUTPUT_NGINX_CONF = `
a                       1;
b                       2;
c {
  d                     42;
}
`

describe('Node.Config.Output', () => {
  it('outputConfigMap()', async () => {
    await outputConfigMap(TEST_OUTPUT_CONFIG, { outputRoot: TEST_ROOT, log: info })

    await verifyFile(fromRoot('basic.json'), TEST_OUTPUT_JSON)
    await verifyFile(fromRoot('combo.json'), TEST_OUTPUT_JSON)
    await verifyFile(fromRoot('combo.yml'), TEST_OUTPUT_YAML)
    await verifyFile(fromRoot('combo.yaml'), TEST_OUTPUT_YAML)
    await verifyFile(fromRoot('combo.nginx.conf'), TEST_OUTPUT_NGINX_CONF)
  })
})
