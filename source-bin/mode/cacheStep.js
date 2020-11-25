import { modifyDeleteForce } from '@dr-js/core/module/node/file/Modify'
import { checksumUpdate, checksumDetectChange } from '@dr-js/dev/module/node/cache/checksum'
import { staleCheckSetup, staleCheckMark, staleCheckCalcReport, describeStaleReport } from '@dr-js/dev/module/node/cache/staleCheck'

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
    pathStaleCheckList, pathStaleCheckFile, maxStaleDay
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
            for (const path of report.staleList) await modifyDeleteForce(path)
            console.log(`[cache-step] done prune ${report.staleList.length} file from staleList`)
            break
          case 'unused':
            for (const path of report.staleList) await modifyDeleteForce(path)
            for (const path of report.pendList) await modifyDeleteForce(path)
            console.log(`[cache-step] done prune ${report.staleList.length + report.pendList.length} file from staleList & pendList`)
            break
        }
      }
      break
    }
  }
}

export { doCacheStep }
