import { resolve } from 'node:path'
import { unlinkSync, writeFileSync } from 'node:fs'
import { getUnusedPort } from '@dr-js/core/module/node/server/function.js'
import { createServerExot, createRequestListener } from '@dr-js/core/module/node/server/Server.js'
import { responderSendBuffer, responderSendJSON } from '@dr-js/core/module/node/server/Responder/Send.js'
import { createRouteMap, createResponderRouter } from '@dr-js/core/module/node/server/Responder/Router.js'
import {
  loadRemoteScript, loadLocalScript, loadScript,
  loadRemoteJSON, loadLocalJSON, loadJSON
} from './resource.js'

const { describe, it, before, after } = globalThis

const BUFFER_SCRIPT = Buffer.from(`{
  // Simple script file, used for js test
  const a = async (b = 0) => b + 1
  a().then((result) => { if (result !== 1) throw new Error('unexpected result: ' + result) })
}`)
const SOURCE_JSON = resolve(__dirname, '../../package.json')
const SOURCE_SCRIPT = resolve(__dirname, './test-resource-script-gitignore.js')

const withTestServer = (asyncTest) => async () => {
  const { up, down, server, option: { baseUrl } } = createServerExot({ protocol: 'http:', hostname: '127.0.0.1', port: await getUnusedPort() })
  server.on('request', createRequestListener({
    responderList: [
      createResponderRouter({
        routeMap: createRouteMap([
          [ '/test-json', 'GET', (store) => responderSendJSON(store, { object: { testKey: 'testValue' } }) ],
          [ '/test-script', 'GET', async (store) => responderSendBuffer(store, { buffer: BUFFER_SCRIPT }) ]
        ]),
        baseUrl
      })
    ]
  }))
  await up()
  await asyncTest({ baseUrl })
  await down()
}

before(() => {
  writeFileSync(SOURCE_SCRIPT, BUFFER_SCRIPT)
})

after(() => {
  unlinkSync(SOURCE_SCRIPT)
})

describe('Node.Resource', () => {
  it('loadRemoteScript()', withTestServer(async ({ baseUrl }) => {
    await loadRemoteScript(`${baseUrl}/test-script`)
  }))
  it('loadLocalScript()', async () => {
    await loadLocalScript(SOURCE_SCRIPT)
  })
  it('loadScript()', withTestServer(async ({ baseUrl }) => {
    await loadScript(SOURCE_SCRIPT)
    await loadScript(`${baseUrl}/test-script`)
  }))

  it('loadLocalJSON()', async () => {
    await loadLocalJSON(SOURCE_JSON)
  })
  it('loadRemoteJSON()', withTestServer(async ({ baseUrl }) => {
    await loadRemoteJSON(`${baseUrl}/test-json`)
  }))
  it('loadJSON()', withTestServer(async ({ baseUrl }) => {
    await loadJSON(SOURCE_JSON)
    await loadJSON(`${baseUrl}/test-json`)
  }))
})
