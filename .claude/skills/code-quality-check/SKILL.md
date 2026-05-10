---
name: code-quality-check
description: >
  Retrack 코드 품질 검증 스킬. quality-guardian 에이전트가 사용.
  Java 파일의 Javadoc 주석, Controller/Service/Mapper 규칙 준수, MyBatis XML 주석 및 resultMap 설계를 검증하고 직접 수정한다.
  "주석 확인해줘", "규칙 검증해줘", "코드 리뷰", "품질 체크" 요청 시에도 이 스킬을 사용할 것.
---

# Retrack 코드 품질 검증 가이드

## 검증 순서

1. 대상 파일 목록 수집
2. 각 파일을 읽어 위반 사항 식별
3. 위반 사항 직접 수정 (보고만 하지 않음)
4. 수정 완료 목록 보고

## Java 파일 검증 기준

### 주석 (최우선)

**클래스/인터페이스 Javadoc 패턴:**
```java
/**
 * 연구과제 관련 REST API 엔드포인트를 제공하는 컨트롤러.
 */
@RestController
public class ProjectController {
```

**메서드 Javadoc 패턴:**
```java
/**
 * 연구과제 목록을 조회한다.
 * ADMIN/MANAGER는 전체 조회, RESEARCHER/VIEWER는 본인 관련만 조회한다.
 */
@GetMapping
public ResponseEntity<ApiResponse<List<ProjectVO>>> getList(...) {
```

위반 기준:
- 클래스 선언 바로 위에 `/**`로 시작하는 블록이 없으면 위반
- public 메서드 위에 `/**`로 시작하는 줄이 없으면 위반
- 단 한 줄(`/** 설명 */`)이어도 존재하면 통과

### Controller 규칙

| 항목 | 통과 | 위반 |
|------|------|------|
| 클래스 어노테이션 | `@RestController` 있음 | 없음 |
| 엔드포인트 권한 | 모든 메서드에 `@RequiredRole` | 하나라도 누락 |
| 예외 처리 | try-catch 없음 | try-catch 있음 |
| userId 추출 | `request.getAttribute("userId")` | 직접 파싱 |

### Service 규칙

| 항목 | 통과 | 위반 |
|------|------|------|
| 클래스 어노테이션 | `@Service` 있음 | 없음 |
| 로거 | `@Slf4j` 있음 | Logger 직접 선언 |
| 예외 타입 | BadRequestException 등 커스텀 예외 | IllegalArgumentException |
| 트랜잭션 | 다중 Mapper 호출 시 `@Transactional` | 누락 (단일 Mapper 호출은 불필요) |

### Mapper 규칙

| 항목 | 통과 | 위반 |
|------|------|------|
| 클래스 어노테이션 | `@Mapper` 있음 | 없음 |
| 반환 타입 | XML의 resultMap/resultType과 일치 | 불일치 (runtime 에러 원인) |

### VO 규칙

| 항목 | 통과 | 위반 |
|------|------|------|
| 날짜 필드 | `@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")` | 누락 (JSON 직렬화 실패) |
| 필드명 | camelCase | snake_case |

## MyBatis XML 검증 기준

### 주석

```xml
<!-- 위반: 주석 없음 -->
<select id="findAll" resultMap="projectResultMap">
    SELECT * FROM projects
</select>

<!-- 통과: 목적 설명 주석 있음 -->
<!-- 과제 전체 목록을 최신순으로 조회한다 -->
<select id="findAll" resultMap="projectResultMap">
    SELECT * FROM projects ORDER BY created_at DESC
</select>
```

### resultMap 필요성 판단

snake_case 컬럼이 있는 테이블은 resultMap 필수:
- projects: `project_id`, `user_id`, `manager_id`, `budget_total`, `start_date`, `end_date`, `created_at`, `updated_at`
- users: `user_id`, `is_verified`, `created_at`
- 기타 모든 테이블의 `*_id`, `*_at`, `*_name` 컬럼

resultType만 쓰면 이 컬럼들이 null로 반환됨.

### 경계면 비교

VO 필드명과 resultMap property가 1:1 매칭되어야 함:

```
VO: private Long projectId;
XML: <id property="projectId" column="project_id"/>  ← 일치 필수
```

불일치 발견 시: XML의 property를 VO 필드명에 맞게 수정.

## 수정 우선순위

1. **주석 누락** — 직접 추가 (기능 변경 없음, 가장 안전)
2. **resultMap 누락** — XML에 resultMap 추가 (null 버그 원인)
3. **예외 타입 오류** — 커스텀 예외로 교체 (동작은 같지만 규칙 위반)
4. **경계면 불일치** — property 수정 (버그 원인)
5. **@RequiredRole 누락** — 추가 (보안 문제)
