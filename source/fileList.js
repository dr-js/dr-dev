import { getFileList } from 'dr-js/module/node/file/Directory'

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

export {
  getFileListFromPathList,
  getScriptFileListFromPathList
}
