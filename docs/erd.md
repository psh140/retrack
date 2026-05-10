# ERD 요약

## 테이블 목록

| 테이블명 | 설명 |
|---|---|
| USERS | 사용자 (권한: VIEWER / RESEARCHER / MANAGER / ADMIN) |
| PROJECTS | 연구과제 |
| PROJECT_HISTORY | 과제 상태 변경 이력 |
| BUDGET | 연구비 사용 내역 |
| FILES | 첨부파일 |
| ACTIVITY_LOGS | 사용자 활동 로그 |
| NOTIFICATIONS | 이메일 알림 발송 이력 |

## 주요 관계

- USERS 1 : N PROJECTS (신청자)
- USERS 1 : N PROJECTS (담당자)
- PROJECTS 1 : N PROJECT_HISTORY
- PROJECTS 1 : N BUDGET
- PROJECTS 1 : N FILES
- PROJECTS 1 : N NOTIFICATIONS
- USERS 1 : N ACTIVITY_LOGS
- USERS 1 : N NOTIFICATIONS

## 과제 상태 흐름

```
DRAFT → SUBMITTED → REVIEWING → APPROVED → IN_PROGRESS → COMPLETED
                                          ↘ REJECTED
```

## BUDGET 카테고리

- PERSONNEL: 인건비
- TRAVEL: 여비
- RESEARCH_ACTIVITY: 연구활동비
- ETC: 기타
