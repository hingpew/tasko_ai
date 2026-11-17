import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase.js';
import { getDueInfo } from '../utils/date.js';

// 할 일 상태 공유를 위한 React Context
const TaskContext = createContext(null);

// ─────────────────────────────────────────────
// 이름 바꿔 주는 함수 (화면에서 쓰는 이름 ↔ 테이블 열 이름)
// 이름이 다른 곳은 여기 두 함수에서만 바꾼다.
// ─────────────────────────────────────────────

// 테이블 한 행(row)을 화면에서 쓰는 할 일 모양으로 바꾼다
function rowToTask(row) {
  // 마감 날짜를 오늘과 비교해 화면에 보일 글자(오늘, 내일, 3일 지남 등)를 만든다
  const dueInfo = getDueInfo(row.due_date);
  // 날짜 선택 칸에 넣을 원래 날짜 값 (없으면 null)
  let dueDateValue = null;
  if (row.due_date) {
    dueDateValue = String(row.due_date).slice(0, 10);
  }

  // 만든 날짜는 2026-11-17... 형태에서 앞 10글자만 잘라 2026.11.17 로 보여 준다
  let createdAt = '';
  if (row.created_at) {
    const datePart = row.created_at.slice(0, 10);
    createdAt = datePart.replace(/-/g, '.');
  }

  return {
    id: row.id,
    title: row.title,
    tag: row.category,
    priority: row.priority,
    completed: Boolean(row.is_done),
    starred: Boolean(row.is_starred),
    dueDate: dueInfo.label,
    dueDateValue: dueDateValue,
    isOverdue: dueInfo.isOverdue,
    createdAt: createdAt,
  };
}

// 화면에서 쓰는 할 일을 테이블에 저장할 모양으로 바꾼다
// - user_id는 데이터베이스가 자동으로 채우므로 보내지 않는다
// - 마감일(due_date)은 'YYYY-MM-DD' 날짜, 비어 있으면 null
function taskToRow(task) {
  let dueDate = null;
  if (task.dueDate) {
    dueDate = task.dueDate;
  }
  return {
    title: task.title,
    category: task.tag,
    priority: task.priority,
    due_date: dueDate,
    is_starred: Boolean(task.starred),
    is_done: Boolean(task.completed),
  };
}

export function TaskProvider({ children }) {
  // Supabase의 tasks 테이블에서 읽어 온 할 일 목록
  const [tasks, setTasks] = useState([]);
  // 연결이 있으면 처음에는 "불러오는 중" 상태로 시작한다
  const [isLoading, setIsLoading] = useState(supabase !== null);
  const [loadError, setLoadError] = useState('');
  // 지금 목록을 불러온 사용자 id (같은 사용자로 다시 불러오지 않기 위해 기억)
  const loadedUserIdRef = useRef(null);

  useEffect(function connectTasks() {
    if (!supabase) {
      return undefined;
    }

    // tasks 테이블에서 내 할 일을 최신순으로 읽어 온다
    async function loadTasks() {
      const result = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (result.error) {
        console.error('할 일 불러오기 실패:', result.error);
        setLoadError('할 일을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        setTasks([]);
        setIsLoading(false);
        return;
      }

      const loaded = result.data.map(rowToTask);
      setLoadError('');
      setTasks(loaded);
      setIsLoading(false);
    }

    // 처음 열 때: 로그인되어 있으면 목록을 읽는다
    async function loadFirst() {
      const sessionResult = await supabase.auth.getSession();
      const session = sessionResult.data.session;
      if (!session) {
        setIsLoading(false);
        return;
      }
      loadedUserIdRef.current = session.user.id;
      await loadTasks();
    }
    loadFirst();

    // 로그인·로그아웃이 일어나면 목록을 다시 읽거나 비운다
    const listener = supabase.auth.onAuthStateChange(function onChange(event, session) {
      if (!session) {
        // 로그아웃: 목록을 비운다
        loadedUserIdRef.current = null;
        setTasks([]);
        setLoadError('');
        setIsLoading(false);
        return;
      }
      // 이미 이 사용자의 목록을 읽었다면 다시 읽지 않는다
      if (loadedUserIdRef.current === session.user.id) {
        return;
      }
      loadedUserIdRef.current = session.user.id;
      setIsLoading(true);
      // 인증 이벤트 안에서 바로 요청하면 멈출 수 있어, 한 박자 뒤에 읽는다
      setTimeout(loadTasks, 0);
    });

    return function cleanup() {
      listener.data.subscription.unsubscribe();
    };
  }, []);

  // 목록에서 id가 같은 할 일의 완료 값만 바꾼다
  function setCompleted(id, completed) {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          return { ...task, completed: completed };
        }
        return task;
      })
    );
  }

  // 할 일 완료 상태 토글 함수
  // 먼저 화면에 바로 반영하고, 서버에 저장한다. 저장에 실패하면 원래 값으로 되돌린다.
  async function toggleTask(id) {
    if (!supabase) {
      window.alert('서버 설정이 없어 저장할 수 없습니다.');
      return;
    }

    const target = tasks.find((task) => task.id === id);
    if (!target) {
      return;
    }
    const before = target.completed;
    const after = !before;

    // 1) 화면에 먼저 반영
    setCompleted(id, after);

    // 2) 서버에 저장
    const result = await supabase.from('tasks').update({ is_done: after }).eq('id', id).select();

    // 3) 실패(오류 또는 저장된 행이 없음)하면 되돌리고 알린다
    if (result.error || !result.data || result.data.length === 0) {
      console.error('완료 상태 저장 실패:', result.error);
      setCompleted(id, before);
      window.alert('완료 상태를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  // 할 일 추가 함수: tasks 테이블에 저장하고, 저장된 행을 목록 맨 앞에 넣는다
  async function addTask({ title, priority = 'medium', tag = '#생활', dueDate = null, starred = false }) {
    if (!supabase) {
      window.alert('서버 설정이 없어 할 일을 저장할 수 없습니다.');
      return null;
    }

    const row = taskToRow({ title, tag, priority, dueDate, starred });
    // 새 할 일은 항상 미완료로 시작하므로 is_done은 보내지 않는다 (데이터베이스 기본값 사용)
    delete row.is_done;
    const result = await supabase.from('tasks').insert(row).select().single();

    if (result.error) {
      console.error('할 일 저장 실패:', result.error);
      window.alert('할 일을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      return null;
    }

    const newTask = rowToTask(result.data);
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }

  // 할 일 수정 함수: 서버에 저장이 끝난 뒤에 화면에 반영한다
  // 저장에 성공하면 true, 실패하면 false를 돌려준다
  async function updateTask(id, { title, priority, tag, dueDate, starred, completed }) {
    if (!supabase) {
      window.alert('서버 설정이 없어 저장할 수 없습니다.');
      return false;
    }

    const row = taskToRow({ title, tag, priority, dueDate, starred, completed });
    const result = await supabase.from('tasks').update(row).eq('id', id).select().single();

    if (result.error) {
      console.error('할 일 수정 실패:', result.error);
      window.alert('수정 내용을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      return false;
    }

    // 서버가 돌려준 최신 행으로 목록의 해당 할 일을 바꾼다
    const savedTask = rowToTask(result.data);
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          return savedTask;
        }
        return task;
      })
    );
    return true;
  }

  // 할 일 삭제 함수: 서버에서 지운 뒤에 화면에서 뺀다
  // 삭제에 성공하면 true, 실패하면 false를 돌려준다
  async function deleteTask(id) {
    if (!supabase) {
      window.alert('서버 설정이 없어 삭제할 수 없습니다.');
      return false;
    }

    const result = await supabase.from('tasks').delete().eq('id', id).select();

    // 오류가 났거나, 지워진 행이 없으면(권한 없음 등) 실패로 본다
    if (result.error || !result.data || result.data.length === 0) {
      console.error('할 일 삭제 실패:', result.error);
      window.alert('할 일을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      return false;
    }

    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    return true;
  }

  // 통계 계산
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const inProgressCount = totalCount - completedCount;
  const starredCount = tasks.filter((t) => t.starred).length;
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // 카테고리별 통계 계산 (#생활, #건강, #공부 등)
  const categories = ['#생활', '#건강', '#공부'];
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.tag === cat);
    const catTotal = catTasks.length;
    const catCompleted = catTasks.filter((t) => t.completed).length;
    const catPercentage = catTotal === 0 ? 0 : Math.round((catCompleted / catTotal) * 100);
    return {
      name: cat,
      total: catTotal,
      completed: catCompleted,
      percentage: catPercentage,
    };
  });

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        loadError,
        toggleTask,
        addTask,
        updateTask,
        deleteTask,
        totalCount,
        completedCount,
        inProgressCount,
        starredCount,
        percentage,
        categoryStats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// 편의를 위한 Custom Hook
// 데이터 로직을 TaskContext.jsx 한 파일에 두기 위해, 빠른 새로고침 경고는 이 줄에서만 끈다
// eslint-disable-next-line react-refresh/only-export-components
export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
