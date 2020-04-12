const { getBabelConfig } = require('@dr-js/dev/library/babel')

module.exports = getBabelConfig({
  extraPresetList: [
    [ '@babel/react' ]
  ],
  extraPluginList: [
    [ 'babel-plugin-styled-components' ]
  ]
})
