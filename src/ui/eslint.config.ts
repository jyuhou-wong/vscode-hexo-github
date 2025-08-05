import antfu from '@antfu/eslint-config'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default antfu(
  {
    vue: true,
    typescript: true,

    // Enable UnoCSS support
    // https://unocss.dev/integrations/vscode
    // unocss: true, // Removed as it caused an unknown word error
    formatters: true,
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-named-exports': 'off',

      // Add rules for the new plugins
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'vue/no-unused-vars': 'warn',
    },
  },
  {
    ignores: [
      '.github/**',
    ],
  },
)
