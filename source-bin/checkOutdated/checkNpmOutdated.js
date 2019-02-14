import { createInsideOutPromise } from 'dr-js/module/common/function'
import { setTimeoutAsync } from 'dr-js/module/common/time'
import { runQuiet } from 'dr-js/module/node/system/Run'
import { tryKillProcessTreeNode, findProcessTreeNode } from 'dr-js/module/node/system/ProcessStatus'

const checkNpmOutdated = async (pathPackage) => {
  const { promise: runPromise, subProcess, stdoutBufferPromise } = runQuiet({
    command: 'npm',
    argList: [ '--no-update-notifier', 'outdated' ],
    option: { cwd: pathPackage }
  })

  await setTimeoutAsync(500) // wait for a bit for npm to start
  const processTreeNode = await findProcessTreeNode({ pid: subProcess.pid })

  const { promise, resolve, reject } = createInsideOutPromise()
  runPromise.then(resolve, resolve) // do not care return code, just process stop
  const timeoutToken = setTimeout(reject, 42 * 1000) // 42sec timeout
  const { code, signal } = await promise.catch(async () => {
    console.warn('[checkNpmOutdated] timeout')
    await tryKillProcessTreeNode(processTreeNode)
    throw new Error('[checkNpmOutdated] timeout')
  })
  clearTimeout(timeoutToken)

  __DEV__ && console.log(`code: ${code}, signal: ${signal}`)
  __DEV__ && console.log(String(await stdoutBufferPromise))

  return String(await stdoutBufferPromise)
}

export { checkNpmOutdated }
