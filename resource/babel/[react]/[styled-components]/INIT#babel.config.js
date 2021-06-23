const { getBabelConfig } = require('@dr-js/dev/library/babel.js')

module.exports = getBabelConfig({
  extraPresetList: [
    [ '@babel/preset-react', { runtime: 'automatic' } ] // TODO: later remove at `babel@8`: https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#manual-babel-setup
  ],
  extraPluginList: [
    [ 'babel-plugin-styled-components' ]
  ]
})
