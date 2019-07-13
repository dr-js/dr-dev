// EDIT: from https://github.com/standard/eslint-config-standard-jsx/blob/v7.0.0/eslintrc.json

module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: { jsx: true },
    sourceType: 'module'
  },

  parser: 'babel-eslint', // EDIT

  plugins: [ 'react' ],

  rules: {
    'jsx-quotes': [ 2, 'prefer-double' ], // 'jsx-quotes': [ 'error', 'prefer-single' ], // EDIT
    'react/jsx-boolean-value': 'error',
    'react/jsx-curly-spacing': [ 'error', 'never' ],
    'react/jsx-equals-spacing': [ 'error', 'never' ],
    'react/jsx-indent': [ 'error', 2 ],
    'react/jsx-indent-props': [ 'error', 2 ],
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-tag-spacing': [ 'error', { beforeSelfClosing: 'always' } ],
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/self-closing-comp': 'error'
  }
}
