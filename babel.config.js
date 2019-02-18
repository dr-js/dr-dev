const BABEL_ENV = process.env.BABEL_ENV || ''
const isDev = BABEL_ENV.includes('dev')
const isModule = BABEL_ENV.includes('module')

module.exports = {
  presets: [
    [ '@babel/env', { targets: { node: '8.8' }, modules: isModule ? false : 'commonjs' } ]
  ],
  plugins: [
    [ 'minify-replace', {
      replacements: [
        { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value: isDev } },
        { identifierName: '__ENV_NODE__', replacement: { type: 'booleanLiteral', value: true } }
      ]
    } ],
    [ 'module-resolver', {
      root: [ './' ],
      alias: isModule ? undefined : {
        '^dr-js/module/(.+)': 'dr-js/library/\\1',
        '^dr-dev/module/(.+)': './library/\\1' // for source-bin, when build to output
      }
    } ]
  ],
  comments: false
}
