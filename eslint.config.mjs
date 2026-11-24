import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

// Flat config as documented for Next.js 16 (node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md).
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    // The public site uses plain <a> links on purpose: every page is a full page load, because each template loads
    // its own stylesheets and the original site scripts (src/templates.ts), which a client-side <Link> navigation
    // would not reload. Images are plain <img> with the original markup (sizes and srcsets come from Media).
    files: ['src/components/**/*.tsx'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Generated or vendored, not hand-written source.
    'src/payload-types.ts',
    'src/payload-generated-schema.ts',
    'src/app/(payload)/admin/importMap.js',
    'public/**',
    'legacy/**',
    'test-results/**',
    'playwright-report/**',
  ]),
])

export default eslintConfig
