// localStorage에서 할 일 목록 불러오기 (없으면 빈 배열)
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let currentSort = 'createdDesc';

const input          = document.getElementById('todo-input');
const addBtn         = document.getElementById('add-btn');
const todoList       = document.getElementById('todo-list');
const categorySelect = document.getElementById('category-select');
const filterBtns     = document.querySelectorAll('.filter-btn');

const CATEGORY_LABELS = { work: '업무', personal: '개인', study: '공부' };
const CATEGORIES = ['work', 'personal', 'study'];

const progressFill      = document.getElementById('progress-fill');
const progressText      = document.getElementById('progress-text');
const todayCount        = document.getElementById('today-count');
const dashCategories    = document.getElementById('dash-categories');
const themeBtn          = document.getElementById('theme-btn');
const currentDateEl     = document.getElementById('current-date');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const dateInput         = document.getElementById('date-input');
const sortSelect        = document.getElementById('sort-select');
const exportBtn         = document.getElementById('export-btn');
const importInput       = document.getElementById('import-input');

// ── 정렬 ──────────────────────────────────────────
function getSorted(arr) {
  const copy = [...arr];
  switch (currentSort) {
    case 'createdAsc':
      return copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'createdDesc':
      return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'dueDate':
      return copy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    case 'category':
      return copy.sort((a, b) => a.category.localeCompare(b.category));
    case 'completed':
      return copy.sort((a, b) => Number(a.completed) - Number(b.completed));
    default:
      return copy;
  }
}

// ── 날짜 유틸 ─────────────────────────────────────
function formatDate(dateStr) {
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(d)}`;
}

function getDueDateClass(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  if (due < today) return 'due-overdue';
  if (due.getTime() === today.getTime()) return 'due-today';
  return '';
}

// ── 현재 날짜 표시 ────────────────────────────────
currentDateEl.textContent = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric', month: 'long', day: 'numeric',
});

// ── 테마 ──────────────────────────────────────────
function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeBtn.textContent = dark ? '☽' : '☀';
}
applyTheme(localStorage.getItem('theme') === 'dark');

themeBtn.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  applyTheme(isDark);
});

// 대시보드 렌더링
function renderDashboard() {
  const total = todos.length;
  const done  = todos.filter(t => t.completed).length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  progressText.textContent = `${done}/${total} 완료 (${pct}%)`;
  progressFill.style.width = `${pct}%`;

  const today = new Date().toDateString();
  const addedToday = todos.filter(t => t.createdAt === today).length;
  todayCount.textContent = `오늘 추가: ${addedToday}개`;

  dashCategories.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const catTodos = todos.filter(t => t.category === cat);
    if (catTodos.length === 0) return;
    const catDone = catTodos.filter(t => t.completed).length;
    const catPct  = Math.round((catDone / catTodos.length) * 100);

    const row = document.createElement('div');
    row.className = 'dash-cat-row';
    row.innerHTML = `
      <span class="dash-cat-label">${CATEGORY_LABELS[cat]}</span>
      <div class="dash-cat-track">
        <div class="dash-cat-fill fill-${cat}" style="width:${catPct}%"></div>
      </div>
      <span class="dash-cat-stat">${catDone}/${catTodos.length}</span>
    `;
    dashCategories.appendChild(row);
  });
}

// 저장
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// 화면 렌더링 — DocumentFragment로 DOM 조작 최소화
function render() {
  const fragment = document.createDocumentFragment();

  const filtered = getSorted(
    todos.filter(todo => currentFilter === 'all' || todo.category === currentFilter)
  );

  filtered.forEach((todo) => {
    const index = todos.indexOf(todo);

    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(index));

    const span = document.createElement('span');
    span.textContent = todo.text;
    span.title = '더블클릭하여 수정';
    span.addEventListener('dblclick', () => startEdit(index, span, li));

    const tag = document.createElement('span');
    tag.className = `category-tag tag-${todo.category}`;
    tag.textContent = CATEGORY_LABELS[todo.category] || todo.category;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => deleteTodo(index));

    if (todo.dueDate) {
      const dueTag = document.createElement('span');
      const cls = getDueDateClass(todo.dueDate);
      dueTag.className = `due-tag${cls ? ' ' + cls : ''}`;
      dueTag.textContent = `📅 ${formatDate(todo.dueDate)}`;
      li.append(checkbox, span, dueTag, tag, deleteBtn);
    } else {
      li.append(checkbox, span, tag, deleteBtn);
    }

    fragment.appendChild(li);
  });

  // 단 한 번의 DOM 변경으로 N개 항목 삽입 (reflow 최소화)
  todoList.innerHTML = '';
  todoList.appendChild(fragment);

  renderDashboard();
}

// 인라인 수정
function startEdit(index, span, li) {
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = todos[index].text;

  li.replaceChild(editInput, span);
  editInput.focus();
  editInput.select();

  function commitEdit() {
    const newText = editInput.value.trim();
    if (newText) todos[index].text = newText;
    saveTodos();
    render();
  }

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  commitEdit();
    if (e.key === 'Escape') render();
  });
  editInput.addEventListener('blur', commitEdit);
}

// 추가
function addTodo() {
  const text = input.value.trim();
  if (!text) return;

  todos.push({
    text,
    completed: false,
    category: categorySelect.value,
    dueDate: dateInput.value || null,
    createdAt: new Date().toDateString(),
  });
  saveTodos();
  render();
  input.value = '';
  dateInput.value = '';
  input.focus();
}

// 완료 토글
function toggleTodo(index) {
  todos[index].completed = !todos[index].completed;
  saveTodos();
  render();
}

// 삭제
function deleteTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  render();
}

// 완료된 항목 모두 삭제
function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  render();
}
clearCompletedBtn.addEventListener('click', clearCompleted);

// 필터 버튼 이벤트
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

// ── 내보내기 / 가져오기 ────────────────────────────
exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `mytasks_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!Array.isArray(imported)) throw new Error('배열 형식이 아닙니다.');
      todos = imported;
      saveTodos();
      render();
    } catch (err) {
      alert('가져오기 실패: 올바른 My Tasks JSON 파일인지 확인하세요.');
    }
    importInput.value = '';
  };
  reader.readAsText(file);
});

// ── 정렬 ──────────────────────────────────────────
sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
  render();
});

// ── 키보드 단축키 ─────────────────────────────────
// Alt+N: 입력창 포커스 / Alt+1~4: 필터 전환
const FILTER_KEYS = { '1': 'all', '2': 'work', '3': 'personal', '4': 'study' };

document.addEventListener('keydown', (e) => {
  if (!e.altKey) return;

  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    input.focus();
    return;
  }

  if (FILTER_KEYS[e.key]) {
    e.preventDefault();
    currentFilter = FILTER_KEYS[e.key];
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === currentFilter));
    render();
  }
});

// 이벤트 연결
addBtn.addEventListener('click', addTodo);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

// 초기 렌더링
render();
