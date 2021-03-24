import { collectSourceJsRouteMap } from 'source/node/export/parsePreset'
import { generateExportInfo } from 'source/node/export/generate'
import { getMarkdownFileLink, renderMarkdownAutoAppendHeaderLink, renderMarkdownBlockQuote, renderMarkdownTable, renderMarkdownExportPath } from 'source/node/export/renderMarkdown'
import { runMain, commonCombo, writeFileSync } from 'source/main'

import { formatUsage } from 'source-bin/option'
import { collectDependency } from 'source-bin/function'

runMain(async (logger) => {
  const { fromRoot } = commonCombo(logger)

  logger.padLog('generate exportInfoMap')
  const sourceRouteMap = await collectSourceJsRouteMap({ pathRootList: [ fromRoot('source') ], logger })
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.padLog('collect dependencyMap')
  const packageInfoMap = await collectDependency(fromRoot('resource'), 'recursive')

  logger.padLog('output: SPEC.md')
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...renderMarkdownAutoAppendHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: fromRoot() }),
      '',
      '#### Bin Option Format',
      getMarkdownFileLink('source-bin/option.js'),
      ...renderMarkdownBlockQuote(formatUsage()),
      '',
      '#### Resource package',
      getMarkdownFileLink('resource/'),
      ...renderMarkdownTable({
        headerRow: [ 'Package name', '    Version' ],
        padFuncList: [ 'L', 'R' ],
        cellRowList: Object.entries(packageInfoMap).map(([ name, { version } ]) => [ name, version ])
      })
    ),
    ''
  ].join('\n'))
}, 'generate-spec')
