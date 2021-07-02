import { catchAsync } from '@dr-js/core/module/common/error.js'
import { run } from '@dr-js/core/module/node/run.js'
import { verify, runDocker } from '@dr-js/core/module/node/module/Software/docker.js'
import { runWithTee } from './node/run.js'

const runDockerWithTee = async (argList = [], option = {}, teeLogFile) => runWithTee([ ...verify(), ...argList ], option, teeLogFile)

const checkLocalImage = async (imageRepo, imageTag) => {
  const { promise, stdoutPromise } = runDocker([ 'image', 'ls', `${imageRepo}:${imageTag}` ], { quiet: true })
  await promise
  const stdoutString = String(await stdoutPromise)
  return stdoutString.includes(imageRepo) && stdoutString.includes(imageTag)
}
const pullImage = async (imageRepo, imageTag) => {
  const { promise } = runDocker([ 'pull', `${imageRepo}:${imageTag}` ], { quiet: true })
  await promise
}

const checkPullImage = async (imageRepo, imageTag) => {
  if (await checkLocalImage(imageRepo, imageTag)) return true
  await catchAsync(pullImage, imageRepo, imageTag) // try pull remote
  return checkLocalImage(imageRepo, imageTag) // check local again
}

const getContainerLsList = async (isListAll = false) => {
  const { promise, stdoutPromise } = runDocker([ 'container', 'ls',
    '--format', '{{.ID}}|{{.Image}}|{{.Names}}',
    isListAll && '--all'
  ].filter(Boolean), { quiet: true })
  await promise
  return String(await stdoutPromise).trim().split('\n')
    .filter(Boolean)
    .map((string) => {
      const [ id, image, names ] = string.split('|')
      return { id, image, names }
    })
}

const patchContainerLsListStartedAt = async (
  containerLsList = [] // will mutate and added `startedAt: Date` to containerLsList
) => {
  const idList = containerLsList.map(({ id }) => id)
  const { promise, stdoutPromise } = runDocker([ 'container', 'inspect',
    '--format', '{{.Id}}|{{.State.StartedAt}}', // https://unix.stackexchange.com/questions/492279/convert-docker-container-dates-to-milliseconds-since-epoch/492291#492291
    ...idList
  ], { quiet: true })
  await promise
  String(await stdoutPromise).trim().split('\n')
    .filter(Boolean)
    .forEach((string) => {
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

const runDockerLegacy = (argList = [], option = {}, teeLogFile) => (teeLogFile ? runWithTee : run)( // TODO: DEPRECATE: bad design, await is SOMETIMES needed
  [ ...verify(), ...argList ],
  option,
  teeLogFile
)

export {
  runDockerWithTee,

  checkLocalImage, pullImage, checkPullImage,
  getContainerLsList, patchContainerLsListStartedAt, matchContainerLsList,

  runDockerWithTee as dockerWithTee, // TODO: DEPRECATE
  checkPullImage as checkImageExist, // TODO: DEPRECATE
  getContainerLsList as getContainerPsList, matchContainerLsList as matchContainerPsList, // TODO: DEPRECATE
  runDockerLegacy as runDocker // TODO: DEPRECATE: bad design, await is SOMETIMES needed
}

export {
  runDocker as docker, runDockerSync as dockerSync, // TODO: DEPRECATE
  runCompose as compose, runComposeSync as composeSync // TODO: DEPRECATE
} from '@dr-js/core/module/node/module/Software/docker.js'
