const BABEL_ENV = process.env.BABEL_ENV || ''
const isDev = BABEL_ENV.includes('dev')
const isModule = BABEL_ENV.includes('module')
const isOutputBin = BABEL_ENV.includes('outputBin') // map `source/*` to `../library/*` for `source-bin` in output

module.exports = {
  presets: [
    [ '@babel/env', { targets: { node: '12' }, modules: isModule ? false : 'commonjs' } ]
  ],
  plugins: [
    [ 'minify-replace', {
      replacements: [ { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value: isDev } } ]
    } ],
    [ 'module-resolver', {
      root: [ './' ],
      alias: isModule ? undefined : [
        isOutputBin && { '^source/(.+)': './library/\\1' }, // when build bin to output
        { '^@dr-js/([\\w-]+)/module/(.+)': '@dr-js/\\1/library/\\2' }
      ].filter(Boolean)
    } ]
  ],
  comments: false
}
