import { findPathFragList } from '@dr-js/dev/module/node/file'

import { loadAndCopyPackExportInitJSON } from '../function'

const doInit = async ({
  pathOutput,
  pathResourcePackage,
  isReset = false
}) => {
  const pathPackage = ( // find resource package pack export
    await findPathFragList(pathResourcePackage, [ 'node_modules', '@dr-js', /^dev-[\w-]+/ ]) ||
    await findPathFragList(pathResourcePackage, [ '@dr-js', /^dev-[\w-]+/ ]) ||
    pathResourcePackage
  )
  console.log(`[init] pathPackage: ${pathPackage}`)

  await loadAndCopyPackExportInitJSON(pathPackage, pathOutput, isReset)
}

export { doInit }
