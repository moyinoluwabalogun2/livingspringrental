import {
  defineConfig,
  globalIgnores,
} from 'eslint/config';

import nextVitals
  from 'eslint-config-next/core-web-vitals';

import nextTs
  from 'eslint-config-next/typescript';

const eslintConfig =
  defineConfig([
    ...nextVitals,

    ...nextTs,

    {
      rules: {
        /*
         * Temporary migration rule.
         *
         * The old MVP contains some
         * Firestore records typed as
         * "any".
         *
         * We will remove those as the
         * affected modules are rebuilt.
         *
         * Do NOT disable the React
         * performance/hook rules.
         */
        '@typescript-eslint/no-explicit-any':
          'warn',
      },
    },

    globalIgnores([
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ]),
  ]);

export default eslintConfig;