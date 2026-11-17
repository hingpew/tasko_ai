import React, { useState } from 'react';
import { getInitialTheme, applyTheme, saveTheme } from '../lib/theme.js';

/**
 * 라이트·다크 모드 전환 버튼 (해/달 모양)
 * - 라이트 모드에서는 달, 다크 모드에서는 해 아이콘을 보여 준다.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  // 버튼을 누르면 모드를 바꾸고, 적용하고, 저장한다
  function handleToggle() {
    let nextTheme = 'dark';
    if (theme === 'dark') {
      nextTheme = 'light';
    }
    setTheme(nextTheme);
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  }

  let label = '다크 모드로 바꾸기';
  if (theme === 'dark') {
    label = '라이트 모드로 바꾸기';
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      title={label}
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F8F9FA] dark:hover:bg-[#121417] text-[#495057] dark:text-[#ADB5BD] active:scale-95 transition-all"
    >
      {theme === 'dark' ? (
        // 해 아이콘 (누르면 라이트 모드)
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
        </svg>
      ) : (
        // 달 아이콘 (누르면 다크 모드)
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );
}
