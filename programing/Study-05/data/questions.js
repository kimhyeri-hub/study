const QUESTIONS = [
  // ─── 한국사 ───────────────────────────────────────────
  {
    id: 1,
    category: '한국사',
    difficulty: '쉬움',
    question: '고조선을 건국한 인물은 누구인가?',
    options: ['주몽', '단군왕검', '박혁거세', '온조'],
    answer: 1
  },
  {
    id: 2,
    category: '한국사',
    difficulty: '쉬움',
    question: '신라, 고구려, 백제가 존재하던 시대를 무엇이라 하는가?',
    options: ['남북국시대', '고려시대', '삼국시대', '통일신라시대'],
    answer: 2
  },
  {
    id: 3,
    category: '한국사',
    difficulty: '쉬움',
    question: '훈민정음을 창제한 조선의 왕은 누구인가?',
    options: ['태종', '세조', '성종', '세종대왕'],
    answer: 3
  },
  {
    id: 4,
    category: '한국사',
    difficulty: '쉬움',
    question: '임진왜란 당시 수군을 이끌고 일본군을 격파한 장군은?',
    options: ['이순신', '권율', '곽재우', '김시민'],
    answer: 0
  },
  {
    id: 5,
    category: '한국사',
    difficulty: '쉬움',
    question: '조선의 수도는 어디인가?',
    options: ['개성', '평양', '한양', '경주'],
    answer: 2
  },
  {
    id: 6,
    category: '한국사',
    difficulty: '보통',
    question: '대한민국 임시정부가 수립된 곳은?',
    options: ['베이징', '상하이', '도쿄', '하얼빈'],
    answer: 1
  },
  {
    id: 7,
    category: '한국사',
    difficulty: '보통',
    question: '3·1 운동이 일어난 연도는?',
    options: ['1910년', '1919년', '1945년', '1950년'],
    answer: 1
  },
  {
    id: 8,
    category: '한국사',
    difficulty: '보통',
    question: '한반도에서 최초로 금속 활자를 사용한 나라는?',
    options: ['신라', '발해', '조선', '고려'],
    answer: 3
  },
  {
    id: 9,
    category: '한국사',
    difficulty: '보통',
    question: '6·25 전쟁이 시작된 연도는?',
    options: ['1948년', '1950년', '1953년', '1945년'],
    answer: 1
  },
  {
    id: 10,
    category: '한국사',
    difficulty: '어려움',
    question: '조선을 건국한 인물은 누구인가?',
    options: ['왕건', '이성계', '견훤', '궁예'],
    answer: 1
  },

  // ─── 과학 ─────────────────────────────────────────────
  {
    id: 11,
    category: '과학',
    difficulty: '쉬움',
    question: '물의 화학식은 무엇인가?',
    options: ['CO₂', 'H₂O₂', 'H₂O', 'NaCl'],
    answer: 2
  },
  {
    id: 12,
    category: '과학',
    difficulty: '보통',
    question: '빛의 속도는 약 몇 km/s인가?',
    options: ['100,000', '300,000', '500,000', '1,000,000'],
    answer: 1
  },
  {
    id: 13,
    category: '과학',
    difficulty: '쉬움',
    question: '태양계에서 부피와 질량이 가장 큰 행성은?',
    options: ['토성', '천왕성', '목성', '해왕성'],
    answer: 2
  },
  {
    id: 14,
    category: '과학',
    difficulty: '보통',
    question: '면적 기준으로 인체에서 가장 큰 기관은?',
    options: ['간', '폐', '피부', '심장'],
    answer: 2
  },
  {
    id: 15,
    category: '과학',
    difficulty: '보통',
    question: '지구에서 달까지의 평균 거리는 약 얼마인가?',
    options: ['38만 km', '150만 km', '5만 km', '100만 km'],
    answer: 0
  },
  {
    id: 16,
    category: '과학',
    difficulty: '쉬움',
    question: '원소 주기율표에서 원자번호 1번 원소는?',
    options: ['헬륨', '산소', '수소', '탄소'],
    answer: 2
  },
  {
    id: 17,
    category: '과학',
    difficulty: '쉬움',
    question: '진화론을 주창한 과학자는?',
    options: ['아이작 뉴턴', '찰스 다윈', '알베르트 아인슈타인', '루이 파스퇴르'],
    answer: 1
  },
  {
    id: 18,
    category: '과학',
    difficulty: '쉬움',
    question: '혈액에서 산소를 운반하는 세포는?',
    options: ['백혈구', '혈소판', '적혈구', '림프구'],
    answer: 2
  },
  {
    id: 19,
    category: '과학',
    difficulty: '보통',
    question: '지구의 대기 중 가장 많은 비율을 차지하는 기체는?',
    options: ['산소', '이산화탄소', '질소', '아르곤'],
    answer: 2
  },
  {
    id: 20,
    category: '과학',
    difficulty: '어려움',
    question: 'DNA의 이중나선 구조를 밝혀낸 과학자는?',
    options: ['왓슨과 크릭', '퀴리 부인', '멘델', '파스퇴르'],
    answer: 0
  },

  // ─── 지리 ─────────────────────────────────────────────
  {
    id: 21,
    category: '지리',
    difficulty: '쉬움',
    question: '국토 면적 기준으로 세계에서 가장 넓은 나라는?',
    options: ['미국', '중국', '러시아', '캐나다'],
    answer: 2
  },
  {
    id: 22,
    category: '지리',
    difficulty: '쉬움',
    question: '나일강이 흐르는 대륙은?',
    options: ['아시아', '아프리카', '남아메리카', '유럽'],
    answer: 1
  },
  {
    id: 23,
    category: '지리',
    difficulty: '쉬움',
    question: '해발고도 기준으로 세계에서 가장 높은 산은?',
    options: ['K2', '마칼루', '칸첸중가', '에베레스트'],
    answer: 3
  },
  {
    id: 24,
    category: '지리',
    difficulty: '보통',
    question: '브라질의 수도는 어디인가?',
    options: ['상파울루', '리우데자네이루', '브라질리아', '살바도르'],
    answer: 2
  },
  {
    id: 25,
    category: '지리',
    difficulty: '보통',
    question: '2025년 기준, 세계에서 인구가 가장 많은 나라는?',
    options: ['미국', '인도', '중국', '인도네시아'],
    answer: 1
  },
  {
    id: 26,
    category: '지리',
    difficulty: '보통',
    question: '한국의 최남단 섬은?',
    options: ['울릉도', '독도', '제주도', '마라도'],
    answer: 3
  },
  {
    id: 27,
    category: '지리',
    difficulty: '쉬움',
    question: '아마존 강이 위치한 대륙은?',
    options: ['북아메리카', '아프리카', '남아메리카', '아시아'],
    answer: 2
  },
  {
    id: 28,
    category: '지리',
    difficulty: '쉬움',
    question: '일본의 수도는?',
    options: ['오사카', '교토', '도쿄', '나고야'],
    answer: 2
  },
  {
    id: 29,
    category: '지리',
    difficulty: '보통',
    question: '전통적인 측정 기준으로 세계에서 가장 긴 강은?',
    options: ['아마존강', '나일강', '양쯔강', '미시시피강'],
    answer: 1
  },
  {
    id: 30,
    category: '지리',
    difficulty: '어려움',
    question: '호주의 수도는?',
    options: ['시드니', '멜버른', '브리즈번', '캔버라'],
    answer: 3
  },

  // ─── 일반상식 ──────────────────────────────────────────
  {
    id: 31,
    category: '일반상식',
    difficulty: '쉬움',
    question: '하계 올림픽은 몇 년마다 개최되는가?',
    options: ['2년', '3년', '4년', '5년'],
    answer: 2
  },
  {
    id: 32,
    category: '일반상식',
    difficulty: '보통',
    question: '유네스코(UNESCO)는 어떤 분야를 담당하는 국제기구인가?',
    options: ['보건·의료', '교육·과학·문화', '무역·경제', '군사·안보'],
    answer: 1
  },
  {
    id: 33,
    category: '일반상식',
    difficulty: '어려움',
    question: '인터넷의 전신으로, 미국 국방부가 1969년에 구축한 초기 네트워크의 이름은?',
    options: ['이더넷', '아르파넷(ARPANET)', 'TCP/IP', 'WWW'],
    answer: 1
  },
  {
    id: 34,
    category: '일반상식',
    difficulty: '보통',
    question: '국제 연합(UN)의 본부가 위치한 도시는?',
    options: ['제네바', '파리', '런던', '뉴욕'],
    answer: 3
  },
  {
    id: 35,
    category: '일반상식',
    difficulty: '쉬움',
    question: '모나리자를 그린 화가는?',
    options: ['미켈란젤로', '레오나르도 다빈치', '라파엘로', '반 고흐'],
    answer: 1
  },
  {
    id: 36,
    category: '일반상식',
    difficulty: '보통',
    question: '빛의 삼원색이 아닌 것은?',
    options: ['빨강', '초록', '노랑', '파랑'],
    answer: 2
  },
  {
    id: 37,
    category: '일반상식',
    difficulty: '어려움',
    question: '1년은 몇 초인가?',
    options: ['약 3,600초', '약 86,400초', '약 31,536,000초', '약 8,760초'],
    answer: 2
  },
  {
    id: 38,
    category: '일반상식',
    difficulty: '보통',
    question: '셰익스피어의 작품이 아닌 것은?',
    options: ['햄릿', '오셀로', '파우스트', '로미오와 줄리엣'],
    answer: 2
  },
  {
    id: 39,
    category: '일반상식',
    difficulty: '보통',
    question: '인터넷 주소(URL)에서 https의 s가 뜻하는 것은?',
    options: ['Speed', '보안(Secure)', 'Server', 'Standard'],
    answer: 1
  },
  {
    id: 40,
    category: '일반상식',
    difficulty: '쉬움',
    question: '대한민국의 국화는?',
    options: ['장미', '진달래', '무궁화', '국화'],
    answer: 2
  }
];
