import { relative } from 'path'
import { padTable } from 'dr-js/module/common/format'
import { indentLine } from 'dr-js/module/common/string'
import { toPosixPath } from 'dr-js/module/node/file/Path'
import { HOIST_LIST_KEY, EXPORT_LIST_KEY, EXPORT_HOIST_LIST_KEY } from './generate'

// check: https://gist.github.com/asabaylus/3071099
// [Export Path](#export-path)
// [Bin Option Format](#bin-option-format)
// [Strange   Format](#strange---format)
// [Strange , , Format ALT](#strange---format-alt)
const getMarkdownHeaderLink = (
  text,
  link = text.trim().toLowerCase()
    .replace(/[^\w\- ]+/g, '')
    .replace(/\s/g, '-')
    .replace(/-+$/, '')
) => `[${text}](#${link})`

const REGEXP_MARKDOWN_HEADER = /^#{1,6}(.+?)#*$/gm // TODO: will mis-match comment in bash, use `marked`?
const matchMarkdownHeader = (string) => {
  const headerTextList = []
  let result
  while ((result = REGEXP_MARKDOWN_HEADER.exec(string))) {
    const headerText = result[ 1 ].trim()
    headerText && headerTextList.push(headerText)
  }
  return headerTextList
}
const renderMarkdownAutoAppendHeaderLink = (...markdownStringList) => {
  const headerTextList = matchMarkdownHeader(markdownStringList.join('\n'))
  return headerTextList.length ? [
    ...headerTextList.map((text) => `* ${getMarkdownHeaderLink(text)}`),
    '',
    ...markdownStringList
  ] : []
}

const escapeMarkdownLink = (name) => name.replace(/_/g, '\\_')
const getMarkdownFileLink = (path) => `📄 [${escapeMarkdownLink(path)}](${path})`
const getMarkdownDirectoryLink = (path) => `📁 [${escapeMarkdownLink(path).replace(/\/*$/, '/')}](${path})`

const renderMarkdownBlockQuote = (text) => [
  '> ```',
  indentLine(text, '> '),
  '> ```'
]

const renderMarkdownTable = ({
  headerRow = [],
  cellRowList = [],
  padFuncList = [],
  table = [
    headerRow,
    headerRow.map((_, index) => {
      const pad = padFuncList[ index ]
      return pad === 'L' ? ':----' : pad === 'R' ? '----:' : ':---:'
    }),
    ...cellRowList
  ]
}) => [
  '', // add empty line '' for better parser support
  ...padTable({ table, padFuncList, cellPad: ' | ', rowPad: '\n' }).split('\n')
    .map((text) => `| ${text} |`)
]

const renderMarkdownExportPath = ({ exportInfoMap, rootPath }) => Object.entries(exportInfoMap)
  .reduce((textList, [ path, value ]) => {
    value[ EXPORT_LIST_KEY ] && textList.push(
      `+ ${getMarkdownFileLink(`${toPosixPath(relative(rootPath, path))}.js`)}`,
      `  - ${value[ EXPORT_LIST_KEY ].map((text) => `\`${text}\``).join(', ')}`
    )
    return textList
  }, [])

const renderMarkdownExportTree = ({ exportInfo, routeList }) => Object.entries(exportInfo)
  .reduce((textList, [ key, value ]) => {
    if (key === HOIST_LIST_KEY) {
      // skip
    } else if (key === EXPORT_LIST_KEY || key === EXPORT_HOIST_LIST_KEY) {
      textList.push(`- ${value.map((text) => `\`${text}\``).join(', ')}`)
    } else {
      const childTextList = renderMarkdownExportTree({ exportInfo: value, routeList: [ ...routeList, key ] })
      childTextList.length && textList.push(`- **${key}**`, ...childTextList.map((text) => `  ${text}`))
    }
    return textList
  }, [])

export { // TODO: NOTE: all func name like `renderMarkdown*` should return Array, others should return String
  getMarkdownHeaderLink,
  escapeMarkdownLink,
  getMarkdownFileLink, getMarkdownDirectoryLink,

  renderMarkdownAutoAppendHeaderLink,
  renderMarkdownBlockQuote,
  renderMarkdownTable,
  renderMarkdownExportPath,
  renderMarkdownExportTree
}
