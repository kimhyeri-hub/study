# PRD Step 1 — 냉장고 이미지 인식

## 목표
사용자가 냉장고 사진을 업로드하면 `google/gemma-3-27b-it:free` 모델이 이미지를 분석해 식재료 목록을 추출한다.

---

## 화면 구성

### 메인 화면 (단일 페이지)
- **업로드 영역**: 드래그 앤 드롭 또는 파일 선택 버튼
- **미리보기**: 선택한 이미지 썸네일 표시
- **분석 버튼**: "재료 찾기" 클릭 시 API 호출
- **결과 영역**: 인식된 재료 목록 (태그 형태)
  - 각 태그에 삭제(×) 버튼 — 잘못 인식된 재료 제거 가능
  - "재료 직접 추가" 입력 필드 — 누락된 재료 수동 추가
- **다음 단계 버튼**: "레시피 추천받기" → Step 2로 이동

---

## API 호출 스펙

**Endpoint:** `POST https://openrouter.ai/api/v1/chat/completions`

**Request:**
```json
{
  "model": "google/gemma-3-27b-it:free",
  "messages": [{
    "role": "user",
    "content": [
      {
        "type": "text",
        "text": "이 냉장고 사진에서 보이는 식재료를 모두 찾아줘. JSON 배열 형식으로만 답해줘. 예시: [\"당근\", \"달걀\", \"우유\"]"
      },
      {
        "type": "image_url",
        "image_url": { "url": "<base64 또는 URL>" }
      }
    ]
  }]
}
```

**응답 파싱:**
- `choices[0].message.content`에서 JSON 배열 추출
- 파싱 실패 시 텍스트를 줄바꿈/쉼표로 분리하여 fallback 처리

**이미지 입력 방식:**
- 파일 선택 → `FileReader`로 base64 인코딩 → `data:image/jpeg;base64,...` 형식으로 전송

---

## 상태 관리

```js
const state = {
  imageFile: null,        // File 객체
  imageDataUrl: null,     // base64 미리보기용
  ingredients: [],        // 인식된 재료 목록 (string[])
  isLoading: false,
  error: null,
}
```

---

## 에러 처리

| 상황 | 처리 |
|------|------|
| 이미지 미선택 상태에서 분석 버튼 클릭 | "사진을 먼저 선택해주세요" 안내 |
| API 429 (rate limit) | "잠시 후 다시 시도해주세요" + 재시도 버튼 |
| JSON 파싱 실패 | fallback으로 텍스트 분리 처리, 실패 시 수동 입력 안내 |
| 네트워크 오류 | "연결을 확인해주세요" 메시지 |

---

## 완료 조건
- [ ] 이미지 업로드 및 미리보기 동작
- [ ] API 호출 후 재료 목록 태그로 표시
- [ ] 태그 삭제 및 수동 추가 동작
- [ ] Step 2로 `ingredients` 배열 전달
