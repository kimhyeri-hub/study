# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

VibeCoding Study-06: AI API를 활용하는 프로젝트. OpenRouter를 통해 LLM을 호출한다.

이 레포지토리는 VibeCoding 스터디 시리즈의 일부다:
- Study-04: 할 일 관리 앱 (순수 HTML/CSS/Vanilla JS)
- Study-05: 4지선다 상식 퀴즈 게임 (순수 HTML/CSS/Vanilla JS, localStorage 랭킹)
- Study-06: OpenRouter API 활용 프로젝트 (현재)

## Environment

`OPENROUTER_API_KEY`는 `.env`에 저장되며, `.gitignore`에 반드시 포함되어야 한다.

OpenRouter API 호출 기본 형식:
```js
fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ model: '...', messages: [...] })
})
```

## Conventions (Series-wide)

- 언어: UI 텍스트는 한국어, 코드(변수명·함수명)는 영어
- 빌드 도구 없음. 브라우저에서 `index.html`을 직접 열거나 로컬 서버로 실행:
  ```
  npx serve .
  # 또는
  python -m http.server 8080
  ```
