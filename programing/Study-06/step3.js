// ===== 상태 =====
const state = {
  profile: null,
  savedRecipes: [],
  selectedRecipe: null,
  // 프로필 폼 임시
  dietSelections: new Set(),
  cuisineSelections: new Set(),
};

// ===== DOM =====
const sectionSetup    = document.getElementById('section-profile-setup');
const sectionSaved    = document.getElementById('section-saved');
const inputNickname   = document.getElementById('input-nickname');
const chipsDiet       = document.getElementById('chips-diet');
const chipsCuisine    = document.getElementById('chips-cuisine');
const profileError    = document.getElementById('profile-error');
const btnSaveProfile  = document.getElementById('btn-save-profile');
const profileCard     = document.getElementById('profile-card');
const profileNickname = document.getElementById('profile-nickname');
const profileStats    = document.getElementById('profile-stats');
const profileBadges   = document.getElementById('profile-badges');
const btnEditProfile  = document.getElementById('btn-edit-profile');
const emptyState      = document.getElementById('empty-state');
const savedList       = document.getElementById('saved-recipe-list');
const modalOverlay    = document.getElementById('modal-overlay');
const modalTitle      = document.getElementById('modal-title');
const modalMeta       = document.getElementById('modal-meta');
const modalIngredients= document.getElementById('modal-ingredients');
const modalSteps      = document.getElementById('modal-steps');
const modalClose      = document.getElementById('modal-close');

// ===== 초기화 =====
(function init() {
  state.profile = loadProfile();
  state.savedRecipes = loadRecipes();

  if (!state.profile) {
    showSection('setup');
  } else {
    showSection('saved');
    renderProfileCard();
    renderSavedList();
  }
})();

function showSection(name) {
  sectionSetup.classList.add('hidden');
  sectionSaved.classList.add('hidden');
  if (name === 'setup') sectionSetup.classList.remove('hidden');
  if (name === 'saved') sectionSaved.classList.remove('hidden');
}

// ===== localStorage 헬퍼 =====
function loadProfile() {
  try {
    const raw = localStorage.getItem('fridge_user_profile');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    localStorage.removeItem('fridge_user_profile');
    return null;
  }
}

function loadRecipes() {
  try {
    const raw = localStorage.getItem('fridge_saved_recipes');
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveRecipesToStorage() {
  try {
    localStorage.setItem('fridge_saved_recipes', JSON.stringify(state.savedRecipes));
  } catch (e) {
    // 용량 초과 시 가장 오래된 항목 삭제 후 재시도
    if (state.savedRecipes.length > 1) {
      state.savedRecipes.pop();
      saveRecipesToStorage();
    }
  }
}

// ===== 멀티 칩 선택 =====
function setupMultiChips(container, selectionSet) {
  container.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const val = chip.dataset.value;
    if (selectionSet.has(val)) {
      selectionSet.delete(val);
      chip.classList.remove('active');
    } else {
      selectionSet.add(val);
      chip.classList.add('active');
    }
  });
}
setupMultiChips(chipsDiet, state.dietSelections);
setupMultiChips(chipsCuisine, state.cuisineSelections);

// ===== 프로필 저장 =====
btnSaveProfile.addEventListener('click', () => {
  const nickname = inputNickname.value.trim();
  if (!nickname) {
    profileError.textContent = '⚠️ 닉네임을 입력해주세요.';
    profileError.classList.remove('hidden');
    inputNickname.focus();
    return;
  }
  profileError.classList.add('hidden');

  const profile = {
    nickname,
    dietaryRestrictions: [...state.dietSelections].filter(v => v !== '없음'),
    preferredCuisines:   [...state.cuisineSelections],
    createdAt: state.profile?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem('fridge_user_profile', JSON.stringify(profile));
  } catch (_) {}

  state.profile = profile;
  state.savedRecipes = loadRecipes();
  showSection('saved');
  renderProfileCard();
  renderSavedList();
});

// ===== 프로필 수정 =====
btnEditProfile.addEventListener('click', () => {
  if (!state.profile) return;

  // 기존 값으로 폼 채우기
  inputNickname.value = state.profile.nickname;

  state.dietSelections = new Set(state.profile.dietaryRestrictions || []);
  state.cuisineSelections = new Set(state.profile.preferredCuisines || []);

  chipsDiet.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', state.dietSelections.has(c.dataset.value));
  });
  chipsCuisine.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', state.cuisineSelections.has(c.dataset.value));
  });

  showSection('setup');
});

// ===== 프로필 카드 렌더링 =====
function renderProfileCard() {
  const p = state.profile;
  profileNickname.textContent = p.nickname;
  profileStats.textContent = `저장된 레시피 ${state.savedRecipes.length}개`;

  const restrictions = p.dietaryRestrictions || [];
  const cuisines     = p.preferredCuisines   || [];
  const badges = [...restrictions, ...cuisines]
    .map(v => `<span class="badge">${escapeHtml(v)}</span>`)
    .join('');
  profileBadges.innerHTML = badges || '<span class="badge badge-none">제한 없음</span>';
}

// ===== 저장 레시피 목록 렌더링 =====
function renderSavedList() {
  profileStats.textContent = `저장된 레시피 ${state.savedRecipes.length}개`;

  if (state.savedRecipes.length === 0) {
    emptyState.classList.remove('hidden');
    savedList.innerHTML = '';
    return;
  }
  emptyState.classList.add('hidden');

  savedList.innerHTML = '';
  state.savedRecipes.forEach((recipe, idx) => {
    const card = document.createElement('div');
    card.className = 'saved-card';

    const date = new Date(recipe.savedAt).toLocaleDateString('ko-KR', {
      month: 'short', day: 'numeric',
    });
    const diffCls = { '쉬움': 'diff-easy', '보통': 'diff-medium', '어려움': 'diff-hard' }[recipe.difficulty] || 'diff-medium';

    card.innerHTML = `
      <div class="saved-card-main" data-idx="${idx}">
        <div class="saved-card-top">
          <span class="recipe-name">${escapeHtml(recipe.name)}</span>
          <span class="recipe-diff ${diffCls}">${escapeHtml(recipe.difficulty || '보통')}</span>
        </div>
        <div class="saved-card-meta">
          <span>⏱ ${recipe.time ?? '?'}분</span>
          <span class="saved-date">📅 ${date}</span>
        </div>
        <p class="recipe-desc">${escapeHtml(recipe.description || '')}</p>
      </div>
      <button class="btn-delete-recipe" data-idx="${idx}" aria-label="삭제">×</button>
    `;
    savedList.appendChild(card);
  });
}

savedList.addEventListener('click', (e) => {
  const delBtn = e.target.closest('.btn-delete-recipe');
  const cardMain = e.target.closest('.saved-card-main');

  if (delBtn) {
    const idx = parseInt(delBtn.dataset.idx, 10);
    state.savedRecipes.splice(idx, 1);
    saveRecipesToStorage();
    renderSavedList();
    renderProfileCard();
    return;
  }
  if (cardMain) {
    const idx = parseInt(cardMain.dataset.idx, 10);
    openModal(state.savedRecipes[idx]);
  }
});

// ===== 모달 =====
function openModal(r) {
  state.selectedRecipe = r;
  modalTitle.textContent = r.name;
  modalMeta.textContent  = `⏱ ${r.time ?? '?'}분  ·  ${r.difficulty || '보통'}`;

  const avail = (r.available_ingredients || []).map(n =>
    `<span class="modal-ingr avail">✓ ${escapeHtml(n)}</span>`).join('');
  const miss = (r.missing_ingredients || []).map(n =>
    `<span class="modal-ingr miss">✗ ${escapeHtml(n)}</span>`).join('');
  modalIngredients.innerHTML = `
    <p class="modal-section-label">재료</p>
    <div class="modal-ingr-list">${avail}${miss}</div>
  `;

  const steps = (r.steps || []).map((s, i) =>
    `<li class="step-item"><span class="step-num">${i + 1}</span><span>${escapeHtml(s.replace(/^\d+\.\s*/, ''))}</span></li>`
  ).join('');
  modalSteps.innerHTML = `
    <p class="modal-section-label">조리 순서</p>
    <ol class="step-list">${steps}</ol>
  `;

  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ===== 유틸 =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
