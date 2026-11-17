import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase.js';
import { TaskProvider } from './context/TaskContext.jsx';
import DeviceFrame from './components/DeviceFrame.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import SignupScreen from './screens/SignupScreen.jsx';
import DashboardScreen from './screens/DashboardScreen.jsx';
import AllTasksScreen from './screens/AllTasksScreen.jsx';
import TaskDetailScreen from './screens/TaskDetailScreen.jsx';

// 로그인 상태를 알려 주는 훅: session은 null(로그아웃) 또는 세션 객체, isChecking은 확인 중 여부
function useSession() {
  const [session, setSession] = useState(null);
  // Supabase 연결이 없으면 확인할 것이 없으므로 처음부터 로그아웃 상태로 본다
  const [isChecking, setIsChecking] = useState(supabase !== null);

  useEffect(function checkSession() {
    if (!supabase) {
      return undefined;
    }

    // 처음 열 때 저장된 세션을 확인
    supabase.auth.getSession().then(function onSession(result) {
      setSession(result.data.session);
      setIsChecking(false);
    });

    // 로그인·로그아웃이 일어날 때마다 세션을 갱신
    const listener = supabase.auth.onAuthStateChange(function onChange(event, newSession) {
      setSession(newSession);
    });

    return function cleanup() {
      listener.data.subscription.unsubscribe();
    };
  }, []);

  return { session: session, isChecking: isChecking };
}

// 로그인한 사람만 children을 보여 주고, 아니면 로그인 화면으로 보낸다
function ProtectedRoute({ session, isChecking, children }) {
  if (isChecking) {
    return null;
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 이미 로그인한 사람이 로그인·회원가입 화면에 오면 대시보드로 보낸다
function PublicRoute({ session, isChecking, children }) {
  if (isChecking) {
    return null;
  }
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/**
 * Tasko 메인 애플리케이션 컴포넌트
 * - React Router 7을 이용한 화면 이동 라우팅
 * - 첫 화면은 로그인(/login) 화면으로 설정
 * - 5개 지정 화면 라우트 구성:
 *   1. 로그인 (/login)
 *   2. 회원가입 (/signup)
 *   3. 대시보드 (/dashboard)
 *   4. 전체 할 일 목록 (/tasks)
 *   5. 할 일 상세/수정 (/tasks/:id)
 */
export default function App() {
  const { session, isChecking } = useSession();
  const guard = { session: session, isChecking: isChecking };

  return (
    <TaskProvider>
      <BrowserRouter>
        <DeviceFrame>
          <Routes>
            {/* 앱 첫 화면은 로그인 화면입니다 */}
            <Route path="/" element={<PublicRoute {...guard}><LoginScreen /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute {...guard}><LoginScreen /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute {...guard}><SignupScreen /></PublicRoute>} />
            {/* 아래 세 화면은 로그인한 사람만 볼 수 있습니다 */}
            <Route path="/dashboard" element={<ProtectedRoute {...guard}><DashboardScreen /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute {...guard}><AllTasksScreen /></ProtectedRoute>} />
            <Route path="/tasks/:id" element={<ProtectedRoute {...guard}><TaskDetailScreen /></ProtectedRoute>} />
            {/* 알 수 없는 경로는 로그인으로 리디렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DeviceFrame>
      </BrowserRouter>
    </TaskProvider>
  );
}
