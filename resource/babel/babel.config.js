const BABEL_ENV = process.env.BABEL_ENV || ''
const isDev = BABEL_ENV.includes('dev')
const isModule = BABEL_ENV.includes('module')

module.exports = {
  presets: [
    [ '@babel/env', {
      targets: isDev ? { node: '10' } : {},
      forceAllTransforms: !isDev,
      modules: isModule ? false : 'commonjs'
    } ]
  ],
  plugins: [
    !isModule && [ '@babel/proposal-object-rest-spread', { loose: true, useBuiltIns: true } ], // NOTE: for Edge(17.17134) support check: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#Spread_in_object_literals
    [ 'minify-replace', { replacements: [ { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value: isDev } } ] } ],
    [ 'module-resolver', {
      root: [ './' ],
      alias: isModule ? undefined : { '^dr-([\\w-]+)/module/(.+)': 'dr-\\1/library/\\2' }
    } ]
  ].filter(Boolean),
  comments: false
}
