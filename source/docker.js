import { run, runSync } from '@dr-js/core/module/node/run'
import { verify } from '@dr-js/node/module/module/Software/docker'
import { runWithTee } from './node/run'

const docker = (argList = [], option = {}) => run(
  [ ...verify(), ...argList ],
  { describeError: !option.quiet, ...option } // describeError only when output is redirected
)
const dockerSync = (argList = [], option = {}) => runSync(
  [ ...verify(), ...argList ],
  { describeError: !option.quiet, ...option } // describeError only when output is redirected
)
const dockerWithTee = async (argList = [], option = {}, teeLogFile) => runWithTee(
  [ ...verify(), ...argList ],
  { describeError: teeLogFile || !option.quiet, ...option }, // describeError only when output is redirected
  teeLogFile
)

const checkImageExist = async (imageRepo, imageTag) => {
  { // check local
    const { promise, stdoutPromise } = docker([ 'image', 'ls', `${imageRepo}:${imageTag}` ], { quiet: true })
    await promise
    const stdoutString = String(await stdoutPromise)
    if (stdoutString.includes(imageRepo) && stdoutString.includes(imageTag)) return true
  }
  try { // check pull
    const { promise } = docker([ 'pull', `${imageRepo}:${imageTag}` ], { quiet: true })
    await promise
    { // check local again
      const { promise, stdoutPromise } = docker([ 'image', 'ls', `${imageRepo}:${imageTag}` ], { quiet: true })
      await promise
      const stdoutString = String(await stdoutPromise)
      if (stdoutString.includes(imageRepo) && stdoutString.includes(imageTag)) return true
    }
  } catch (error) {}
  return false
}

const getContainerPsList = async (isListAll = false) => {
  const { promise, stdoutPromise } = docker([ 'container', 'ps', '--format', '"{{.ID}}|{{.Image}}|{{.Names}}"', isListAll && '--all' ].filter(Boolean), { quiet: true })
  await promise
  return String(await stdoutPromise).trim().split('\n')
    .filter(Boolean)
    .map((string) => {
      const [ id, image, names ] = string.split('|')
      return { id, image, names }
    })
}

const runDocker = (argList = [], option = {}, teeLogFile) => (teeLogFile ? runWithTee : run)( // TODO: DEPRECATE: bad design, await is SOMETIMES needed
  [ ...verify(), ...argList ],
  { describeError: teeLogFile || !option.quiet, ...option }, // describeError only when output is redirected
  teeLogFile
)

export {
  docker, dockerSync, dockerWithTee,
  checkImageExist,
  getContainerPsList,

  runDocker // TODO: DEPRECATE: bad design, await is SOMETIMES needed
}
