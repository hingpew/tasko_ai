// 마감 날짜 계산 함수 모음
// 날짜는 'YYYY-MM-DD' 글자로 다룬다. (시간대 문제를 피하려고 연·월·일 숫자로만 비교한다)

// 숫자를 두 자리 글자로 만든다 (3 -> '03')
function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return String(number);
}

// 오늘 날짜를 'YYYY-MM-DD' 글자로 돌려준다 (이 기기의 시간 기준)
export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  return year + '-' + month + '-' + day;
}

// 'YYYY-MM-DD' 글자를 "1970-01-01부터 며칠째인지" 숫자로 바꾼다 (날짜끼리 빼기 위해)
function toDayNumber(dateString) {
  const parts = dateString.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const milliseconds = Date.UTC(year, month - 1, day);
  return Math.round(milliseconds / 86400000);
}

// 마감 날짜를 오늘과 비교해 화면에 보일 글자와 기한 지남 여부를 돌려준다
// 돌려주는 값: { label: '오늘', isOverdue: false }
export function getDueInfo(dueDate) {
  // 비어 있으면 마감 없음
  if (!dueDate) {
    return { label: '마감 없음', isOverdue: false };
  }

  // 'YYYY-MM-DD' 앞 10글자만 사용 (날짜 뒤에 시간이 붙어 와도 안전하게)
  const dueString = String(dueDate).slice(0, 10);
  const diff = toDayNumber(dueString) - toDayNumber(getTodayString());

  if (diff === 0) {
    return { label: '오늘', isOverdue: false };
  }
  if (diff === 1) {
    return { label: '내일', isOverdue: false };
  }
  if (diff > 1) {
    const parts = dueString.split('-');
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    return { label: month + '월 ' + day + '일', isOverdue: false };
  }
  if (diff === -1) {
    return { label: '어제(기한 지남)', isOverdue: true };
  }
  return { label: Math.abs(diff) + '일 지남', isOverdue: true };
}
