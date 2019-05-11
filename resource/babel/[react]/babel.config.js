const { getBabelConfig } = require('dr-dev/library/babel')

module.exports = getBabelConfig({
  presetExtra: [
    [ '@babel/react' ]
  ]
})
