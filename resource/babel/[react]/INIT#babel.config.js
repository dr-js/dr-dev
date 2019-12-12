const { getBabelConfig } = require('@dr-js/dev/library/babel')

module.exports = getBabelConfig({
  extraPresetList: [
    [ '@babel/react' ]
  ]
})
