# 트러블슈팅 — 5단계 과제 관리 프론트엔드 (2026-05-18)

## 1. 과제 상태 `IN_REVIEW` 레이블 미표시

### 증상

과제 목록(`/projects`)에서 특정 과제의 상태가 한글 태그 없이 `IN_REVIEW` 문자열 그대로 출력됨.

### 원인

`sql/seed.sql` 작성 시 백엔드 유효값을 코드에서 확인하지 않고 직접 입력하여 오타 발생.

| 위치 | 사용 값 |
|---|---|
| `sql/seed.sql` | `IN_REVIEW` |
| `ProjectService.VALID_STATUSES` | `REVIEWING` |

백엔드가 DB에 저장하는 값은 항상 `VALID_STATUSES` 목록에서만 나오므로 실제 서비스 데이터에서는 발생하지 않지만, 시드 데이터가 잘못된 값을 직접 INSERT하면서 발생.

### 해결

1. `sql/seed.sql` 내 `IN_REVIEW` 전체를 `REVIEWING`으로 수정 (replace_all)
2. DB 재시딩:
   ```sql
   TRUNCATE activity_logs, notifications, project_history, budget, projects, users RESTART IDENTITY CASCADE;
   ```
   ```bash
   docker exec -i retrack-db psql -U retrack -d retrack < sql/seed.sql
   ```

### 교훈

시드 데이터 작성 시 상태값·카테고리 등 열거형 문자열은 반드시 백엔드 코드에서 직접 확인한다.

| 확인 대상 | 위치 |
|---|---|
| 과제 상태 | `ProjectService.VALID_STATUSES` |
| 과제 상태 전이 | `ProjectService.VALID_TRANSITIONS` |
| 연구비 카테고리 | `BudgetService.VALID_CATEGORIES` |
