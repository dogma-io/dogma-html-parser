module.exports = {
  extends: 'standard',
  globals: {
    describe: false,
    expect: false,
    fetch: false,
    it: false,
  },
  parser: 'babel-eslint',
  plugins: [
    'flowtype',
  ],
  rules: {
    // Configure built-in rules
    'comma-dangle': ['error', 'always-multiline'],

    // Configure eslint-plugin-flowtype
    // See: https://github.com/gajus/eslint-plugin-flowtype
    'flowtype/define-flow-type': 'error', // Don't complain about flow types
  },
}
