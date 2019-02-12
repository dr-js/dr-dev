import { execSync } from 'child_process'
import { catchAsync } from 'dr-js/module/common/error'
import { setTimeoutAsync } from 'dr-js/module/common/time'
import { run } from 'dr-js/module/node/system/Run'
import { getProcessList, getProcessPidMap, getProcessTree, findProcessTreeNode, checkProcessExist, tryKillProcessTreeNode } from 'dr-js/module/node/system/ProcessStatus'

const tryExec = (command, option) => {
  try {
    return execSync(command, option).toString()
  } catch (error) {
    console.warn(`[tryExec] failed for: ${command}, error: ${error}`)
    return ''
  }
}
const getGitBranch = () => tryExec('git symbolic-ref --short HEAD', { stdio: 'pipe' }).replace('\n', '').trim()
const getGitCommitHash = () => tryExec('git log -1 --format="%H"', { stdio: 'pipe' }).replace('\n', '').trim()

const withRunBackground = async (option, task, setupDelay = 500) => {
  const { subProcess, promise } = run(option)
  const exitPromise = promise.catch((error) => __DEV__ && console.log(`process exit with error: ${error}`))

  // wait for process setup
  await setTimeoutAsync(setupDelay) // wait for a bit for the process to start (usually npm)
  if (!await checkProcessExist({ pid: subProcess.pid })) throw new Error('process exit too early')

  // capture process tree, for later process kill
  const processList = await getProcessList()
  const subProcessInfo = (await getProcessPidMap(processList))[ subProcess.pid ]
  const { pid, command, subTree } = await findProcessTreeNode(subProcessInfo, await getProcessTree(processList)) // drops ppid since sub tree may get chopped
  __DEV__ && console.log({ pid, command, subTree })

  const { result, error } = await catchAsync(task, { subProcess, promise, pid })

  // process kill
  await tryKillProcessTreeNode({ pid, command, subTree })
  await exitPromise

  if (error) throw error
  return result
}

export {
  tryExec,
  getGitBranch,
  getGitCommitHash,

  withRunBackground
}
