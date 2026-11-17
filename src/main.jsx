import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { getInitialTheme, applyTheme } from './lib/theme.js';

// 화면이 그려지기 전에 저장된(또는 기기 설정) 모드를 먼저 적용해 깜빡임을 막는다
applyTheme(getInitialTheme());

createRoot(document.getElementById('root')).render(<App />);
