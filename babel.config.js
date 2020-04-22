const BABEL_ENV = process.env.BABEL_ENV || ''
const isDev = BABEL_ENV.includes('dev')
const isModule = BABEL_ENV.includes('module')
const isUseSource = BABEL_ENV.includes('use-source')

module.exports = {
  presets: [
    [ '@babel/env', { targets: { node: '10' }, modules: isModule ? false : 'commonjs' } ]
  ],
  plugins: [
    [ 'minify-replace', {
      replacements: [ { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value: isDev } } ]
    } ],
    [ 'module-resolver', {
      root: [ './' ],
      alias: isModule ? undefined : [
        {
          '^@dr-js/dev/module/(.+)': isUseSource
            ? './source/\\1' // when direct use/test `./source-bin` with `@babel/register`
            : './library/\\1' // when build to output
        },
        { '^@dr-js/([\\w-]+)/module/(.+)': '@dr-js/\\1/library/\\2' }
      ]
    } ]
  ],
  comments: false
}
