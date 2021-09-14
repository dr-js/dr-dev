import { indentLineList } from '@dr-js/core/module/common/string.js'
import { expandHome } from '@dr-js/core/module/node/fs/Path.js'
import { modifyDeleteForce } from '@dr-js/core/module/node/fs/Modify.js'

import { checksumUpdate, checksumDetectChange } from 'source/node/cache/checksum.js'
import { staleCheckSetup, staleCheckMark, staleCheckCalcReport, describeStaleReport } from 'source/node/cache/staleCheck.js'

const doCacheStep = async ({
  cacheStepType, prunePolicyType,
  pathStatFile,
  pathChecksumList, pathChecksumFile,
  pathStaleCheckList, pathStaleCheckFile, maxStaleDay
}) => {
  console.log(`[cache-step] cacheStepType: ${cacheStepType}`)

  const config = {
    pathStatFile,
    pathChecksumList, pathChecksumFile,
    pathStaleCheckList: pathStaleCheckList && pathStaleCheckList.map((v) => expandHome(v)),
    pathStaleCheckFile: pathStaleCheckFile && expandHome(pathStaleCheckFile),
    maxStaleDay
  }

  switch (cacheStepType) {
    case 'setup': { // run before cache load
      const { checksumHash } = await checksumUpdate(config) // run early to generate checksum-file for CI cache key
      await staleCheckSetup(config)
      console.log(`[cache-step] checksumHash: ${checksumHash}`)
      break
    }
    case 'mark': { // run after cache load, before actual build/test
      await staleCheckMark(config)
      break
    }
    case 'prune': { // run after actual build/test, before cache save
      console.log(`[cache-step] prunePolicyType: ${prunePolicyType}`)
      const { checksumHash, isHashChanged } = await checksumDetectChange(config)
      console.log(`[cache-step] checksumHash: ${checksumHash}, isHashChanged: ${isHashChanged}`)
      if (prunePolicyType !== 'debug' && !isHashChanged) console.log('[cache-step] no cache hash change, skip prune')
      else { // try prune cache before save back
        const { report } = await staleCheckCalcReport(config)
        console.log(`[cache-step] report:\n${describeStaleReport(report)}`)
        switch (prunePolicyType) {
          case 'debug': // just log, no cache change
            console.log('[cache-step] debug report:', JSON.stringify(report, null, 2))
            break
          case 'stale-only':
            console.log(`[cache-step] stale file:\n${indentLineList(report.staleList, '  - ')}`)
            for (const path of report.staleList) await modifyDeleteForce(path)
            console.log(`[cache-step] done prune ${report.staleList.length} file from staleList`)
            break
          case 'unused':
            console.log(`[cache-step] stale file:\n${indentLineList(report.staleList, '  - ')}`)
            for (const path of report.staleList) await modifyDeleteForce(path)
            console.log(`[cache-step] pend file:\n${indentLineList(report.pendList, '  - ')}`)
            for (const path of report.pendList) await modifyDeleteForce(path)
            console.log(`[cache-step] done prune ${report.staleList.length + report.pendList.length} file from staleList & pendList`)
            break
        }
      }
      break
    }
    case 'is-hash-changed':
    case 'IHC': { // allow repeatable shell check before the actual prune
      const { checksumHash, isHashChanged } = await checksumDetectChange(config, 'skip-save')
      console.log(`[cache-step] checksumHash: ${checksumHash}, isHashChanged: ${isHashChanged}`)
      process.exitCode = isHashChanged ? 0 : 1 // will exit with 0 if hash changed, same as shell `true`, and 1 for no change or `false`
      break
    }
    case 'checksum-file-only':
    case 'CFO': { // only write the checksum file
      const { checksumHash } = await checksumUpdate(config, 'checksum-file-only')
      console.log(`[cache-step] checksumHash: ${checksumHash}`)
      break
    }
  }
}

export { doCacheStep }
