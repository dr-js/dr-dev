const { resolve } = require('path')
const { readFileSync } = require('fs')

// NOTE: hack to load ES module in sync mode
const sourceScriptString = String(readFileSync(resolve(__dirname, './source/babel.js')))
module.exports = eval([ // eslint-disable-line no-eval
  sourceScriptString.split('// HACK: @MARK_REPO_SYNC_IMPORT')[ 0 ],
  'getBabelConfig()'
].join(';\n'))

// NOTE: do not support function in config
// const { runSync } = require('@dr-js/core/library/node/run.js')
// module.exports = JSON.parse(String( // NOTE: hack to load ES module in sync mode
//   runSync([
//     process.execPath, // node
//     '--input-type=module', // https://nodejs.org/api/packages.html#packages_determining_module_system
//     '--eval',
//     `${String(readFileSync(resolve(__dirname, './source/babel.js')))}; console.log(JSON.stringify(getBabelConfig()))`
//   ], { quiet: true }).stdout
// ))
