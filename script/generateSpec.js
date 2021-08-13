import { objectSortKey } from '@dr-js/core/module/common/mutable/Object.js'
import { writeText } from '@dr-js/core/module/node/fs/File.js'
import { loadPackageCombo } from '@dr-js/core/module/node/module/PackageJSON.js'
import { runKit } from '@dr-js/core/module/node/kit.js'

import { collectSourceJsRouteMap } from 'source/node/export/parsePreset.js'
import { generateExportInfo } from 'source/node/export/generate.js'
import { getMarkdownFileLink, renderMarkdownAutoAppendHeaderLink, renderMarkdownBlockQuote, renderMarkdownTable, renderMarkdownExportPath } from 'source/node/export/renderMarkdown.js'

import { formatUsage } from 'source-bin/option.js'

runKit(async (kit) => {
  kit.padLog('generate exportInfoMap')
  const sourceRouteMap = await collectSourceJsRouteMap({ pathRootList: [ kit.fromRoot('source') ], kit })
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  kit.padLog('collect dependencyMap')
  const { dependencyMap } = await loadPackageCombo(kit.fromRoot('resource'))

  kit.padLog('output: SPEC.md')
  await writeText(kit.fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...renderMarkdownAutoAppendHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: kit.fromRoot() }),
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
        cellRowList: Object.entries(objectSortKey(dependencyMap))
      })
    ),
    ''
  ].join('\n'))
}, { title: 'generate-spec' })
