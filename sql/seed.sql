-- =============================================
-- Retrack - 개발용 테스트 데이터
-- 모든 계정 비밀번호: admin1234
-- 운영 환경에서는 docker-compose.yml의 해당 volumes 마운트 줄을 제거할 것
-- =============================================

-- 사용자 5명 (ADMIN / MANAGER / RESEARCHER×2 / VIEWER)
INSERT INTO users (user_id, username, password, email, phone, role, is_verified, verified_at)
OVERRIDING SYSTEM VALUE VALUES
(1, '관리자',   '$2a$10$V/xI.q/RfRlQ5NeaiCTcp.mSIKQ/F9Cq6RJOoiFjMW5dC97bRtjGG', 'admin@test.com',       '010-0000-0001', 'ADMIN',      true,  NOW()),
(2, '김매니저', '$2a$10$V/xI.q/RfRlQ5NeaiCTcp.mSIKQ/F9Cq6RJOoiFjMW5dC97bRtjGG', 'manager@test.com',     '010-0000-0002', 'MANAGER',    true,  NOW()),
(3, '박연구원', '$2a$10$V/xI.q/RfRlQ5NeaiCTcp.mSIKQ/F9Cq6RJOoiFjMW5dC97bRtjGG', 'researcher1@test.com', '010-0000-0003', 'RESEARCHER', true,  NOW()),
(4, '이연구원', '$2a$10$V/xI.q/RfRlQ5NeaiCTcp.mSIKQ/F9Cq6RJOoiFjMW5dC97bRtjGG', 'researcher2@test.com', '010-0000-0004', 'RESEARCHER', true,  NOW()),
(5, '최뷰어',   '$2a$10$V/xI.q/RfRlQ5NeaiCTcp.mSIKQ/F9Cq6RJOoiFjMW5dC97bRtjGG', 'viewer@test.com',      '010-0000-0005', 'VIEWER',     false, NULL);
SELECT setval('users_user_id_seq', 5);

-- 과제 4건 (APPROVED / IN_REVIEW / DRAFT / COMPLETED)
INSERT INTO projects (project_id, title, description, status, user_id, manager_id, start_date, end_date, budget_total)
OVERRIDING SYSTEM VALUE VALUES
(1, 'AI 기반 신약 개발 연구',         'LLM을 활용한 후보물질 발굴 및 독성 예측 모델 개발', 'APPROVED',  3, 2,    '2026-01-01', '2026-12-31', 30000000),
(2, '빅데이터 분석 플랫폼 구축',      '임상 데이터 통합·분석 플랫폼 설계 및 구현',         'IN_REVIEW', 3, 2,    '2026-03-01', '2026-09-30', 15000000),
(3, '스마트 의약품 유통 추적 시스템',  'RFID 기반 콜드체인 실시간 모니터링 시스템',         'DRAFT',     4, NULL, '2026-06-01', '2027-05-31', 20000000),
(4, '임상시험 데이터 관리 시스템',    'EDC 시스템 고도화 및 HL7 FHIR 연동',               'COMPLETED', 4, 2,    '2025-01-01', '2025-12-31', 10000000);
SELECT setval('projects_project_id_seq', 4);

-- 연구비 (과제 1·4 집행 내역)
INSERT INTO budget (project_id, category, description, amount, used_by, used_at) VALUES
(1, 'PERSONNEL', '연구원 인건비 1월',  5000000, 3, '2026-01-31 18:00:00'),
(1, 'TRAVEL',    '학회 출장비',        1000000, 3, '2026-02-15 09:00:00'),
(1, 'EQUIPMENT', '서버 구축비',        3000000, 3, '2026-01-20 14:00:00'),
(4, 'PERSONNEL', '연구원 인건비 전체', 6000000, 4, '2025-12-31 18:00:00'),
(4, 'SUPPLIES',  '소모품비',            800000, 4, '2025-06-30 12:00:00');

-- 상태 변경 이력
INSERT INTO project_history (project_id, changed_by, prev_status, new_status, comment) VALUES
(1, 3, 'DRAFT',     'IN_REVIEW', '연구계획서 제출 완료'),
(1, 2, 'IN_REVIEW', 'APPROVED',  '예산 및 계획 검토 완료. 승인'),
(2, 3, 'DRAFT',     'IN_REVIEW', '기획서 제출'),
(4, 4, 'DRAFT',     'IN_REVIEW', '최종 보고서 제출'),
(4, 2, 'IN_REVIEW', 'APPROVED',  '검토 완료'),
(4, 2, 'APPROVED',  'COMPLETED', '과제 종료 처리');

-- 알림 (과제 상태 변경 알림)
INSERT INTO notifications (user_id, project_id, message, status, sent_at) VALUES
(3, 1, '[AI 기반 신약 개발 연구] 상태가 DRAFT → IN_REVIEW 로 변경되었습니다.',        'SENT', '2026-01-10 10:00:00'),
(3, 1, '[AI 기반 신약 개발 연구] 상태가 IN_REVIEW → APPROVED 로 변경되었습니다.',     'SENT', '2026-01-15 14:00:00'),
(3, 2, '[빅데이터 분석 플랫폼 구축] 상태가 DRAFT → IN_REVIEW 로 변경되었습니다.',     'SENT', '2026-03-05 09:30:00'),
(4, 4, '[임상시험 데이터 관리 시스템] 상태가 APPROVED → COMPLETED 로 변경되었습니다.', 'SENT', '2025-12-31 17:00:00');

-- 활동 로그
INSERT INTO activity_logs (user_id, action, target_type, target_id, description) VALUES
(1, 'LOGIN',          NULL,      NULL, '관리자 로그인'),
(3, 'LOGIN',          NULL,      NULL, '박연구원 로그인'),
(3, 'CREATE_PROJECT', 'PROJECT', 1,    '과제 등록: AI 기반 신약 개발 연구'),
(3, 'CREATE_PROJECT', 'PROJECT', 2,    '과제 등록: 빅데이터 분석 플랫폼 구축'),
(4, 'CREATE_PROJECT', 'PROJECT', 3,    '과제 등록: 스마트 의약품 유통 추적 시스템'),
(2, 'CHANGE_STATUS',  'PROJECT', 1,    '과제 상태 변경: IN_REVIEW → APPROVED');
