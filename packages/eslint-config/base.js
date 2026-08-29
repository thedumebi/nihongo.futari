import antfu from '@antfu/eslint-config'

/**
 * Shared ESLint configuration for the nihongo.futari monorepo.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default antfu({
  type: 'app',
  typescript: true,
  vue: true,
  formatters: true,
  stylistic: {
    indent: 2,
    semi: false,
    quotes: 'single'
  },
  ignores: ['dist', '*.md', '**/migrations/*', '**/src/db/schema/index.*']
}, {
  rules: {
    'no-console': ['warn'],
    // window.confirm() is fine for the lightweight admin delete prompts
    'no-alert': ['off'],
    'antfu/no-top-level-await': ['off'],
    'node/prefer-global/process': ['off'],
    'node/no-process-env': ['error'],
    'perfectionist/sort-imports': ['error', { tsconfigRootDir: '.' }],
    'unicorn/filename-case': ['error', {
      case: 'kebabCase',
      ignore: ['README.md', 'CLAUDE.md']
    }],
    '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'always' }],
    '@stylistic/semi': ['error', 'never'],
    '@stylistic/comma-dangle': ['error', 'never'],
    'no-unused-vars': 'off',
    'ts/no-unsafe-function-type': 'off',
    'unused-imports/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^[A-Z][A-Za-z0-9][_]*$',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        ignoreClassWithStaticInitBlock: true
      }
    ],
    'unused-imports/no-unused-imports': 'error',
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }]
  }
})
