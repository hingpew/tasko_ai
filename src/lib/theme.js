// 화면 모드(라이트/다크)를 기억하고 적용하는 함수 모음

// localStorage에 모드를 저장할 때 쓰는 이름
const STORAGE_KEY = 'tasko-theme';

// 처음 열 때 쓸 모드를 정한다: 저장된 값이 있으면 그 값, 없으면 기기(시스템) 설정
export function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    return 'dark';
  }
  return 'light';
}

// <html>에 dark 클래스를 붙이거나 떼어 화면에 모드를 적용한다
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// 고른 모드를 브라우저에 저장한다 (새로고침해도 유지)
export function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
}
