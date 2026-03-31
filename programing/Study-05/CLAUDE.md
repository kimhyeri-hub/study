# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

VibeCoding Study-05: 4지선다 상식 퀴즈 게임. 순수 HTML/CSS/Vanilla JS로 구현하며, 백엔드 없이 정적 파일만으로 동작한다. 순위 기록은 `localStorage`에 저장한다.

## File Structure

```
Study-05/
├── index.html          # 진입점. 4개 screen div를 모두 포함
├── style.css           # 전체 스타일 (모바일 우선, 다크모드 포함)
├── data/
│   └── questions.js    # 문제 데이터만 담는 파일 (로직 없음)
└── js/
    └── app.js          # 모든 게임 로직
```

## Architecture

### 화면 전환 방식
`index.html`에 4개의 screen div(`#screen-start`, `#screen-quiz`, `#screen-result`, `#screen-ranking`)를 모두 선언해두고, `hidden` 클래스 토글로 화면을 전환한다. SPA 라우터나 동적 HTML 생성 방식은 사용하지 않는다.

### State 구조 (`app.js`)
```js
const state = {
  playerName: '',
  selectedCategory: 'all',  // 'all' | '한국사' | '과학' | '지리' | '일반상식'
  questions: [],             // 현재 게임에서 출제할 문제 목록
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  answered: false            // 중복 클릭 방지 플래그
}
```

### 문제 데이터 (`questions.js`)
```js
const QUESTIONS = [
  {
    id: number,
    category: string,    // '한국사' | '과학' | '지리' | '일반상식'
    question: string,
    options: string[],   // 길이 4 고정
    answer: number       // 정답 인덱스 (0~3)
  }, ...
]
```
카테고리별 10문제, 총 40문제. 파일은 데이터만 담고 로직은 포함하지 않는다.

### 게임 플로우
1. `startGame()` — 카테고리 필터링 후 보기 순서 랜덤 섞기 (answer 인덱스도 함께 갱신)
2. `showQuestion()` — 현재 문제 렌더링, 진행률 표시
3. `selectAnswer(idx)` — 정답 비교, 즉시 피드백, `answered = true`로 중복 방지
4. `nextQuestion()` — 2초 자동 전환 또는 버튼 클릭
5. `endGame()` — 점수/등급 계산 → `saveRanking()` → 결과 화면 표시

### 점수 & 등급
- 정답당 10점, 만점 400점
- 등급: 380~400 → S, 300~370 → A, 200~290 → B, 100~190 → C, 0~90 → D

### localStorage 스키마 (순위)
```js
// key: 'quiz_rankings'
[{ name: string, score: number, correct: number, date: string }]
// 점수 내림차순 정렬, 동점이면 date 최신순, 상위 10위만 유지
```

## Development

빌드 도구 없음. 브라우저에서 `index.html`을 직접 열어 확인한다.

```
# 로컬 서버로 실행 (선택)
npx serve .
# 또는
python -m http.server 8080
```

## Conventions

- 언어: UI 텍스트는 한국어, 코드(변수명·함수명)는 영어
- Study-04(`../Study-04/`)의 스타일 패턴(CSS 변수 없이 직접 색상값 사용, 다크모드는 `body.dark` 클래스)을 참고하되 완전히 따르지 않아도 됨
- 키보드 단축키: 숫자키 `1`~`4`로 보기 선택 가능
