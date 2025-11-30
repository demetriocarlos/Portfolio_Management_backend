/*import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["***.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["***.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
]);
*/
 
// eslint.config.mjs
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin-js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    plugins: {
      js,
      '@stylistic/js': stylistic
    },
    rules: {
      // Solo reglas básicas (puedes ir ajustando)
      eqeqeq: 'warn',
      'no-unused-vars': 'warn',
      'no-console': 'off',

      // Opcionales: estilo mínimo
      //'@stylistic/js/indent': ['warn', 2],
      //'@stylistic/js/quotes': ['warn', 'single'],
      //'@stylistic/js/semi': ['warn', 'never']
    },
    ignores: ['node_modules', 'dist']
  }
])
