import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { collectSourceRouteMap } from 'source/node/export/parse'
import { generateExportInfo } from 'source/node/export/generate'
import { getMarkdownFileLink, renderMarkdownAutoAppendHeaderLink, renderMarkdownBlockQuote, renderMarkdownTable, renderMarkdownExportPath } from 'source/node/export/renderMarkdown'
import { runMain } from 'source/main'

import { formatUsage } from 'source-bin/option'
import { collectDependency } from 'source-bin/checkOutdated/collectDependency'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

runMain(async (logger) => {
  logger.log(`collect dependencyMap`)
  const { dependencyMap } = await collectDependency(fromRoot('resource'))

  logger.log(`generate exportInfoMap`)
  const sourceRouteMap = await collectSourceRouteMap({ pathRootList: [ fromRoot('source') ], logger })
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log(`output: SPEC.md`)
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...renderMarkdownAutoAppendHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT }),
      '',
      '#### Bin Option Format',
      getMarkdownFileLink('source-bin/option.js'),
      ...renderMarkdownBlockQuote(formatUsage()),
      '',
      '#### Resource package',
      getMarkdownFileLink('resource/'),
      ...renderMarkdownTable({
        headerRow: [ 'Package name', 'Version' ],
        padFuncList: [ 'L', 'R' ],
        cellRowList: Object.entries(dependencyMap)
      })
    ),
    ''
  ].join('\n'))
}, 'generate-spec')
