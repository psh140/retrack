# API 명세

## 인증
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| POST | /api/auth/register | 없음 | 회원가입 |
| POST | /api/auth/login | 없음 | 로그인 |
| POST | /api/auth/logout | ALL | 로그아웃 |

## 사용자 관리
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/users | ADMIN | 사용자 목록 조회 |
| GET | /api/users/{id} | ADMIN | 사용자 상세 조회 |
| PATCH | /api/users/{id}/role | ADMIN | 권한 변경 |
| PATCH | /api/users/{id}/verify | ADMIN | 연구자 인증 승인 |
| DELETE | /api/users/{id} | ADMIN | 사용자 삭제 |

## 과제 관리
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/projects | ALL | 과제 목록 조회 |
| GET | /api/projects/{id} | ALL | 과제 상세 조회 |
| POST | /api/projects | RESEARCHER | 과제 등록 |
| PUT | /api/projects/{id} | RESEARCHER | 과제 수정 |
| PATCH | /api/projects/{id}/status | MANAGER / ADMIN | 과제 상태 변경 |
| DELETE | /api/projects/{id} | ADMIN | 과제 삭제 |
| GET | /api/projects/{id}/history | ALL | 상태 변경 이력 조회 |

## 연구비 관리
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/projects/{id}/budget | ALL | 연구비 목록 조회 |
| POST | /api/projects/{id}/budget | RESEARCHER | 연구비 등록 |
| PUT | /api/projects/{id}/budget/{bid} | RESEARCHER | 연구비 수정 |
| DELETE | /api/projects/{id}/budget/{bid} | ADMIN | 연구비 삭제 |
| GET | /api/projects/{id}/budget/summary | ALL | 연구비 집계 조회 |

## 파일 관리
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/projects/{id}/files | ALL | 파일 목록 조회 |
| POST | /api/projects/{id}/files | RESEARCHER | 파일 업로드 |
| DELETE | /api/projects/{id}/files/{fid} | RESEARCHER / ADMIN | 파일 삭제 |
| GET | /api/projects/{id}/files/{fid} | ALL | 파일 다운로드 |

## 알림
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/notifications | ALL | 내 알림 목록 조회 |
| POST | /api/notifications/send | MANAGER / ADMIN | 알림 발송 |
| GET | /api/notifications/{id} | ALL | 알림 상세 조회 |

## 활동 로그
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/logs | ADMIN | 전체 활동 로그 조회 |
| GET | /api/logs/users/{id} | ADMIN | 특정 사용자 활동 로그 조회 |

## 통계
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/stats/projects/status | ADMIN | 과제 상태별 현황 |
| GET | /api/stats/budget/category | ADMIN | 연구비 카테고리별 집계 |
| GET | /api/stats/budget/burnrate | ADMIN | 과제별 연구비 소진율 |
| GET | /api/stats/notifications/monthly | ADMIN | 월별 알림 발송 건수 |

## 대시보드
| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | /api/dashboard | ALL | 대시보드 요약 데이터 조회 |
