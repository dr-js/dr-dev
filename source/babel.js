const DEFAULT_BABEL_ASSUMPTIONS = { // https://babeljs.io/docs/en/assumptions
  constantReexports: true,
  enumerableModuleMeta: true,
  ignoreFunctionLength: true,
  ignoreToPrimitiveHint: true,
  noDocumentAll: true,
  noNewArrows: true
}

const getBabelConfig = ({
  BABEL_ENV = process.env.BABEL_ENV || '',
  isDev = BABEL_ENV.includes('dev'),
  isModule = BABEL_ENV.includes('module'),
  isOutputBin = BABEL_ENV.includes('outputBin'), // map `source/*` to `../library/*` for `source-bin` in output
  isAllTransform = BABEL_ENV.includes('allTransform') || BABEL_ENV.includes('all-transform'), // transpile to ES5 (for max browser support, need babel-polyfill(core-js/regenerator-runtime))

  extraPresetList = [],
  extraPluginList = [],
  extraMinifyReplaceList = [],
  extraModuleResolverList = [],

  assumptions = DEFAULT_BABEL_ASSUMPTIONS
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
        isOutputBin && { '^source/(.+)': './library/\\1' }, // when build bin to output
        { '^@dr-js/([\\w-]+)/module/(.+)': '@dr-js/\\1/library/\\2' }
      ]
    } ]
  ].filter(Boolean),
  assumptions,
  comments: false
})

const getWebpackBabelConfig = ({
  isProduction,
  isAllTransform = false,

  extraPresetList = [],
  extraPluginList = [],

  assumptions = DEFAULT_BABEL_ASSUMPTIONS
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
  ].filter(Boolean),
  assumptions
})

export {
  getBabelConfig,
  getWebpackBabelConfig
}
