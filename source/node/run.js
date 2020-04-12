import { spawnSync } from 'child_process'
import { catchAsync } from '@dr-js/core/module/common/error'
import { setTimeoutAsync } from '@dr-js/core/module/common/time'
import { run } from '@dr-js/core/module/node/system/Run'
import { resolveCommandAsync } from '@dr-js/core/module/node/system/ResolveCommand'
import {
  getProcessListAsync,
  toProcessPidMap,
  toProcessTree, findProcessTreeInfo,
  killProcessTreeInfoAsync,
  isPidExist
} from '@dr-js/core/module/node/system/Process'

// TODO: copied from `@dr-js/node`, consider import directly?
const gitSync = (...argList) => String(spawnSync('git', argList).stdout).replace(/\s/g, '')
const getGitBranch = () => gitSync('symbolic-ref', '--short', 'HEAD') || `detached-HEAD/${gitSync('rev-parse', '--short', 'HEAD')}`
const getGitCommitHash = () => gitSync('log', '-1', '--format=%H')

const withRunBackground = async (option, task, setupDelay = 500) => {
  const { subProcess, promise } = run(option)
  const exitPromise = promise.catch((error) => __DEV__ && console.log(`process exit with error: ${error}`))

  // wait for process setup
  await setTimeoutAsync(setupDelay) // wait for a bit for the process to start (usually npm)
  if (!isPidExist(subProcess.pid)) throw new Error('process exit too early')

  // capture process tree, for later process kill
  const processList = await getProcessListAsync()
  const subProcessInfo = toProcessPidMap(processList)[ subProcess.pid ]
  const { pid, command, subTree } = findProcessTreeInfo(subProcessInfo, toProcessTree(processList)) // drops ppid since sub tree may get chopped
  __DEV__ && console.log({ pid, command, subTree })

  const { result, error } = await catchAsync(task, { subProcess, promise, pid })

  // process kill
  await killProcessTreeInfoAsync({ pid, command, subTree })
  await exitPromise

  if (error) throw error
  return result
}

// do not support shell internal command (shell: false)
// after this should execute no more code
// borrowed logic: https://github.com/babel/babel/blob/v7.9.5/packages/babel-node/src/babel-node.js#L86-L99
const runAndHandover = async ({ command, argList, option }) => {
  command = await resolveCommandAsync(command, option && option.cwd) // find full path, especially for win32
  if (option) option = { ...option, stdio: 'inherit', shell: false } // force reset to inherit stdio and no shell
  const { promise, subProcess } = run({ command, argList, option })
  SOFT_SIGNAL_LIST.forEach((signal) => process.on(signal, () => subProcess.kill(signal)))
  const { code } = await promise.catch((error) => error)
  if (code) process.exitCode = code
}
const SOFT_SIGNAL_LIST = [
  'SIGINT', // 1, soft
  'SIGHUP', // 2, soft, ~10sec kill delay in Windows
  'SIGQUIT', // 3, soft
  // 'SIGKILL', // 9, hard, cannot have a listener installed
  'SIGTERM' // 15, soft
]

export {
  getGitBranch,
  getGitCommitHash,

  withRunBackground,
  runAndHandover
}
