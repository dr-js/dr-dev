// UPDATE: https://github.com/standard/eslint-config-standard-jsx/compare/v7.0.0...v8.1.0#diff-1761f4f4ee815f0c4156b931d737ff32
// EDIT: from https://github.com/standard/eslint-config-standard-jsx/blob/v7.0.0/eslintrc.json

module.exports = {
  settings: { react: { version: 'detect' } }, // EDIT

  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
    sourceType: 'module'
  },

  parser: 'babel-eslint', // EDIT

  plugins: [ 'react' ],

  rules: {
    'jsx-quotes': [ 2, 'prefer-double' ], // 'jsx-quotes': [ 'error', 'prefer-single' ], // EDIT
    'react/jsx-boolean-value': 'error',
    // 'react/jsx-closing-bracket-location': [ 'error', 'tag-aligned' ], // EDIT
    // 'react/jsx-closing-tag-location': 'error', // EDIT
    'react/jsx-curly-brace-presence': [ 'error', { props: 'never', children: 'ignore' } ], // 'react/jsx-curly-brace-presence': [ 'error', { props: 'never', children: 'never' } ], // EDIT
    'react/jsx-curly-newline': [ 'error', { multiline: 'consistent', singleline: 'consistent' } ],
    'react/jsx-curly-spacing': [ 'error', {
      attributes: { when: 'never' },
      children: { when: 'never' },
      allowMultiline: true
    } ],
    'react/jsx-equals-spacing': [ 'error', 'never' ],
    'react/jsx-first-prop-new-line': [ 'error', 'multiline-multiprop' ],
    'react/jsx-fragments': [ 'error', 'syntax' ],
    // 'react/jsx-handler-names': 'error', // EDIT
    'react/jsx-indent': [ 'error', 2, { checkAttributes: true, indentLogicalExpressions: true } ],
    'react/jsx-indent-props': [ 'error', 2 ],
    'react/jsx-key': 'error',
    'react/jsx-no-comment-textnodes': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-target-blank': [ 'error', { enforceDynamicLinks: 'always' } ],
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': [ 'error', { allowAllCaps: false } ],
    'react/jsx-props-no-multi-spaces': 'error',
    'react/jsx-tag-spacing': [ 'error', {
      closingSlash: 'never',
      beforeSelfClosing: 'always',
      afterOpening: 'never',
      beforeClosing: 'never'
    } ],
    // 'react/jsx-uses-react': 'error', // EDIT: https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#eslint
    'react/jsx-uses-vars': 'error',
    'react/self-closing-comp': 'error'
  }
}
