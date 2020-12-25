import { resolve, relative, sep } from 'path'
import { promises as fsAsync } from 'fs'
import { catchAsync } from '@dr-js/core/module/common/error'
import { isString } from '@dr-js/core/module/common/check'
import { describe } from '@dr-js/core/module/common/format'
import { STAT_ERROR, getPathLstat, nearestExistPath } from '@dr-js/core/module/node/file/Path'
import { getDirInfoList, createDirectory, getFileList } from '@dr-js/core/module/node/file/Directory'
import { modifyDelete, modifyDeleteForce } from '@dr-js/core/module/node/file/Modify'

const DEFAULT_RESOLVE_PATH = (path) => path

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

const findPathFragList = async (root, pathFragList = []) => {
  const foundFragList = [ root ]
  while (pathFragList.length) {
    const frag = pathFragList.shift() // TODO: currently mutating the pathFragList
    let foundFrag
    if (isString(frag)) {
      if (REGEXP_FRAG.test(frag)) throw new Error(`invalid frag: ${frag}`)
      if (STAT_ERROR !== await getPathLstat(resolve(...foundFragList, frag))) foundFrag = frag
    } else if (frag instanceof RegExp) {
      const { name } = (await getDirInfoList(resolve(...foundFragList))).find(({ name }) => frag.test(name)) || {}
      if (name) foundFrag = name
    } else throw new Error(`unsupported frag type: ${describe(frag)}`)
    if (foundFrag === undefined) return undefined // end search, no match
    foundFragList.push(foundFrag)
  }
  return resolve(...foundFragList)
}
const REGEXP_FRAG = /^[/\\]/

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

const copyAfterEdit = async (
  pathFrom,
  pathTo,
  editFunc = async (buffer) => buffer
) => fsAsync.writeFile(pathTo, await editFunc(await fsAsync.readFile(pathFrom)))

export {
  getFileListFromPathList,
  findPathFragList,
  withTempDirectory,
  resetDirectory,
  copyAfterEdit
}
