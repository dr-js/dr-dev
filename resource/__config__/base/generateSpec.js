import { resolve } from 'path'
import { writeFileSync } from 'fs'

// import { indentLine } from 'dr-js/library/common/string'

import { collectSourceRouteMap } from 'source/node/export/parse'
import { generateExportInfo } from 'source/node/export/generate'
import {
  autoAppendMarkdownHeaderLink,
  // renderMarkdownFileLink,
  renderMarkdownExportPath
} from 'source/node/export/renderMarkdown'
import { runMain } from 'source/main'

// import { formatUsage } from 'source-bin/option'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

// const renderMarkdownBinOptionFormat = () => [
//   renderMarkdownFileLink('source-server/option.js'),
//   '> ```',
//   indentLine(formatUsage(), '> '),
//   '> ```'
// ]

runMain(async (logger) => {
  logger.log(`collect sourceRouteMap`)
  const sourceRouteMap = await collectSourceRouteMap({ pathRootList: [ fromRoot('source') ], logger })

  logger.log(`generate exportInfo`)
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log(`output: SPEC.md`)
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...autoAppendMarkdownHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT }),
      ''
      // '#### Bin Option Format',
      // ...renderMarkdownBinOptionFormat()
    ),
    ''
  ].join('\n'))
}, 'generate-export')
