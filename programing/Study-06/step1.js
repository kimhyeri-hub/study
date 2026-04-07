const state = {
  imageFile: null,
  imageDataUrl: null,
  ingredients: [],
  isLoading: false,
  error: null,
};

// ===== DOM 참조 =====
const dropZone        = document.getElementById('drop-zone');
const fileInput       = document.getElementById('file-input');
const placeholder     = document.getElementById('drop-zone-placeholder');
const preview         = document.getElementById('drop-zone-preview');
const previewImg      = document.getElementById('preview-img');
const btnReselect     = document.getElementById('btn-reselect');
const btnAnalyze      = document.getElementById('btn-analyze');
const btnAnalyzeText  = document.getElementById('btn-analyze-text');
const btnAnalyzeSpinner = document.getElementById('btn-analyze-spinner');
const errorMsg        = document.getElementById('error-msg');
const sectionResult   = document.getElementById('section-result');
const ingredientTags  = document.getElementById('ingredient-tags');
const ingredientCount = document.getElementById('ingredient-count');
const inputAdd        = document.getElementById('input-add-ingredient');
const btnAdd          = document.getElementById('btn-add-ingredient');
const btnNext         = document.getElementById('btn-next');

// ===== 이미지 선택 처리 =====
function handleFileSelect(file) {
  if (!file || !file.type.startsWith('image/')) {
    showError('이미지 파일만 선택할 수 있어요.');
    return;
  }
  state.imageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.imageDataUrl = e.target.result;
    previewImg.src = state.imageDataUrl;
    placeholder.classList.add('hidden');
    preview.classList.remove('hidden');
    hideError();
    sectionResult.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFileSelect(fileInput.files[0]);
});

btnReselect.addEventListener('click', () => {
  fileInput.value = '';
  fileInput.click();
});

// 드래그 앤 드롭
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
});

// drop-zone 클릭 시 파일 선택 (라벨/버튼 클릭은 제외해서 이중 호출 방지)
dropZone.addEventListener('click', (e) => {
  if (!state.imageDataUrl && !e.target.closest('label') && e.target !== fileInput) {
    fileInput.click();
  }
});

// ===== API 호출 =====
const VISION_MODELS = [
  'google/gemma-3-27b-it:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
];

async function callVisionAPI(model) {
  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `이 냉장고 사진에서 보이는 식재료를 분석해줘.
반드시 아래 JSON 배열 형식으로만 답해줘. 다른 텍스트는 쓰지 마.
각 항목은 name(재료명), quantity(수량 또는 양, 모르면 "확인필요"), status(신선도/상태: "신선" | "보통" | "오래됨" | "확인필요") 필드를 포함해.
예시: [{"name":"당근","quantity":"3개","status":"신선"},{"name":"우유","quantity":"1팩","status":"보통"}]`,
          },
          {
            type: 'image_url',
            image_url: { url: state.imageDataUrl },
          },
        ],
      }],
    }),
  });
}

async function analyzeImage() {
  if (!state.imageDataUrl) {
    showError('사진을 먼저 선택해주세요.');
    return;
  }

  setLoading(true);
  hideError();

  try {
    let response, data;
    for (const model of VISION_MODELS) {
      setLoadingLabel(model === VISION_MODELS[0] ? '분석 중...' : `대체 모델로 재시도 중...`);
      response = await callVisionAPI(model);
      data = await response.json();
      if (response.ok) break;
      if (response.status !== 429) break; // 429 외 오류는 fallback 없이 처리
    }

    if (!response.ok) {
      if (response.status === 429) {
        showError('요청이 너무 많아요. 잠시 후 다시 시도해주세요.', true);
      } else {
        showError(`오류가 발생했어요: ${data.error?.message || response.status}`);
      }
      return;
    }

    const content = data.choices?.[0]?.message?.content || '';
    const ingredients = parseIngredients(content);

    if (ingredients.length === 0) {
      showError('재료를 인식하지 못했어요. 사진을 확인하거나 직접 추가해주세요.');
      state.ingredients = [];
      renderTags();
      sectionResult.classList.remove('hidden');
      return;
    }

    state.ingredients = ingredients;
    renderTags();
    sectionResult.classList.remove('hidden');
    sectionResult.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    showError('네트워크 연결을 확인해주세요.');
  } finally {
    setLoading(false);
  }
}

function parseIngredients(text) {
  // 마크다운 코드블록 제거
  const cleaned = text.replace(/```json|```/g, '').trim();
  // JSON 배열 추출
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const arr = JSON.parse(match[0]);
      if (Array.isArray(arr) && arr.length > 0) {
        // {name, quantity, status} 구조 정규화
        return arr.map(item => {
          if (typeof item === 'string') {
            return { name: item.trim(), quantity: '확인필요', status: '확인필요' };
          }
          return {
            name: String(item.name || item.재료명 || item.ingredient || '').trim(),
            quantity: String(item.quantity || item.수량 || item.amount || '확인필요').trim(),
            status: String(item.status || item.상태 || item.freshness || '확인필요').trim(),
          };
        }).filter(i => i.name);
      }
    } catch (_) {}
  }
  // fallback: 텍스트 줄 분리 → 이름만 있는 구조로
  return text
    .replace(/[\[\]"{}]/g, '')
    .split(/[,\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 30)
    .map(name => ({ name, quantity: '확인필요', status: '확인필요' }));
}

btnAnalyze.addEventListener('click', analyzeImage);

// ===== 카드 렌더링 =====
const STATUS_META = {
  '신선':    { emoji: '🟢', cls: 'status-fresh' },
  '보통':    { emoji: '🟡', cls: 'status-ok' },
  '오래됨':  { emoji: '🔴', cls: 'status-old' },
  '확인필요':{ emoji: '⚪', cls: 'status-unknown' },
};

function renderTags() {
  ingredientCount.textContent = `총 ${state.ingredients.length}가지 재료`;
  ingredientTags.innerHTML = '';
  state.ingredients.forEach((item, idx) => {
    const meta = STATUS_META[item.status] || STATUS_META['확인필요'];
    const card = document.createElement('div');
    card.className = 'ingredient-card';
    card.innerHTML = `
      <div class="card-header">
        <span class="card-name">${escapeHtml(item.name)}</span>
        <button class="tag-delete" data-idx="${idx}" aria-label="${escapeHtml(item.name)} 삭제">×</button>
      </div>
      <div class="card-detail">
        <span class="card-quantity">📦 ${escapeHtml(item.quantity)}</span>
        <span class="card-status ${meta.cls}">${meta.emoji} ${escapeHtml(item.status)}</span>
      </div>
    `;
    ingredientTags.appendChild(card);
  });
}

ingredientTags.addEventListener('click', (e) => {
  const btn = e.target.closest('.tag-delete');
  if (!btn) return;
  const idx = parseInt(btn.dataset.idx, 10);
  state.ingredients.splice(idx, 1);
  renderTags();
});

// ===== 재료 추가 =====
function addIngredient() {
  const val = inputAdd.value.trim();
  if (!val) return;
  if (state.ingredients.some(i => i.name === val)) {
    inputAdd.value = '';
    return;
  }
  state.ingredients.push({ name: val, quantity: '확인필요', status: '확인필요' });
  renderTags();
  inputAdd.value = '';
  sectionResult.classList.remove('hidden');
}

btnAdd.addEventListener('click', addIngredient);
inputAdd.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addIngredient();
});

// ===== Step 2로 이동 =====
btnNext.addEventListener('click', () => {
  if (state.ingredients.length === 0) {
    showError('재료가 없어요. 분석하거나 직접 추가해주세요.', false, true);
    return;
  }
  sessionStorage.setItem('ingredients', JSON.stringify(state.ingredients));
  window.location.href = 'step2.html';
});

// ===== 유틸 =====
function setLoading(flag) {
  state.isLoading = flag;
  btnAnalyze.disabled = flag;
  btnAnalyzeText.textContent = flag ? '분석 중...' : '재료 찾기';
  btnAnalyzeSpinner.classList.toggle('hidden', !flag);
}

function setLoadingLabel(label) {
  btnAnalyzeText.textContent = label;
}

function showError(msg, showRetry = false, scrollToResult = false) {
  errorMsg.innerHTML = `⚠️ ${escapeHtml(msg)}${showRetry
    ? ' <button class="btn btn-ghost btn-sm" id="btn-retry" style="margin-left:8px">재시도</button>'
    : ''}`;
  errorMsg.classList.remove('hidden');
  if (showRetry) {
    document.getElementById('btn-retry')?.addEventListener('click', analyzeImage);
  }
  if (scrollToResult) {
    errorMsg.scrollIntoView({ behavior: 'smooth' });
  }
}

function hideError() {
  errorMsg.classList.add('hidden');
  errorMsg.innerHTML = '';
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
