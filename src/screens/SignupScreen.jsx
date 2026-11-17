import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

/**
 * Tasko 모바일 회원가입 화면
 * - Supabase Auth(이메일·비밀번호)로 가입합니다.
 * - 가입 후 세션이 생기면 대시보드로, 없으면(이메일 인증 필요) 안내 문구를 보여 줍니다.
 */

// Supabase 오류를 한국어 문구로 바꾼다
function getSignupErrorMessage(error) {
  const message = error.message || '';
  if (message.includes('already registered')) {
    return '이미 가입된 이메일입니다.';
  }
  if (message.includes('at least')) {
    return '비밀번호는 6자 이상이어야 합니다.';
  }
  if (message.includes('valid email') || message.includes('invalid')) {
    return '올바른 이메일 형식이 아닙니다.';
  }
  return '회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

export default function SignupScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    // 입력값 검사
    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 서로 다릅니다.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (!supabase) {
      setErrorMessage('서버 설정이 없어 회원가입할 수 없습니다.');
      return;
    }

    setIsLoading(true);
    const result = await supabase.auth.signUp({ email: email, password: password });
    setIsLoading(false);

    if (result.error) {
      setErrorMessage(getSignupErrorMessage(result.error));
      return;
    }

    // 세션이 있으면 바로 로그인된 상태이므로 대시보드로 이동
    if (result.data.session) {
      navigate('/dashboard');
      return;
    }

    // 세션이 없으면 이메일 인증이 필요한 상태: 안내 문구 표시
    setInfoMessage('인증 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.');
  }

  return (
    <div className="w-full h-full bg-[#F8F9FA] dark:bg-[#121417] flex flex-col justify-between select-none">
      {/* 상단 헤더 */}
      <header className="pt-4 px-7 flex items-center justify-between z-10 shrink-0">
        <span className="text-[13px] font-medium text-[#495057] dark:text-[#ADB5BD] tracking-tight">Tasko Mobile</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1EA65C] inline-block"></span>
          <span className="text-[13px] font-medium text-[#495057] dark:text-[#ADB5BD]">Online</span>
        </div>
      </header>

      {/* 중앙 메인 컨텐츠: 브랜드 및 회원가입 입력 필드 */}
      <section className="px-7 w-full flex flex-col items-center">
        {/* 브랜드 로고 & 타이틀 */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1EA65C] flex items-center justify-center text-white shadow-sm">
              <svg aria-hidden="true" className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#212529] dark:text-[#F1F3F5]">Tasko</h1>
          </div>
          <p className="text-[14px] text-[#495057] dark:text-[#ADB5BD] font-medium tracking-tight">이메일로 간단하게 시작하세요</p>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          {/* 항목 1: 이메일 */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#495057] dark:text-[#ADB5BD] pl-0.5" htmlFor="signupEmail">
              이메일
            </label>
            <input
              className="w-full h-[50px] px-4 rounded-xl border border-[#E9ECEF] dark:border-[#2C3036] bg-white dark:bg-[#1E2125] text-[14.5px] text-[#212529] dark:text-[#F1F3F5] placeholder-[#868E96] focus:outline-none focus:border-[#1EA65C] focus:ring-1 focus:ring-[#1EA65C] transition-colors"
              id="signupEmail"
              placeholder="example@tasko.app"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* 항목 2: 비밀번호 */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#495057] dark:text-[#ADB5BD] pl-0.5" htmlFor="signupPassword">
              비밀번호
            </label>
            <input
              className="w-full h-[50px] px-4 rounded-xl border border-[#E9ECEF] dark:border-[#2C3036] bg-white dark:bg-[#1E2125] text-[14.5px] text-[#212529] dark:text-[#F1F3F5] placeholder-[#868E96] focus:outline-none focus:border-[#1EA65C] focus:ring-1 focus:ring-[#1EA65C] transition-colors"
              id="signupPassword"
              placeholder="비밀번호를 입력하세요"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 항목 3: 비밀번호 확인 */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#495057] dark:text-[#ADB5BD] pl-0.5" htmlFor="passwordConfirm">
              비밀번호 확인
            </label>
            <input
              className="w-full h-[50px] px-4 rounded-xl border border-[#E9ECEF] dark:border-[#2C3036] bg-white dark:bg-[#1E2125] text-[14.5px] text-[#212529] dark:text-[#F1F3F5] placeholder-[#868E96] focus:outline-none focus:border-[#1EA65C] focus:ring-1 focus:ring-[#1EA65C] transition-colors"
              id="passwordConfirm"
              placeholder="비밀번호를 한 번 더 입력하세요"
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          {/* 오류·안내 메시지 */}
          {errorMessage !== '' && (
            <p role="alert" className="text-xs font-medium text-[#FA5252] dark:text-[#FF6B6B]">
              {errorMessage}
            </p>
          )}
          {infoMessage !== '' && (
            <p role="status" className="text-xs font-medium text-[#1EA65C]">
              {infoMessage}
            </p>
          )}

          {/* 회원가입 버튼 */}
          <div className="pt-2">
            <button
              className="w-full h-[50px] bg-[#1EA65C] hover:bg-[#178449] dark:hover:bg-[#1EA65C]/90 active:scale-[0.99] text-white font-medium text-[15px] rounded-xl shadow-[0_4px_14px_rgba(30,166,92,0.25)] transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </div>
        </form>
      </section>

      {/* 하단 로그인 전환 링크 */}
      <footer className="pb-8 flex flex-col items-center shrink-0">
        <p className="text-[13px] text-[#495057] dark:text-[#ADB5BD] font-normal tracking-tight">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-[#1EA65C] font-semibold hover:underline ml-1">
            로그인
          </Link>
        </p>
      </footer>
    </div>
  );
}
