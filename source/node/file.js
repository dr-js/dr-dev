import { resolve, relative, sep } from 'path'
import { promises as fsAsync } from 'fs'

import { catchAsync } from '@dr-js/core/module/common/error'
import { isString } from '@dr-js/core/module/common/check'
import { describe } from '@dr-js/core/module/common/format'
import { STAT_ERROR, getPathLstat, nearestExistPath } from '@dr-js/core/module/node/file/Path'
import { getDirInfoList, createDirectory, getFileList } from '@dr-js/core/module/node/file/Directory'
import { modifyDelete, modifyDeleteForce } from '@dr-js/core/module/node/file/Modify'

import { compressGzBrFileAsync } from '@dr-js/node/module/module/Software/function'

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
  await modifyDeleteForce(path) // maybe not exist
  await createDirectory(path)
}

const editFile = async (
  editFunc = async (buffer) => buffer,
  pathFrom,
  pathTo = pathFrom // support both copy & in-place edit
) => fsAsync.writeFile(pathTo, await editFunc(await fsAsync.readFile(pathFrom)))

// for remove dup before zip/packing
// given a list of file, return which file should keep, and which is just pre-compressed dup
const filterPrecompressFileList = (fileList) => {
  const sourceFileList = [] // should be source file
  const sourceCompressList = [] // should be compressible, by extension
  const precompressFileList = [] // just pre-compressed dup
  const fileSet = new Set(fileList)
  for (const file of fileList) {
    if (
      /\.(gz|br)$/.test(file) && // is compressed naming
      fileSet.has(file.slice(0, -3)) // exist source with dropped ".gz|br" extension
    ) {
      precompressFileList.push(file)
      continue
    }
    sourceFileList.push(file)
    if (/\.(js|json|txt|md|html|css|xml|svg|ico|otf|ttf|eot)$/.test(file)) sourceCompressList.push(file)
  }
  return {
    sourceFileList,
    sourceCompressList,
    precompressFileList
  }
}
const generatePrecompressForPath = async (path) => { // will overwrite existing precompressFile to prevent stale content being kept
  const result = filterPrecompressFileList(await getFileList(path))
  for (const file of result.sourceCompressList) {
    await Promise.all([
      compressGzBrFileAsync(file, `${file}.gz`),
      compressGzBrFileAsync(file, `${file}.br`)
    ])
  }
  return result
}
const trimPrecompressForPath = async (path) => {
  const result = filterPrecompressFileList(await getFileList(path))
  for (const file of result.precompressFileList) await modifyDelete(file)
  return result
}

const copyAfterEdit = async (pathFrom, pathTo, editFunc) => editFile(editFunc, pathFrom, pathTo) // TODO: DEPRECATE: use `editFile`

export {
  getFileListFromPathList,
  findPathFragList,
  withTempDirectory,
  resetDirectory,
  editFile,

  filterPrecompressFileList,
  generatePrecompressForPath, trimPrecompressForPath,

  copyAfterEdit // TODO: DEPRECATE: use `editFile`
}
