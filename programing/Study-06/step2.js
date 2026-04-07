// ===== 상태 =====
const state = {
  ingredients: [],
  filters: { time: null, difficulty: null, cuisine: null },
  recipes: [],
  selectedRecipe: null,
  isLoading: false,
};

// ===== DOM =====
const summaryTags       = document.getElementById('summary-tags');
const btnGenerate       = document.getElementById('btn-generate');
const btnGenerateText   = document.getElementById('btn-generate-text');
const btnGenerateSpinner= document.getElementById('btn-generate-spinner');
const errorMsg          = document.getElementById('error-msg');
const sectionRecipes    = document.getElementById('section-recipes');
const recipeList        = document.getElementById('recipe-list');
const modalOverlay      = document.getElementById('modal-overlay');
const modalTitle        = document.getElementById('modal-title');
const modalMeta         = document.getElementById('modal-meta');
const modalIngredients  = document.getElementById('modal-ingredients');
const modalSteps        = document.getElementById('modal-steps');
const modalClose        = document.getElementById('modal-close');
const modalSave         = document.getElementById('modal-save');

// ===== 프로필 로드 =====
function loadProfile() {
  try {
    const raw = localStorage.getItem('fridge_user_profile');
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

// ===== 초기화: sessionStorage에서 재료 읽기 =====
(function init() {
  const raw = sessionStorage.getItem('ingredients');
  if (!raw) {
    window.location.href = 'index.html';
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    // {name, quantity, status} 또는 string 배열 모두 허용
    state.ingredients = parsed.map(i =>
      typeof i === 'string' ? { name: i, quantity: '', status: '' } : i
    );
  } catch (_) {
    window.location.href = 'index.html';
    return;
  }
  if (state.ingredients.length === 0) {
    window.location.href = 'index.html';
    return;
  }
  renderSummary();

  // 프로필 선호 요리로 필터 기본값 초기화
  const profile = loadProfile();
  if (profile?.preferredCuisines?.length === 1) {
    const preferred = profile.preferredCuisines[0];
    const cuisineGroup = document.getElementById('filter-cuisine');
    cuisineGroup.querySelectorAll('.chip').forEach(c => {
      const isPreferred = c.dataset.value === preferred;
      c.classList.toggle('active', isPreferred);
    });
    state.filters.cuisine = preferred;
  }
})();

function renderSummary() {
  summaryTags.innerHTML = state.ingredients
    .map(i => `<span class="summary-tag">${escapeHtml(i.name)}</span>`)
    .join('');
}

// ===== 필터 칩 =====
function setupFilterGroup(groupId, key) {
  const group = document.getElementById(groupId);
  group.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const val = chip.dataset.value;
    state.filters[key] = val === '' ? null : (isNaN(val) ? val : Number(val));
  });
}
setupFilterGroup('filter-time', 'time');
setupFilterGroup('filter-difficulty', 'difficulty');
setupFilterGroup('filter-cuisine', 'cuisine');

// ===== API 호출 =====
const TEXT_MODELS = [
  'qwen/qwen3.6-plus:free',
  'meta-llama/llama-3.3-70b-instruct:free',
];

async function callTextAPI(model, messages) {
  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages }),
  });
}

async function generateRecipes() {
  setLoading(true);
  hideError();

  const names = state.ingredients.map(i => i.name).join(', ');
  const { time, difficulty, cuisine } = state.filters;

  const profile = loadProfile();
  const dietaryNote = profile?.dietaryRestrictions?.length
    ? `\n식이 제한: ${profile.dietaryRestrictions.join(', ')}`
    : '';

  const conditions = [
    time       ? `요리 시간 ${time}분 이하` : '요리 시간 제한 없음',
    difficulty ? `난이도 ${difficulty}`     : '난이도 상관없음',
    cuisine    ? `요리 종류 ${cuisine}`     : '요리 종류 상관없음',
  ].join(', ');

  const messages = [
    {
      role: 'system',
      content: '당신은 요리 전문가입니다. 주어진 재료로 만들 수 있는 레시피를 추천해주세요. 반드시 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.',
    },
    {
      role: 'user',
      content:
`보유 재료: ${names}
조건: ${conditions}${dietaryNote}

다음 JSON 형식으로 레시피 3개를 추천해줘. 다른 텍스트 없이 JSON만 출력해:
[
  {
    "name": "요리명",
    "time": 소요시간(숫자, 분),
    "difficulty": "쉬움|보통|어려움",
    "available_ingredients": ["보유 재료 중 사용하는 것"],
    "missing_ingredients": ["없어서 추가로 필요한 재료"],
    "description": "한 줄 소개",
    "steps": ["1. 설명", "2. 설명"]
  }
]`,
    },
  ];

  try {
    let res, data;
    for (const model of TEXT_MODELS) {
      setLoadingLabel(model === TEXT_MODELS[0] ? '레시피 생성 중...' : '다른 모델로 재시도 중...');
      res = await callTextAPI(model, messages);
      data = await res.json();
      if (res.ok) break;
      if (res.status !== 429) break;
    }

    if (!res.ok) {
      showError(
        res.status === 429
          ? '요청이 너무 많아요. 잠시 후 다시 시도해주세요.'
          : `오류가 발생했어요: ${data.error?.message || res.status}`,
        true
      );
      return;
    }

    const content = data.choices?.[0]?.message?.content || '';
    const recipes = parseRecipes(content);

    if (!recipes || recipes.length === 0) {
      showError('레시피를 생성하지 못했어요. 다시 시도해주세요.', true);
      return;
    }

    state.recipes = recipes;
    renderRecipes();
    sectionRecipes.classList.remove('hidden');
    sectionRecipes.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    showError('네트워크 연결을 확인해주세요.');
  } finally {
    setLoading(false);
  }
}

function parseRecipes(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[0]);
    return Array.isArray(arr) ? arr : null;
  } catch (_) {
    return null;
  }
}

btnGenerate.addEventListener('click', generateRecipes);

// ===== 레시피 카드 렌더링 =====
const DIFF_COLOR = { '쉬움': 'diff-easy', '보통': 'diff-medium', '어려움': 'diff-hard' };

function renderRecipes() {
  recipeList.innerHTML = '';
  state.recipes.forEach((recipe, idx) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.idx = idx;

    const availCount = (recipe.available_ingredients || []).length;
    const missCount  = (recipe.missing_ingredients  || []).length;
    const diffCls    = DIFF_COLOR[recipe.difficulty] || 'diff-medium';

    card.innerHTML = `
      <div class="recipe-card-header">
        <h3 class="recipe-name">${escapeHtml(recipe.name)}</h3>
        <span class="recipe-diff ${diffCls}">${escapeHtml(recipe.difficulty || '보통')}</span>
      </div>
      <p class="recipe-desc">${escapeHtml(recipe.description || '')}</p>
      <div class="recipe-meta-row">
        <span class="recipe-time">⏱ ${recipe.time ?? '?'}분</span>
        <span class="recipe-ingr-count">
          <span class="avail">✓ ${availCount}가지 보유</span>
          ${missCount > 0 ? `<span class="miss">✗ ${missCount}가지 부족</span>` : ''}
        </span>
      </div>
      <div class="recipe-card-footer">
        <button class="btn btn-outline btn-sm btn-detail" data-idx="${idx}">자세히 보기</button>
        <button class="btn btn-primary btn-sm btn-save" data-idx="${idx}">저장</button>
      </div>
    `;
    recipeList.appendChild(card);
  });
}

recipeList.addEventListener('click', (e) => {
  const detailBtn = e.target.closest('.btn-detail');
  const saveBtn   = e.target.closest('.btn-save');
  if (detailBtn) openModal(parseInt(detailBtn.dataset.idx, 10));
  if (saveBtn)   saveRecipe(parseInt(saveBtn.dataset.idx, 10), saveBtn);
});

// ===== 모달 =====
function openModal(idx) {
  const r = state.recipes[idx];
  state.selectedRecipe = r;

  modalTitle.textContent = r.name;
  modalMeta.textContent  = `⏱ ${r.time ?? '?'}분  ·  ${r.difficulty || '보통'}`;

  // 재료 섹션
  const avail = (r.available_ingredients || []).map(n =>
    `<span class="modal-ingr avail">✓ ${escapeHtml(n)}</span>`
  ).join('');
  const miss = (r.missing_ingredients || []).map(n =>
    `<span class="modal-ingr miss">✗ ${escapeHtml(n)}</span>`
  ).join('');
  modalIngredients.innerHTML = `
    <p class="modal-section-label">재료</p>
    <div class="modal-ingr-list">${avail}${miss}</div>
  `;

  // 조리 순서
  const steps = (r.steps || []).map((s, i) =>
    `<li class="step-item"><span class="step-num">${i + 1}</span><span>${escapeHtml(s.replace(/^\d+\.\s*/, ''))}</span></li>`
  ).join('');
  modalSteps.innerHTML = `
    <p class="modal-section-label">조리 순서</p>
    <ol class="step-list">${steps}</ol>
  `;

  modalSave.dataset.idx = idx;
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
modalSave.addEventListener('click', (e) => {
  saveRecipe(parseInt(e.currentTarget.dataset.idx, 10), e.currentTarget);
  closeModal();
});

// ===== 저장 =====
function saveRecipe(idx, btn) {
  const recipe = state.recipes[idx];
  const saved = JSON.parse(localStorage.getItem('fridge_saved_recipes') || '[]');

  const entry = {
    ...recipe,
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
  };
  saved.unshift(entry);
  if (saved.length > 50) saved.pop();
  localStorage.setItem('fridge_saved_recipes', JSON.stringify(saved));

  btn.textContent = '저장됨 ✓';
  btn.disabled = true;
}

// ===== 유틸 =====
function setLoading(flag) {
  state.isLoading = flag;
  btnGenerate.disabled = flag;
  btnGenerateText.textContent = flag ? '레시피 생성 중...' : '레시피 만들기';
  btnGenerateSpinner.classList.toggle('hidden', !flag);
}

function setLoadingLabel(label) {
  btnGenerateText.textContent = label;
}

function showError(msg, showRetry = false) {
  errorMsg.innerHTML = `⚠️ ${escapeHtml(msg)}${showRetry
    ? ' <button class="btn btn-ghost btn-sm" id="btn-retry" style="margin-left:8px">재시도</button>'
    : ''}`;
  errorMsg.classList.remove('hidden');
  if (showRetry) {
    document.getElementById('btn-retry')?.addEventListener('click', generateRecipes);
  }
}

function hideError() {
  errorMsg.classList.add('hidden');
  errorMsg.innerHTML = '';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
