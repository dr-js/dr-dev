import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { indentLine } from 'dr-js/module/common/string'

import { runMain } from 'source/main'
import { getLogger } from 'source/logger'
import { collectSourceRouteMap } from 'source/ExportIndex/parseExport'
import { generateExportInfo } from 'source/ExportIndex/generateInfo'
import { autoAppendMarkdownHeaderLink, renderMarkdownFileLink, renderMarkdownExportPath } from 'source/ExportIndex/renderMarkdown'

import { formatUsage } from 'source-bin/option'
import { collectDependency } from 'source-bin/checkOutdated/collectDependency'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const renderMarkdownBinOptionFormat = () => [
  renderMarkdownFileLink('source-bin/option.js'),
  '> ```',
  indentLine(formatUsage(), '> '),
  '> ```'
]

const renderMarkdownResourcePackage = async () => {
  const { dependencyMap } = await collectDependency(fromRoot('resource'))
  return [
    renderMarkdownFileLink('resource/'),
    '<table>',
    ...Object.entries(dependencyMap).map(
      ([ name, version ]) => `<tr><td>${name}</td><td>${version}</td></tr>`
    ),
    '</table>'
  ]
}

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
      '',
      '#### Bin Option Format',
      ...renderMarkdownBinOptionFormat(),
      '',
      '#### Resource package',
      ...await renderMarkdownResourcePackage()
    ),
    ''
  ].join('\n'))
}, getLogger('generate-spec'))
