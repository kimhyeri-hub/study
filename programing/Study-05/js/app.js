// ── State ────────────────────────────────────────────────
const state = {
  playerName: '',
  selectedCategory: 'all',
  selectedDifficulty: 'all',
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  answered: false,
  justPlayed: false,      // 게임을 마친 직후 → 순위에서 내 기록 강조
  categoryStats: {}       // { '한국사': { correct: 0, total: 0 }, ... }
};

let autoNextTimer = null; // 2초 자동 전환 타이머 ID

// ── DOM 참조 ─────────────────────────────────────────────
const screens = {
  start:   document.getElementById('screen-start'),
  quiz:    document.getElementById('screen-quiz'),
  result:  document.getElementById('screen-result'),
  ranking: document.getElementById('screen-ranking')
};

const playerNameInput = document.getElementById('player-name');
const categorySelect        = document.getElementById('category');
const difficultySelect      = document.getElementById('difficulty');
const questionCountPreview  = document.getElementById('question-count-preview');
const btnStart              = document.getElementById('btn-start');
const btnGoRanking          = document.getElementById('btn-go-ranking');

const categoryLabel   = document.getElementById('category-label');
const difficultyLabel = document.getElementById('difficulty-label');
const scoreDisplay    = document.getElementById('score-display');
const progressBar     = document.getElementById('progress-bar');
const progressText    = document.getElementById('progress-text');
const questionText    = document.getElementById('question-text');
const optionBtns      = document.querySelectorAll('.option-btn');
const feedbackBox     = document.getElementById('feedback-box');
const feedbackMsg     = document.getElementById('feedback-msg');
const btnNext         = document.getElementById('btn-next');

const resultGrade     = document.getElementById('result-grade');
const resultScore     = document.getElementById('result-score');
const resultCorrect   = document.getElementById('result-correct');
const btnRanking      = document.getElementById('btn-ranking');
const btnRestart      = document.getElementById('btn-restart');

const rankingList     = document.getElementById('ranking-list');
const rankingEmpty    = document.getElementById('ranking-empty');
const btnHome         = document.getElementById('btn-home');

// ── 화면 전환 ────────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  const target = screens[name];
  target.classList.remove('hidden');

  // 화면 전환마다 fadeIn 재생 (reflow 트릭으로 animation 리셋)
  const card = target.querySelector('.card');
  if (card) {
    card.style.animation = 'none';
    card.offsetHeight; // reflow 강제 유발
    card.style.animation = '';
  }

  // 시작 화면 진입 시 이름 입력창 자동 포커스
  if (name === 'start') playerNameInput.focus();
}

// ── 등급 계산 ────────────────────────────────────────────
function calcGrade(score) {
  if (score >= 380) return 'S';
  if (score >= 300) return 'A';
  if (score >= 200) return 'B';
  if (score >= 100) return 'C';
  return 'D';
}

// ── 배열 무작위 섞기 (Fisher-Yates) ─────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 보기 순서 섞기 ───────────────────────────────────────
function shuffleOptions(question) {
  const indices = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const correctText = question.options[question.answer];
  const shuffled    = indices.map(i => question.options[i]);
  return { options: shuffled, answer: shuffled.indexOf(correctText) };
}

// ── 게임 초기화 (시작 화면 진입 시) ─────────────────────
// 현재 선택 조건에 맞는 문제 수를 미리보기로 표시
function updatePreview() {
  const cat  = categorySelect.value;
  const diff = difficultySelect.value;
  const count = QUESTIONS.filter(q =>
    (cat  === 'all' || q.category   === cat) &&
    (diff === 'all' || q.difficulty === diff)
  ).length;

  if (count === 0) {
    questionCountPreview.textContent = '해당 조건에 문제가 없습니다.';
    questionCountPreview.className   = 'question-count-preview warn';
    btnStart.disabled = true;
  } else {
    questionCountPreview.textContent = `총 ${count}문제`;
    questionCountPreview.className   = 'question-count-preview';
    btnStart.disabled = playerNameInput.value.trim().length === 0;
  }
}

function initGame() {
  playerNameInput.value    = '';
  categorySelect.value     = 'all';
  difficultySelect.value   = 'all';
  btnStart.disabled        = true;
  state.justPlayed         = false;
  updatePreview();
  showScreen('start');
}

// ── 게임 시작 ────────────────────────────────────────────
function startGame() {
  state.playerName         = playerNameInput.value.trim();
  state.selectedCategory   = categorySelect.value;
  state.selectedDifficulty = difficultySelect.value;
  state.score              = 0;
  state.correctCount       = 0;
  state.currentIndex       = 0;
  state.answered           = false;
  state.justPlayed         = false;

  const filtered = QUESTIONS.filter(q =>
    (state.selectedCategory   === 'all' || q.category   === state.selectedCategory) &&
    (state.selectedDifficulty === 'all' || q.difficulty === state.selectedDifficulty)
  );

  // 문제 순서 섞기 → 보기 순서도 섞기
  state.questions = shuffleArray(filtered).map(q => {
    const { options, answer } = shuffleOptions(q);
    return { ...q, options, answer };
  });

  // 카테고리별 통계 초기화
  state.categoryStats = {};
  state.questions.forEach(q => {
    if (!state.categoryStats[q.category]) {
      state.categoryStats[q.category] = { correct: 0, total: 0 };
    }
    state.categoryStats[q.category].total++;
  });

  showScreen('quiz');
  showQuestion();
}

// ── 문제 표시 ────────────────────────────────────────────
function showQuestion() {
  const q     = state.questions[state.currentIndex];
  const total = state.questions.length;

  state.answered = false;

  categoryLabel.textContent   = q.category;
  difficultyLabel.textContent = q.difficulty;
  difficultyLabel.className   = `difficulty-badge diff-${q.difficulty}`;
  scoreDisplay.textContent    = `${state.score}점`;

  // 진행률: 현재 문제 번호 기준 (이전까지 완료한 비율)
  const pct = (state.currentIndex / total) * 100;
  progressBar.style.width  = `${pct}%`;
  progressText.textContent = `${state.currentIndex + 1} / ${total}`;

  questionText.textContent = q.question;

  optionBtns.forEach((btn, i) => {
    btn.textContent = q.options[i];
    btn.className   = 'option-btn';
    btn.disabled    = false;
  });

  feedbackBox.classList.add('hidden');
  feedbackMsg.textContent = '';
  feedbackMsg.className   = 'feedback-msg';
  btnNext.textContent     = '다음 문제 →';
}

// ── 보기 선택 ────────────────────────────────────────────
function selectAnswer(idx) {
  if (state.answered) return;
  state.answered = true;

  const q         = state.questions[state.currentIndex];
  const isCorrect = idx === q.answer;
  const total     = state.questions.length;

  // 모든 보기 비활성화 후 정답/오답 표시
  optionBtns.forEach(btn => (btn.disabled = true));
  optionBtns[idx].classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) optionBtns[q.answer].classList.add('correct');

  // 점수 갱신
  if (isCorrect) {
    state.score += 10;
    state.correctCount++;
    state.categoryStats[q.category].correct++;
    // 점수 pop 애니메이션
    scoreDisplay.classList.remove('pop');
    scoreDisplay.offsetHeight; // reflow
    scoreDisplay.classList.add('pop');
  }
  scoreDisplay.textContent = `${state.score}점`;

  // 진행률 바: 이 문제를 푼 직후 → 완료된 문제 수 반영
  const completed = state.currentIndex + 1;
  progressBar.style.width  = `${(completed / total) * 100}%`;
  progressText.textContent = `${completed} / ${total}`;

  showFeedback(isCorrect, q.options[q.answer]);
}

// ── 피드백 표시 + 2초 자동 전환 ─────────────────────────
function showFeedback(isCorrect, correctText) {
  feedbackMsg.textContent = isCorrect
    ? '✅ 정답입니다!'
    : `❌ 오답! 정답: ${correctText}`;
  feedbackMsg.className = `feedback-msg ${isCorrect ? 'is-correct' : 'is-wrong'}`;
  feedbackBox.classList.remove('hidden');

  // 2초 카운트다운 자동 전환
  let remaining = 2;
  btnNext.textContent = `다음 문제 (${remaining})`;

  autoNextTimer = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      btnNext.textContent = `다음 문제 (${remaining})`;
    } else {
      clearInterval(autoNextTimer);
      autoNextTimer = null;
      nextQuestion();
    }
  }, 1000);
}

// ── 다음 문제 ────────────────────────────────────────────
function nextQuestion() {
  // 타이머가 남아있으면 취소 (버튼 클릭 시)
  if (autoNextTimer !== null) {
    clearInterval(autoNextTimer);
    autoNextTimer = null;
  }

  state.currentIndex++;
  if (state.currentIndex >= state.questions.length) {
    endGame();
  } else {
    showQuestion();
  }
}

// ── 게임 종료 ────────────────────────────────────────────
function endGame() {
  const grade = calcGrade(state.score);
  const total = state.questions.length;
  const pct   = Math.round((state.correctCount / total) * 100);

  resultGrade.textContent   = grade;
  resultGrade.className     = `result-grade grade-${grade}`;
  resultScore.textContent   = `${state.score} / ${total * 10}점`;
  resultCorrect.textContent = `정답 ${state.correctCount}개 / ${total}문제 (${pct}%)`;

  // 카테고리별 정답 수 렌더링
  const catStatsEl = document.getElementById('category-stats');
  catStatsEl.innerHTML = '';
  Object.entries(state.categoryStats).forEach(([cat, stat]) => {
    const ratio = stat.correct / stat.total;
    const barPct = Math.round(ratio * 100);

    const row = document.createElement('div');
    row.className = 'cat-stat-row';
    row.innerHTML = `
      <span class="cat-stat-name">${cat}</span>
      <div class="cat-stat-bar-track">
        <div class="cat-stat-bar" style="width:${barPct}%"></div>
      </div>
      <span class="cat-stat-count">${stat.correct}/${stat.total}</span>
    `;
    catStatsEl.appendChild(row);
  });

  state.justPlayed = true;
  saveRanking();
  showScreen('result');
}

// ── 순위 저장 ────────────────────────────────────────────
function saveRanking() {
  const now = new Date();
  const record = {
    name:    state.playerName,
    score:   state.score,
    correct: state.correctCount,
    total:   state.questions.length,
    date:    now.toLocaleDateString('ko-KR'),   // 표시용
    isoDate: now.toISOString().slice(0, 10)     // 정렬용 (YYYY-MM-DD)
  };

  let rankings = JSON.parse(localStorage.getItem('quiz_rankings')) || [];
  rankings.push(record);
  // 점수 내림차순 → isoDate 최신순 (YYYY-MM-DD 형식은 문자열 비교 가능)
  rankings.sort((a, b) =>
    b.score - a.score ||
    (b.isoDate || '').localeCompare(a.isoDate || '')
  );
  rankings = rankings.slice(0, 10);
  localStorage.setItem('quiz_rankings', JSON.stringify(rankings));
}

// ── 순위 표시 ────────────────────────────────────────────
function showRanking() {
  const rankings = JSON.parse(localStorage.getItem('quiz_rankings')) || [];
  rankingList.innerHTML = '';

  if (rankings.length === 0) {
    rankingEmpty.classList.remove('hidden');
  } else {
    rankingEmpty.classList.add('hidden');
    const medals = ['🥇', '🥈', '🥉'];

    rankings.forEach((r, i) => {
      const li = document.createElement('li');

      // 방금 끝낸 게임의 기록이면 내 기록으로 강조
      if (state.justPlayed && r.name === state.playerName && r.score === state.score) {
        li.classList.add('my-record');
        state.justPlayed = false; // 첫 매칭만 강조
      }

      // XSS 방지: 사용자 입력값은 textContent로 삽입
      const medal   = document.createElement('span');
      medal.className = 'rank-medal';
      medal.textContent = medals[i] ?? String(i + 1);

      const name    = document.createElement('span');
      name.className = 'rank-name';
      name.textContent = r.name;

      const score   = document.createElement('span');
      score.className = 'rank-score';
      score.textContent = `${r.score}점`;

      const date    = document.createElement('span');
      date.className = 'rank-date';
      date.textContent = r.date;

      li.append(medal, name, score, date);
      rankingList.appendChild(li);
    });
  }

  showScreen('ranking');
}

// ── 이벤트 바인딩 ────────────────────────────────────────
// 시작 화면
playerNameInput.addEventListener('input', updatePreview);
categorySelect.addEventListener('change', updatePreview);
difficultySelect.addEventListener('change', updatePreview);

btnStart.addEventListener('click', startGame);

// Enter 키로 게임 시작
playerNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !btnStart.disabled) startGame();
});

btnGoRanking.addEventListener('click', () => {
  state.justPlayed = false;
  showRanking();
});

// 퀴즈 화면: 보기 버튼
optionBtns.forEach(btn => {
  btn.addEventListener('click', () => selectAnswer(Number(btn.dataset.idx)));
});

btnNext.addEventListener('click', nextQuestion);

// 결과 화면
btnRanking.addEventListener('click', showRanking);
btnRestart.addEventListener('click', initGame);

// 순위 화면
btnHome.addEventListener('click', initGame);

// 키보드 단축키
// 퀴즈 중: 1~4 → 보기 선택 / Enter·Space → 다음 문제
document.addEventListener('keydown', e => {
  if (screens.quiz.classList.contains('hidden')) return;

  const map = { '1': 0, '2': 1, '3': 2, '4': 3 };
  if (map[e.key] !== undefined) {
    selectAnswer(map[e.key]);
    return;
  }
  if ((e.key === 'Enter' || e.key === ' ') && !feedbackBox.classList.contains('hidden')) {
    e.preventDefault();
    nextQuestion();
  }
});

// ── 초기 실행 ────────────────────────────────────────────
updatePreview();
showScreen('start');
