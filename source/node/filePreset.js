import { FILTER_SOURCE_JS_FILE } from './preset'
import { getFileListFromPathList } from './file'

const getSourceJsFileListFromPathList = async (
  pathList,
  resolvePath,
  filterFile = FILTER_SOURCE_JS_FILE
) => getFileListFromPathList(pathList, resolvePath, filterFile)

export { getSourceJsFileListFromPathList }
