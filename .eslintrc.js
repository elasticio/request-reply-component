const ERROR = 'error';
const WARN = 'warn';
const ALWAYS = 'always';
const NEVER = 'never';

module.exports = {
  env: {
    es6: true,
    node: true,
    jasmine: true,
    mocha: true,
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
  extends: 'airbnb-base',
  rules: {
    'indent': [
      ERROR,
      2,
      {
        SwitchCase: 1,
      },
    ],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['spec/**/*', 'spec-integration/**/*'] }],
    'max-len': ['error', { code: 180 }],
    'linebreak-style': ERROR,
    'quotes': [WARN, 'single'],
    'semi': [ERROR, ALWAYS],
    'func-names': 0,
    'no-shadow': 0,
    'no-empty': ERROR,
    'no-empty-function': ERROR,
    'brace-style': [ERROR, '1tbs', { allowSingleLine: true }],
    'no-multiple-empty-lines': ERROR,
    'no-multi-spaces': ERROR,
    'one-var': [ERROR, NEVER],
    'quote-props': [WARN, 'consistent-as-needed'],
    'key-spacing': ERROR,
    'space-unary-ops': [
      ERROR,
      {
        words: true,
        nonwords: false,
      },
    ],
    'no-spaced-func': ERROR,
    'space-before-function-paren': [
      ERROR,
      {
        anonymous: ALWAYS,
        named: NEVER,
      },
    ],
    'arrow-body-style': [WARN, 'as-needed'],
    'arrow-parens': 0,
    'array-bracket-spacing': ERROR,
    'space-in-parens': ERROR,
    'comma-dangle': 0,
    'no-trailing-spaces': ERROR,
    'yoda': ERROR,
    'camelcase': 0,
    'new-cap': [
      WARN,
      {
        capIsNewExceptions: ['Q'],
      },
    ],
    'comma-style': ERROR,
    'curly': ERROR,
    'object-curly-spacing': [WARN, ALWAYS],
    'object-curly-newline': 0,
    'object-property-newline': ERROR,
    'template-curly-spacing': ERROR,
    'dot-notation': ERROR,
    'dot-location': [ERROR, 'property'],
    'func-style': [
      ERROR,
      'declaration',
      {
        allowArrowFunctions: true,
      },
    ],
    'eol-last': ERROR,
    'space-infix-ops': ERROR,
    'keyword-spacing': ERROR,
    'space-before-blocks': ERROR,
    'no-invalid-this': ERROR,
    'consistent-this': ERROR,
    'no-this-before-super': ERROR,
    'no-unreachable': ERROR,
    'no-sparse-arrays': ERROR,
    'array-callback-return': ERROR,
    'strict': [WARN, 'global'],
    'eqeqeq': ERROR,
    'no-use-before-define': WARN,
    'no-undef': ERROR,
    'no-unused-vars': WARN,
    'no-mixed-spaces-and-tabs': ERROR,
    'operator-linebreak': [ERROR, 'before'],
    'no-console': [
      WARN,
      {
        allow: ['warn', 'error'],
      },
    ],
  },
};
