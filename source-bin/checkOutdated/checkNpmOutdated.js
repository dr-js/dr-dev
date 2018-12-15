import { createInsideOutPromise } from 'dr-js/module/common/function'
import { runQuiet } from 'dr-js/module/node/system/Run'
import { tryKillProcessTreeNode, findProcessTreeNode, getProcessTree } from 'dr-js/module/node/system/ProcessStatus'

const checkNpmOutdated = async (pathPackage) => {
  const { promise: runPromise, subProcess, stdoutBufferPromise } = runQuiet({ command: 'npm', argList: [ '--no-update-notifier', 'outdated' ], option: { cwd: pathPackage } })
  const processTreeNode = await findProcessTreeNode({ pid: subProcess.pid }, await getProcessTree())
  const { promise, resolve, reject } = createInsideOutPromise()
  runPromise.then(resolve, resolve) // do not care return code
  setTimeout(reject, 42 * 1000) // 42sec timeout
  const { code, signal } = await promise.catch(async () => {
    console.warn('[checkNpmOutdated] timeout')
    await tryKillProcessTreeNode(processTreeNode)
    throw new Error('[checkNpmOutdated] timeout')
  })
  __DEV__ && console.log(`code: ${code}, signal: ${signal}`)
  __DEV__ && console.log((await stdoutBufferPromise).toString())
  return (await stdoutBufferPromise).toString()
}

export { checkNpmOutdated }
