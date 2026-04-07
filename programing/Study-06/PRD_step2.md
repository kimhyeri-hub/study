# PRD Step 2 — 레시피 생성

## 목표
Step 1에서 추출한 재료 목록을 기반으로 `qwen/qwen3.6-plus:free` 모델이 만들 수 있는 레시피를 생성하고 사용자에게 카드 형태로 제시한다.

---

## 화면 구성

### 레시피 생성 화면
- **재료 요약 바**: Step 1에서 넘어온 재료 목록 표시 (수정 링크 포함 → Step 1로 복귀)
- **필터 옵션** (선택):
  - 요리 시간: 15분 이하 / 30분 이하 / 제한 없음
  - 난이도: 쉬움 / 보통 / 어려움
  - 요리 종류: 한식 / 양식 / 중식 / 일식 / 상관없음
- **생성 버튼**: "레시피 만들기"
- **결과 영역**: 레시피 카드 3개 표시
  - 카드: 요리명, 소요시간, 난이도, 필요 재료 (보유/미보유 구분), 간단 소개
  - 카드 클릭 → 상세 레시피 모달 (순서별 조리법)
- **저장 버튼**: 각 카드에 "저장" 버튼 → Step 3 프로필에 저장

---

## API 호출 스펙

**Endpoint:** `POST https://openrouter.ai/api/v1/chat/completions`

**System Prompt:**
```
당신은 요리 전문가입니다. 주어진 재료로 만들 수 있는 레시피를 추천해주세요.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.
```

**User Prompt 템플릿:**
```
보유 재료: {ingredients.join(", ")}
조건: 요리 시간 {time}분 이하, 난이도 {difficulty}, 종류 {cuisine}

다음 형식으로 레시피 3개를 추천해줘:
[
  {
    "name": "요리명",
    "time": 소요시간(분),
    "difficulty": "쉬움|보통|어려움",
    "available_ingredients": ["보유 재료 중 사용하는 것"],
    "missing_ingredients": ["없는 재료"],
    "description": "한 줄 소개",
    "steps": ["1. ...", "2. ...", "3. ..."]
  }
]
```

**응답 파싱:**
- content에서 JSON 배열 추출 (`JSON.parse`)
- 마크다운 코드블록(` ```json `)이 포함된 경우 제거 후 파싱

---

## 상태 관리

```js
const state = {
  // Step 1에서 전달받음
  ingredients: [],

  // Step 2 로컬
  filters: {
    time: null,          // 15 | 30 | null
    difficulty: null,    // '쉬움' | '보통' | '어려움' | null
    cuisine: null,       // '한식' | '양식' | '중식' | '일식' | null
  },
  recipes: [],           // 생성된 레시피 배열
  selectedRecipe: null,  // 모달에서 보여줄 레시피
  isLoading: false,
  error: null,
}
```

**Step 간 데이터 전달:** `sessionStorage`에 `ingredients` 저장 → Step 2에서 읽기

---

## 에러 처리

| 상황 | 처리 |
|------|------|
| 재료 0개 상태로 진입 | Step 1으로 자동 리다이렉트 |
| API 429 (rate limit) | 재시도 버튼 + 대기 시간 안내 |
| JSON 파싱 실패 | 재생성 버튼 표시, 에러 메시지 안내 |

---

## 완료 조건
- [ ] 재료 요약 표시 및 필터 옵션 동작
- [ ] API 호출 후 레시피 카드 3개 렌더링
- [ ] 보유/미보유 재료 구분 표시
- [ ] 상세 레시피 모달 동작
- [ ] Step 3로 선택한 레시피 저장 연동
