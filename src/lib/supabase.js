import { createClient } from '@supabase/supabase-js';

// Supabase 연결 정보는 .env.local의 환경변수에서 읽어 온다 (값은 코드에 쓰지 않는다)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// 앱 전체에서 하나만 만들어 같이 쓰는 Supabase 연결
let supabase = null;

if (!supabaseUrl || !supabasePublishableKey) {
  // 값이 비어 있으면 연결을 만들지 않고 콘솔에 알려 준다 (앱이 멈추지 않게 하기 위함)
  console.error(
    'Supabase 환경변수가 비어 있습니다. .env.local에 VITE_SUPABASE_URL과 VITE_SUPABASE_PUBLISHABLE_KEY를 넣고 개발 서버를 다시 시작해 주세요.'
  );
} else {
  supabase = createClient(supabaseUrl, supabasePublishableKey);
}

export { supabase };
