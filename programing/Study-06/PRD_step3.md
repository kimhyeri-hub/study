# PRD Step 3 — 사용자 프로필 & 레시피 저장

## 목표
사용자 프로필을 생성하고 저장한 레시피를 관리한다. 모든 데이터는 `localStorage`에 저장하며 별도 백엔드 없이 동작한다.

---

## 화면 구성

### 프로필 설정 화면 (최초 1회)
- 닉네임 입력
- 식이 제한 선택 (다중 선택): 채식 / 비건 / 글루텐 프리 / 유제품 제한 / 없음
- 선호 요리 종류 선택 (다중 선택): 한식 / 양식 / 중식 / 일식
- "저장 시작" 버튼 → 프로필 저장 후 저장 레시피 목록으로 이동

### 저장된 레시피 목록 화면
- 상단: 프로필 카드 (닉네임, 저장 레시피 수, 식이 제한 뱃지)
- 레시피 카드 목록:
  - 요리명, 저장 날짜, 난이도, 소요시간
  - 카드 클릭 → 상세 레시피 모달 (Step 2와 동일 형식)
  - 삭제 버튼 (×)
- 빈 상태: "저장된 레시피가 없습니다. 냉장고를 분석해보세요!" + Step 1 이동 버튼
- 하단 네비게이션: 홈(Step 1) / 저장 레시피(Step 3) 탭

---

## 데이터 스키마 (localStorage)

```js
// key: 'fridge_user_profile'
{
  nickname: string,
  dietaryRestrictions: string[],  // ['채식', '글루텐 프리', ...]
  preferredCuisines: string[],    // ['한식', '양식', ...]
  createdAt: string               // ISO 날짜
}

// key: 'fridge_saved_recipes'
[
  {
    id: string,             // Date.now() 기반 고유 ID
    name: string,
    time: number,
    difficulty: string,
    available_ingredients: string[],
    missing_ingredients: string[],
    description: string,
    steps: string[],
    savedAt: string         // ISO 날짜
  }
]
// 최신순 정렬, 최대 50개 보관
```

---

## 상태 관리

```js
const state = {
  profile: null,          // localStorage에서 로드
  savedRecipes: [],       // localStorage에서 로드
  selectedRecipe: null,   // 모달용
}
```

---

## 프로필-레시피 연동

- 프로필의 `dietaryRestrictions`가 있을 경우 Step 2 프롬프트에 자동 반영
  ```
  식이 제한: {profile.dietaryRestrictions.join(", ")}
  선호 요리: {profile.preferredCuisines.join(", ")}
  ```
- Step 2의 필터 기본값을 프로필 `preferredCuisines`로 초기화

---

## 앱 전체 흐름

```
최초 접속
  └── 프로필 없음 → 프로필 설정 화면
  └── 프로필 있음 → Step 1 (이미지 업로드)

Step 1 → Step 2: sessionStorage로 ingredients 전달
Step 2 → Step 3: 레시피 카드의 "저장" 버튼 → localStorage에 추가
하단 탭: 언제든지 Step 1 ↔ Step 3 이동 가능
```

---

## 에러 처리

| 상황 | 처리 |
|------|------|
| localStorage 용량 초과 | 가장 오래된 레시피부터 삭제 후 재시도 |
| 프로필 데이터 손상 | 초기화 후 프로필 설정 화면으로 이동 |

---

## 완료 조건
- [ ] 프로필 최초 설정 및 수정 동작
- [ ] 레시피 저장 및 삭제 동작
- [ ] 저장 레시피 목록 렌더링 (날짜순)
- [ ] 프로필 식이 제한이 Step 2 프롬프트에 반영
- [ ] 하단 탭 네비게이션 동작
