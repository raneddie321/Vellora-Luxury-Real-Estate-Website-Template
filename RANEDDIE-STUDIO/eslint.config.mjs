import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

/**
 * Flat ESLint config. `eslint-config-next` v16 ships native flat configs, so
 * they are spread directly rather than shimmed through FlatCompat.
 */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'next-env.d.ts', 'dist/**', '.smoke/**'],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Serial awaits are almost always a mistake; where they are deliberate
      // (shared decoders, order-dependent edits) the disable states why.
      'no-await-in-loop': 'error',
    },
  },
  {
    // The smoke test is a sequential script: it reports progress on stdout and
    // its steps are deliberately ordered, so both rules are noise here.
    files: ['scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
      'no-await-in-loop': 'off',
    },
  },
]

export default config
