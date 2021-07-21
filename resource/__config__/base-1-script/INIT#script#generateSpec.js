import { collectSourceJsRouteMap } from '@dr-js/dev/module/node/export/parsePreset.js'
import { generateExportInfo } from '@dr-js/dev/module/node/export/generate.js'
import { /* getMarkdownFileLink, renderMarkdownBlockQuote, */ renderMarkdownAutoAppendHeaderLink, renderMarkdownExportPath } from '@dr-js/dev/module/node/export/renderMarkdown.js'
import { runMain, commonCombo, writeFileSync } from '@dr-js/dev/module/main.js'

// import { formatUsage } from 'source-bin/option.js'

runMain(async (logger) => {
  const { fromRoot } = commonCombo(logger)

  logger.padLog('generate exportInfoMap')
  const sourceRouteMap = await collectSourceJsRouteMap({ pathRootList: [ fromRoot('source') ], logger })
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.padLog('output: SPEC.md')
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...renderMarkdownAutoAppendHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: fromRoot() })
      // '',
      // '#### Bin Option Format',
      // getMarkdownFileLink('source-bin/option.js'),
      // ...renderMarkdownBlockQuote(formatUsage())
    ),
    ''
  ].join('\n'))
}, 'generate-spec')
