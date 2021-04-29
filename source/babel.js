const getBabelConfig = ({
  BABEL_ENV = process.env.BABEL_ENV || '',
  isDev = BABEL_ENV.includes('dev'),
  isModule = BABEL_ENV.includes('module'),
  isAllTransform = BABEL_ENV.includes('all-transform'), // transpile to ES5 (for max browser support, need babel-polyfill(core-js/regenerator-runtime))

  extraPresetList = [],
  extraPluginList = [],
  extraMinifyReplaceList = [],
  extraModuleResolverList = []
} = {}) => ({
  presets: [
    [ '@babel/preset-env', isAllTransform
      ? { forceAllTransforms: true, modules: 'commonjs' }
      : { targets: { node: '12' }, modules: isModule ? false : 'commonjs' }
    ],
    ...extraPresetList
  ].filter(Boolean),
  plugins: [
    ...extraPluginList,
    [ 'babel-plugin-minify-replace', {
      replacements: [
        ...extraMinifyReplaceList,
        { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value: isDev } }
      ]
    } ],
    [ 'babel-plugin-module-resolver', {
      root: [ './' ],
      alias: isModule ? undefined : [
        ...extraModuleResolverList, // higher priority
        { '^@dr-js/([\\w-]+)/module/(.+)': '@dr-js/\\1/library/\\2' }
      ]
    } ]
  ].filter(Boolean),
  comments: false
})

const getWebpackBabelConfig = ({
  isProduction,
  isAllTransform = false,

  extraPresetList = [],
  extraPluginList = []
}) => ({
  configFile: false,
  babelrc: false,
  cacheDirectory: isProduction,
  presets: [
    [ '@babel/preset-env', isProduction && isAllTransform
      ? { forceAllTransforms: true, modules: false }
      : { targets: { node: '12' }, modules: false }
    ],
    ...extraPresetList
  ].filter(Boolean),
  plugins: [
    ...extraPluginList
  ].filter(Boolean)
})

export {
  getBabelConfig,
  getWebpackBabelConfig
}
