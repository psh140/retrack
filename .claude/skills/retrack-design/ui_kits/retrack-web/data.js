/* Sample data — realistic Korean research project entries */
window.RT_DATA = {
  projects: [
    { id: 1, code: 'PRJ-2026-001', name: '2026 식품안전성 평가 연구', status: 'IN_PROGRESS', owner: '김연구', manager: '박매니저', budget: 12400000, spent: 4820000, start: '2026-03-01', end: '2026-12-31', category: '식품' },
    { id: 2, code: 'PRJ-2026-002', name: '의약품 표시 가이드라인 개정안 마련', status: 'REVIEWING', owner: '이담당', manager: '박매니저', budget: 8000000, spent: 0, start: '2026-06-01', end: '2026-08-15', category: '의약품' },
    { id: 3, code: 'PRJ-2026-003', name: 'HACCP 인증 컨설팅 사업', status: 'APPROVED', owner: '최연구', manager: '정매니저', budget: 5600000, spent: 1200000, start: '2026-05-15', end: '2026-10-30', category: '식품' },
    { id: 4, code: 'PRJ-2026-004', name: '의료기기 GMP 실태조사', status: 'SUBMITTED', owner: '한연구', manager: '-', budget: 9200000, spent: 0, start: '2026-07-01', end: '2026-12-15', category: '의료기기' },
    { id: 5, code: 'PRJ-2026-005', name: '화장품 안전기준 비교 연구', status: 'COMPLETED', owner: '윤연구', manager: '정매니저', budget: 4800000, spent: 4750000, start: '2025-09-01', end: '2026-02-28', category: '화장품' },
    { id: 6, code: 'PRJ-2026-006', name: '건강기능식품 표시광고 모니터링', status: 'DRAFT', owner: '서연구', manager: '-', budget: 3200000, spent: 0, start: '2026-08-01', end: '2026-11-30', category: '식품' },
    { id: 7, code: 'PRJ-2026-007', name: '의약품 부작용 보고체계 개선', status: 'REJECTED', owner: '강연구', manager: '박매니저', budget: 7800000, spent: 0, start: '-', end: '-', category: '의약품' },
    { id: 8, code: 'PRJ-2026-008', name: '식품첨가물 사용기준 재평가', status: 'IN_PROGRESS', owner: '김연구', manager: '정매니저', budget: 6400000, spent: 2100000, start: '2026-04-01', end: '2026-11-30', category: '식품' },
  ],
  history: [
    { id: 1, status: 'DRAFT', user: '김연구', at: '2026-02-28 14:22', note: '과제 등록' },
    { id: 2, status: 'SUBMITTED', user: '김연구', at: '2026-03-01 09:15', note: '검토 요청' },
    { id: 3, status: 'REVIEWING', user: '박매니저', at: '2026-03-02 11:00', note: '1차 검토 시작' },
    { id: 4, status: 'APPROVED', user: '박매니저', at: '2026-03-05 16:40', note: '예산 12,400,000원 승인' },
    { id: 5, status: 'IN_PROGRESS', user: '김연구', at: '2026-03-08 10:00', note: '착수 보고' },
  ],
  budget: [
    { id: 1, category: 'PERSONNEL', desc: '연구원 인건비 (3월)', amount: 1800000, date: '2026-03-31' },
    { id: 2, category: 'PERSONNEL', desc: '연구보조원 인건비 (3월)', amount: 600000, date: '2026-03-31' },
    { id: 3, category: 'RESEARCH_ACTIVITY', desc: '실험 시약 구매', amount: 850000, date: '2026-04-12' },
    { id: 4, category: 'TRAVEL', desc: '식약처 출장 (대전)', amount: 240000, date: '2026-04-18' },
    { id: 5, category: 'RESEARCH_ACTIVITY', desc: '시료 분석 외주', amount: 1200000, date: '2026-04-25' },
    { id: 6, category: 'ETC', desc: '회의비', amount: 130000, date: '2026-05-02' },
  ],
  budgetSummary: {
    PERSONNEL: 2400000,
    TRAVEL: 240000,
    RESEARCH_ACTIVITY: 2050000,
    ETC: 130000,
  },
  files: [
    { id: 1, name: '연구계획서_v3.pdf', size: '1.2 MB', uploadedBy: '김연구', at: '2026-03-01' },
    { id: 2, name: '예산내역서.xlsx', size: '48 KB', uploadedBy: '김연구', at: '2026-03-01' },
    { id: 3, name: '식품안전성_선행연구.zip', size: '8.6 MB', uploadedBy: '박매니저', at: '2026-03-05' },
  ],
  notifications: [
    { id: 1, title: '과제 PRJ-2026-001 상태가 IN_PROGRESS 로 변경되었습니다', at: '2026-03-08 10:00', read: false },
    { id: 2, title: '과제 PRJ-2026-002 검토가 시작되었습니다', at: '2026-06-02 11:30', read: false },
    { id: 3, title: '연구비 집행 보고서 마감 안내', at: '2026-04-25 09:00', read: true },
  ],
};

window.RT_FMT = {
  won: (n) => n.toLocaleString('ko-KR') + '원',
  num: (n) => n.toLocaleString('ko-KR'),
};
