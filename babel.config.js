const { resolve } = require('path')
const { readFileSync } = require('fs')
const { runSync } = require('@dr-js/core/library/node/run.js')

module.exports = JSON.parse(String( // NOTE: hack to load ES module in sync mode
  runSync([
    process.execPath, // node
    '--input-type=module', // https://nodejs.org/api/packages.html#packages_determining_module_system
    '--eval',
    `${String(readFileSync(resolve(__dirname, './source/babel.js')))}; console.log(JSON.stringify(getBabelConfig()))`
  ], { quiet: true, describeError: true }).stdout
))
