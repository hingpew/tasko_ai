import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  // 검사에서 제외할 폴더
  { ignores: ['dist', 'node_modules'] },

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // 브라우저 전역 변수(window, document 등)를 인식
      globals: globals.browser,
      // JSX 문법 사용
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // ESLint 기본 추천 규칙
      ...js.configs.recommended.rules,
      // JSX에서 쓰는 컴포넌트(대문자 시작)를 "안 쓰는 변수"로 잘못 잡지 않도록 예외 처리
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // React Hooks 규칙
      ...reactHooks.configs.recommended.rules,
      // Vite 빠른 새로고침 규칙: 컴포넌트 파일은 컴포넌트만 export
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // vite.config.js 등 Node에서 실행되는 설정 파일
  {
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
