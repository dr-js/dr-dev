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
    [ '@babel/env', isAllTransform
      ? { forceAllTransforms: true, modules: 'commonjs', loose: true }
      : { targets: { node: '10' }, modules: isModule ? false : 'commonjs' }
    ],
    ...extraPresetList
  ].filter(Boolean),
  plugins: [
    ...extraPluginList,
    [ '@babel/proposal-class-properties', { loose: true } ],
    !isModule && [ '@babel/proposal-object-rest-spread', { loose: true, useBuiltIns: true } ], // NOTE: for Edge(17.17134) support check: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#Spread_in_object_literals
    [ 'minify-replace', {
      replacements: [
        ...extraMinifyReplaceList,
        { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value: isDev } }
      ]
    } ],
    [ 'module-resolver', {
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
    [ '@babel/env', isProduction && isAllTransform
      ? { forceAllTransforms: true, modules: false, loose: true }
      : { targets: { node: '10' }, modules: false }
    ],
    ...extraPresetList
  ].filter(Boolean),
  plugins: [
    [ '@babel/proposal-class-properties', { loose: true } ],
    isProduction && [ '@babel/proposal-object-rest-spread', { loose: true, useBuiltIns: true } ], // NOTE: for Edge(17.17134) support check: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#Spread_in_object_literals
    ...extraPluginList
  ].filter(Boolean)
})

export {
  getBabelConfig,
  getWebpackBabelConfig
}
