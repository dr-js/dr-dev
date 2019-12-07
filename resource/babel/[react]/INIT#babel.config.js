const { getBabelConfig } = require('@dr-js/dev/library/babel')

module.exports = getBabelConfig({
  presetExtra: [
    [ '@babel/react' ]
  ]
})
