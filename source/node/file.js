import { resolve, relative, sep } from 'path'
import { catchAsync } from '@dr-js/core/module/common/error'
import { nearestExistPath } from '@dr-js/core/module/node/file/Path'
import { createDirectory, getFileList } from '@dr-js/core/module/node/file/Directory'
import { modifyDelete, modifyDeleteForce } from '@dr-js/core/module/node/file/Modify'

const DEFAULT_RESOLVE_PATH = (path) => path

const DEFAULT_FILTER_SCRIPT_FILE = (path) => path.endsWith('.js') && !path.endsWith('.test.js')

const getFileListFromPathList = async (
  pathList = [],
  resolvePath = DEFAULT_RESOLVE_PATH,
  filterFile
) => {
  let resultFileList = []
  for (const path of pathList) resultFileList = resultFileList.concat(await getFileList(resolvePath(path)))
  if (filterFile) resultFileList = resultFileList.filter(filterFile)
  return resultFileList
}

const getScriptFileListFromPathList = async (
  pathList = [],
  resolvePath = DEFAULT_RESOLVE_PATH,
  filterFile = DEFAULT_FILTER_SCRIPT_FILE
) => getFileListFromPathList(pathList, resolvePath, filterFile)

const withTempDirectory = async (tempPath, asyncTask) => { // NOTE: will always reset the directory, before & after the task
  const existPath = await nearestExistPath(tempPath)
  const deletePath = resolve(existPath, relative(existPath, tempPath).split(sep)[ 0 ] || '.')
  __DEV__ && console.log('[withTempDirectory]', { tempPath, existPath, deletePath })
  if (existPath === deletePath) await modifyDelete(tempPath) // reset existing content
  await createDirectory(tempPath) // also check tempPath is Directory
  const { result, error } = await catchAsync(asyncTask, tempPath)
  await modifyDelete(deletePath)
  if (error) throw error
  return result
}

const resetDirectory = async (path) => {
  await modifyDeleteForce(path)
  await createDirectory(path)
}

export {
  getFileListFromPathList,
  getScriptFileListFromPathList,
  withTempDirectory,
  resetDirectory
}
