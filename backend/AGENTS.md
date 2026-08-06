# Retrack 백엔드 — 에이전트 작업 지침

**작업 전에 `backend/CLAUDE.md`를 읽을 것.** 이 디렉터리의 규칙은 전부 그 문서에 있다.

| 섹션 | 내용 |
|---|---|
| 개발 규칙 | 패키지 구조, 네이밍, 응답 형식, 주석 규칙, 주의사항 |
| 파일 저장소 아키텍처 | `com.retrack.storage.FileStorageStrategy` 인터페이스와 구현체 교체 방법 (로컬 ↔ S3) |
| 트랜잭션 처리 | 과제 상태 변경 트랜잭션 설계 |
| 개발 현황 | 1~12단계 완료 내역 — 커밋 전 이 섹션의 최신화 여부를 확인한다 |
| 트러블슈팅 | 단계별 `docs/troubleshooting-*.md` 링크 |

## 이것만은 먼저

- **Spring Boot가 아니다.** Spring Framework 5.3.x + XML 설정 + WAR.
  설정은 `src/main/webapp/WEB-INF/` 의 `web.xml` · `spring-mvc.xml` · `spring-db.xml`
- **Controller에 try-catch를 쓰지 않는다.** `com.retrack.exception`의 커스텀 예외
  (`BadRequestException` / `UnauthorizedException` / `NotFoundException`)를 던지면
  `controller/GlobalExceptionHandler`가 처리한다
- **모든 엔드포인트에 `@RequiredRole`** 로 최소 권한을 명시한다
- **Mapper 인터페이스를 추가하면 XML도 반드시 함께 만든다.** 없으면 `mapperLocations`에서 빈 초기화가 실패한다
- **`resultType`만 쓰지 않는다.** snake_case ↔ camelCase 매핑은 `<resultMap>`으로 한다.
  안 그러면 필드가 조용히 `null`이 된다
- 주석: 신규 `@since YYYY-MM-DD`, 수정 `@modified YYYY-MM-DD 변경 내용`

전역 규칙은 저장소 루트의 `AGENTS.md`에 있다.
