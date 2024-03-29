// UPDATE: https://github.com/standard/eslint-config-standard/compare/v16.0.2...v17.0.0#diff-6884918dc8291219be508e05e28965b958c734def85324f3b53858ea4702090f
// UPDATE: edit: ban default export
// UPDATE: https://github.com/standard/eslint-config-standard/compare/v14.1.1...v16.0.2#diff-31af7bef8291401346dd22af1e7c0ab20be3d024fb0104cfc82182bee0e73d99
// UPDATE: https://github.com/standard/eslint-config-standard/compare/v13.0.1...v14.1.1#diff-1761f4f4ee815f0c4156b931d737ff32
// EDIT: from https://github.com/standard/eslint-config-standard/blob/v13.0.1/eslintrc.json

module.exports = {
  ignorePatterns: [
    '!.*', 'node_modules', // EDIT: https://github.com/eslint/eslint/issues/10341#issuecomment-468548031
    '**/*.ts' // EDIT: ignore ".ts" files (need "@typescript-eslint/parser")
  ],

  parserOptions: {
    ecmaVersion: 'latest', // EDIT
    ecmaFeatures: { jsx: true },
    sourceType: 'module'
  },

  env: { es6: true, es2021: true, node: true },

  plugins: [ 'eslint-plugin-import', 'eslint-plugin-n', 'eslint-plugin-promise' ], // EDIT

  globals: { globalThis: 'readonly', global: 'readonly', window: 'readonly', self: 'readonly', __DEV__: 'readonly' }, // globals: { document: 'readonly', navigator: 'readonly', window: 'readonly' }, // EDIT

  rules: {
    'no-var': 'warn',
    'object-shorthand': [ 'warn', 'properties' ],
    'accessor-pairs': [ 'error', { setWithoutGet: true, enforceForClassMembers: true } ],
    'array-bracket-spacing': [ 'error', 'always' ], // 'array-bracket-spacing': [ 'error', 'never' ], // EDIT
    'array-callback-return': [ 'error', { allowImplicit: false, checkForEach: false } ],
    'arrow-spacing': [ 'error', { before: true, after: true } ],
    'block-spacing': [ 'error', 'always' ],
    'brace-style': [ 'error', '1tbs', { allowSingleLine: true } ],
    'camelcase': [ 'error', { allow: [ '^UNSAFE_' ], properties: 'never', ignoreGlobals: true } ],
    'comma-dangle': [ 'error', { arrays: 'never', objects: 'never', imports: 'never', exports: 'never', functions: 'never' } ],
    'comma-spacing': [ 'error', { before: false, after: true } ],
    'comma-style': [ 'error', 'last' ],
    'computed-property-spacing': [ 'error', 'always', { enforceForClassMembers: true } ], // 'computed-property-spacing': [ 'error', 'never', { enforceForClassMembers: true } ], // EDIT
    'constructor-super': 'error',
    'curly': [ 'error', 'multi-line' ],
    'default-case-last': 'error',
    'dot-location': [ 'error', 'property' ],
    // 'dot-notation': [ 'error', { allowKeywords: true } ], // EDIT
    'eol-last': 'error',
    'eqeqeq': [ 'error', 'always', { null: 'ignore' } ],
    'func-call-spacing': [ 'error', 'never' ],
    'generator-star-spacing': [ 'error', { before: true, after: true } ],
    'indent': [ 'error', 2, {
      SwitchCase: 1,
      VariableDeclarator: 1,
      outerIIFEBody: 1,
      MemberExpression: 1,
      FunctionDeclaration: { parameters: 1, body: 1 },
      FunctionExpression: { parameters: 1, body: 1 },
      CallExpression: { arguments: 1 },
      ArrayExpression: 1,
      ObjectExpression: 1,
      ImportDeclaration: 1,
      flatTernaryExpressions: false,
      ignoreComments: false,
      ignoredNodes: [ 'TemplateLiteral *', 'JSXElement', 'JSXElement > *', 'JSXAttribute', 'JSXIdentifier', 'JSXNamespacedName', 'JSXMemberExpression', 'JSXSpreadAttribute', 'JSXExpressionContainer', 'JSXOpeningElement', 'JSXClosingElement', 'JSXFragment', 'JSXOpeningFragment', 'JSXClosingFragment', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild' ],
      offsetTernaryExpressions: false // offsetTernaryExpressions: true // EDIT
    } ],
    'key-spacing': [ 'error', { beforeColon: false, afterColon: true } ],
    'keyword-spacing': [ 'error', { before: true, after: true } ],
    'lines-between-class-members': [ 'error', 'always', { exceptAfterSingleLine: true } ],
    // 'multiline-ternary': [ 'error', 'always-multiline' ], // EDIT
    'new-cap': [ 'error', { newIsCap: true, capIsNew: false, properties: true } ],
    'new-parens': 'error',
    'no-array-constructor': 'error',
    'no-async-promise-executor': 'error',
    'no-caller': 'error',
    'no-case-declarations': 'error',
    'no-class-assign': 'error',
    'no-compare-neg-zero': 'error',
    'no-cond-assign': 'error',
    'no-const-assign': 'error',
    'no-constant-condition': [ 'error', { checkLoops: false } ],
    'no-control-regex': 'error',
    'no-debugger': 'error',
    'no-delete-var': 'error',
    'no-dupe-args': 'error',
    'no-dupe-class-members': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-useless-backreference': 'error',
    'no-empty': [ 'error', { allowEmptyCatch: true } ],
    'no-empty-character-class': 'error',
    'no-empty-pattern': 'error',
    'no-eval': 'error',
    'no-ex-assign': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-boolean-cast': 'error',
    'no-extra-parens': [ 'error', 'functions' ],
    'no-fallthrough': 'error',
    'no-floating-decimal': 'error',
    'no-func-assign': 'error',
    'no-global-assign': 'error',
    'no-implied-eval': 'error',
    'no-import-assign': 'error',
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': 'error',
    'no-iterator': 'error',
    'no-labels': [ 'error', { allowLoop: false, allowSwitch: false } ],
    'no-lone-blocks': 'error',
    'no-loss-of-precision': 'error',
    'no-misleading-character-class': 'error',
    'no-prototype-builtins': 'error',
    'no-useless-catch': 'error',
    'no-mixed-operators': [ 'error', {
      groups: [ [ '==', '!=', '===', '!==', '>', '>=', '<', '<=' ], [ '&&', '||' ], [ 'in', 'instanceof' ] ],
      allowSamePrecedence: true
    } ],
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-multiple-empty-lines': [ 'error', { max: 1, maxEOF: 0 } ],
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-object': 'error',
    'no-new-symbol': 'error',
    'no-new-wrappers': 'error',
    'no-obj-calls': 'error',
    'no-octal': 'error',
    'no-octal-escape': 'error',
    'no-proto': 'error',
    'no-redeclare': [ 'error', { builtinGlobals: false } ],
    'no-regex-spaces': 'error',
    'no-return-assign': [ 'error', 'except-parens' ],
    'no-self-assign': [ 'error', { props: true } ],
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-shadow-restricted-names': 'error',
    'no-sparse-arrays': 'error',
    'no-tabs': 'error',
    'no-template-curly-in-string': 'error',
    'no-this-before-super': 'error',
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    'no-undef-init': 'error',
    'no-unexpected-multiline': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unneeded-ternary': [ 'error', { defaultAssignment: false } ],
    'no-unreachable': 'error',
    'no-unreachable-loop': 'error',
    'no-unsafe-finally': 'error',
    'no-unsafe-negation': 'error',
    'no-unused-expressions': [ 'error', { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true } ],
    'no-unused-vars': [ 'error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true, vars: 'all' } ],
    'no-use-before-define': [ 'error', { functions: false, classes: false, variables: false } ],
    'no-useless-call': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-constructor': 'error',
    'no-useless-escape': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    'no-whitespace-before-property': 'error',
    'no-with': 'error',
    'object-curly-newline': [ 'error', { multiline: true, consistent: true } ],
    'object-curly-spacing': [ 'error', 'always' ],
    // 'object-property-newline': [ 'error', { allowMultiplePropertiesPerLine: true } ], // EDIT
    'one-var': [ 'error', { initialized: 'never' } ],
    'operator-linebreak': [ 'error', 'after', { overrides: { '?': 'before', ':': 'before', '|>': 'before' } } ],
    'padded-blocks': [ 'error', { blocks: 'never', switches: 'never', classes: 'never' } ],
    'prefer-const': [ 'error', { destructuring: 'all' } ],
    'prefer-promise-reject-errors': 'error',
    'prefer-regex-literals': [ 'error', { disallowRedundantWrapping: true } ],
    'quote-props': [ 'error', 'as-needed', { unnecessary: false } ], // 'quote-props': [ 'error', 'as-needed' ], // EDIT
    'quotes': [ 'error', 'single', { avoidEscape: true, allowTemplateLiterals: false } ],
    'rest-spread-spacing': [ 'error', 'never' ],
    'semi': [ 'error', 'never' ],
    'semi-spacing': [ 'error', { before: false, after: true } ],
    'space-before-blocks': [ 'error', 'always' ],
    'space-before-function-paren': [ 'error', 'always' ],
    'space-in-parens': [ 'error', 'never' ],
    'space-infix-ops': 'error',
    'space-unary-ops': [ 'error', { words: true, nonwords: false } ],
    'spaced-comment': [ 'error', 'always', {
      line: { markers: [ '*package', '!', '/', ',', '=' ] },
      block: { balanced: true, markers: [ '*package', '!', ',', ':', '::', 'flow-include' ], exceptions: [ '*' ] }
    } ],
    'symbol-description': 'error',
    'template-curly-spacing': [ 'error', 'never' ],
    'template-tag-spacing': [ 'error', 'never' ],
    'unicode-bom': [ 'error', 'never' ],
    'use-isnan': [ 'error', { enforceForSwitchCase: true, enforceForIndexOf: true } ],
    'valid-typeof': [ 'error', { requireStringLiterals: true } ],
    'wrap-iife': [ 'error', 'any', { functionPrototypeMethods: true } ],
    'yield-star-spacing': [ 'error', 'both' ],
    'yoda': [ 'error', 'never' ],

    'import/export': 'error',
    'import/first': 'error',
    'import/no-absolute-path': [ 'error', { esmodule: true, commonjs: true, amd: false } ],
    'import/no-duplicates': 'error',
    'import/no-named-default': 'error',
    'import/no-webpack-loader-syntax': 'error',

    'import/group-exports': 'error', // EDIT: add
    'import/no-default-export': 'error', // EDIT: add
    'import/no-mutable-exports': 'error', // EDIT: add

    'n/handle-callback-err': [ 'error', '^(err|error)$' ],
    'n/no-callback-literal': 'error',
    'n/no-deprecated-api': 'error',
    'n/no-exports-assign': 'error',
    'n/no-new-require': 'error',
    'n/no-path-concat': 'error',
    'n/process-exit-as-throw': 'error',

    'promise/param-names': 'error'
  }
}
