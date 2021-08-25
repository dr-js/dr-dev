import { catchAsync } from '@dr-js/core/module/common/error.js'
import { run } from '@dr-js/core/module/node/run.js'
import {
  verify,
  runDocker, runDockerSync,
  runDockerStdout,
  runCompose, runComposeSync
} from '@dr-js/core/module/node/module/Software/docker.js'
import { runWithTee } from './node/run.js'

const runDockerWithTee = async (argList = [], option = {}, teeLogFile) => runWithTee([ ...verify(), ...argList ], option, teeLogFile)

const checkLocalImage = async (imageRepo, imageTag) => {
  const stdoutString = String(await runDockerStdout([ 'image', 'ls', `${imageRepo}:${imageTag}` ]))
  return stdoutString.includes(imageRepo) && stdoutString.includes(imageTag)
}
const pullImage = async (imageRepo, imageTag) => runDockerStdout([ 'pull', `${imageRepo}:${imageTag}` ])

const checkPullImage = async (imageRepo, imageTag) => {
  if (await checkLocalImage(imageRepo, imageTag)) return true
  await catchAsync(pullImage, imageRepo, imageTag) // try pull remote
  return checkLocalImage(imageRepo, imageTag) // check local again
}

const getContainerLsList = async (isListAll = false) => String(await runDockerStdout([ 'container', 'ls',
  '--format', '{{.ID}}|{{.Image}}|{{.Names}}',
  isListAll && '--all'
].filter(Boolean))).trim().split('\n').filter(Boolean).map((string) => {
  const [ id, image, names ] = string.split('|')
  return { id, image, names }
})

const patchContainerLsListStartedAt = async (
  containerLsList = [] // will mutate and added `startedAt: Date` to containerLsList
) => {
  const idList = containerLsList.map(({ id }) => id)
  String(await runDockerStdout([ 'container', 'inspect',
    '--format', '{{.Id}}|{{.State.StartedAt}}', // https://unix.stackexchange.com/questions/492279/convert-docker-container-dates-to-milliseconds-since-epoch/492291#492291
    ...idList
  ])).trim().split('\n').filter(Boolean).forEach((string) => {
    const [ id, startedAtString ] = string.split('|') // the full id & ISO time string
    const item = containerLsList[ idList.findIndex((v) => id.startsWith(v)) ]
    if (item) item.startedAt = new Date(startedAtString)
  })
}

const matchContainerLsList = (
  containerLsList = [], // will mutate and added `pid: Number` to containerLsList
  processList = [] // from `await getProcessListAsync()`
) => {
  containerLsList.forEach((item) => {
    item.pid = (processList.find(({ command }) => command.includes(item.id)) || {}).pid // NOTE: this pid is host pid, not the pid in container
  })
}

/** @deprecated */ const docker = runDocker // TODO: DEPRECATE
/** @deprecated */ const dockerSync = runDockerSync // TODO: DEPRECATE
/** @deprecated */ const compose = runCompose // TODO: DEPRECATE
/** @deprecated */ const composeSync = runComposeSync // TODO: DEPRECATE
/** @deprecated */ const dockerWithTee = runDockerWithTee // TODO: DEPRECATE
/** @deprecated */ const checkImageExist = checkPullImage // TODO: DEPRECATE
/** @deprecated */ const getContainerPsList = getContainerLsList // TODO: DEPRECATE
/** @deprecated */ const matchContainerPsList = matchContainerLsList // TODO: DEPRECATE
/** @deprecated */ const runDockerLegacy = (argList = [], option = {}, teeLogFile) => (teeLogFile ? runWithTee : run)( // TODO: DEPRECATE: bad design, await is SOMETIMES needed
  [ ...verify(), ...argList ],
  option,
  teeLogFile
)

export {
  runDockerWithTee,

  checkLocalImage, pullImage, checkPullImage,
  getContainerLsList, patchContainerLsListStartedAt, matchContainerLsList,

  docker, dockerSync, // TODO: DEPRECATE
  compose, composeSync, // TODO: DEPRECATE
  dockerWithTee, // TODO: DEPRECATE
  checkImageExist, // TODO: DEPRECATE
  getContainerPsList, matchContainerPsList, // TODO: DEPRECATE
  runDockerLegacy as runDocker // TODO: DEPRECATE: bad design, await is SOMETIMES needed
}
