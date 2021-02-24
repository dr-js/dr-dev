import { run } from '@dr-js/core/module/node/run'
import { verify } from '@dr-js/node/module/module/Software/docker'
import { runWithTee } from './node/run'

const runDocker = (argList = [], option = {}, teeLogFile) => (teeLogFile ? runWithTee : run)(
  [ ...verify(), ...argList ],
  { describeError: teeLogFile || !option.quiet, ...option }, // describeError only when output is redirected
  teeLogFile
)

const checkImageExist = async (imageRepo, imageTag) => {
  { // check local
    const { promise, stdoutPromise } = runDocker([ 'image', 'ls', `${imageRepo}:${imageTag}` ], { quiet: true })
    await promise
    const stdoutString = String(await stdoutPromise)
    if (stdoutString.includes(imageRepo) && stdoutString.includes(imageTag)) return true
  }
  try { // check pull
    const { promise } = runDocker([ 'pull', `${imageRepo}:${imageTag}` ], { quiet: true })
    await promise
    { // check local again
      const { promise, stdoutPromise } = runDocker([ 'image', 'ls', `${imageRepo}:${imageTag}` ], { quiet: true })
      await promise
      const stdoutString = String(await stdoutPromise)
      if (stdoutString.includes(imageRepo) && stdoutString.includes(imageTag)) return true
    }
  } catch (error) {}
  return false
}

const getContainerPsList = async (isListAll = false) => {
  const { promise, stdoutPromise } = runDocker([ 'container', 'ps', '--format', '"{{.ID}}|{{.Image}}|{{.Names}}"', isListAll && '--all' ].filter(Boolean), { quiet: true })
  await promise
  return String(await stdoutPromise).trim().split('\n')
    .filter(Boolean)
    .map((string) => {
      const [ id, image, names ] = string.split('|')
      return { id, image, names }
    })
}

export {
  runDocker,
  checkImageExist,
  getContainerPsList
}
