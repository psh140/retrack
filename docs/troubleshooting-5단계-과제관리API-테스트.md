# 5단계 과제관리 API 테스트 — 트러블슈팅

날짜: 2026-04-29  
대상: `ProjectController`, `UserController`, `ProjectService`, `UserService`

---

## 이슈 1. POST /api/projects 500 오류 — 원인 불명

### 증상

```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트 과제"}'
# → {"success":false,"message":"서버 오류가 발생했습니다.","data":null}
```

서버가 500을 반환하는데 로그에 아무것도 찍히지 않음.

### 원인

`GlobalExceptionHandler`의 `handleException` 메서드가 예외를 잡은 뒤
메시지만 반환하고 **예외 자체를 로그로 남기지 않기 때문**에 원인 파악이 불가능했음.

```java
// 문제 코드 — 예외 정보가 사라짐
@ExceptionHandler(Exception.class)
public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.fail("서버 오류가 발생했습니다."));
}
```

### 진단 방법

디버깅 시에는 아래처럼 임시로 예외 내용을 응답에 포함시켜 원인을 확인함.

```java
// 임시 디버그용 — 운영 배포 전 반드시 원복
@ExceptionHandler(Exception.class)
public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
    e.printStackTrace(); // stderr → docker logs 에 출력됨
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.fail("서버 오류: " + e.getClass().getSimpleName() + ": " + e.getMessage()));
}
```

### 해결 방안 (장기)

운영 배포 전에 로깅 라이브러리를 도입해야 함.  
현재 프로젝트에 SLF4J 구현체가 없어 `SLF4J: No SLF4J providers were found.` 경고가 뜨는 상태.

`pom.xml`에 Logback 의존성 추가:

```xml
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.12</version>
</dependency>
```

GlobalExceptionHandler에 Logger 적용:

```java
private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

@ExceptionHandler(Exception.class)
public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
    log.error("Unhandled exception", e);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.fail("서버 오류가 발생했습니다."));
}
```

---

## 이슈 2. curl 한글 전송 시 JSON 파싱 오류

### 증상

```
HttpMessageNotReadableException: JSON parse error:
Invalid UTF-8 middle byte 0xd7
at [Source: com.retrack.vo.ProjectRequestVO["title"]]
```

`{"title":"테스트 과제"}` 처럼 한글이 포함된 요청을 Git Bash에서
`curl -d '...'`로 보낼 때 발생.

### 원인

**Git Bash (Windows) 의 쉘 인코딩이 UTF-8이 아닌 CP949(EUC-KR)** 로 동작하는 경우
curl이 한글을 CP949로 인코딩하여 전송하고,
서버는 UTF-8 기준으로 파싱하다가 실패함.

서버 코드 자체의 문제가 아님. `CharacterEncodingFilter`와
`MappingJackson2HttpMessageConverter`의 UTF-8 설정은 정상.

### 확인 방법

아래처럼 ASCII로만 구성된 요청은 정상 처리됨:

```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Research Project 2026"}'
# → {"success":true,"message":"과제가 등록되었습니다.","data":2}
```

또한 서버가 한글을 DB에 정상 저장하고 응답하는 것은 확인됨:

```
k_notifications.message = "과제 '2026 Research Project'이(가) 제출되었습니다."
```

### 해결 방법

Git Bash에서 한글 포함 JSON을 전송할 때는 다음 중 하나를 사용:

**방법 A — Postman 또는 IntelliJ HTTP Client 사용** (권장)

**방법 B — 파일로 분리하여 전송**

```bash
echo '{"title":"테스트 과제"}' > /tmp/body.json
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json; charset=UTF-8" \
  --data-binary @/tmp/body.json
```

**방법 C — Python 스크립트로 요청**

```bash
python -c "
import urllib.request, json
req = urllib.request.Request(
    'http://localhost:8080/api/projects',
    data=json.dumps({'title':'테스트 과제'}).encode('utf-8'),
    headers={'Content-Type':'application/json','Authorization':'Bearer TOKEN'}
)
print(urllib.request.urlopen(req).read().decode())
"
```

---

## 이슈 3. `@Transactional` 적용 여부 확인

### 배경

`ProjectService.changeStatus()`에 `@Transactional`이 선언되어 있으며,
3가지 DB 작업(projects 상태 변경 + project_history INSERT + k_notifications INSERT)이
하나의 트랜잭션으로 묶여야 함.

트랜잭션 매니저가 `spring-db.xml`(루트 컨텍스트)이 아닌 `spring-mvc.xml`(서블릿 컨텍스트)에
선언되어 있어 실제로 동작하는지 확인이 필요했음.

### 확인 결과

정상 동작 확인. 구조상 문제가 없는 이유:

- `spring-mvc.xml`의 `<context:component-scan>`이 Service 빈을 서블릿 컨텍스트에 생성
- `DataSourceTransactionManager`도 동일한 서블릿 컨텍스트에 선언
- `<tx:annotation-driven>`도 동일 컨텍스트에 선언
- `dataSource`는 루트 컨텍스트에 있으나, 서블릿 컨텍스트는 루트 컨텍스트의 빈을 참조 가능

```bash
# DRAFT → SUBMITTED 상태 변경 후 DB 확인
$ docker exec retrack-db psql -U retrack -d retrack \
    -c "SELECT * FROM k_notifications;"

notification_id | user_id | project_id | message                              | status
1               | 5       | 2          | 과제 '...'이(가) 제출되었습니다.    | PENDING
```

projects, project_history, k_notifications 세 테이블 모두 동시에 반영됨.

---

## 테스트 결과 요약

| 항목 | 결과 |
|---|---|
| 사용자 목록/상세/권한변경/인증승인 | ✅ 정상 |
| 잘못된 role 값 → 400 BadRequest | ✅ 정상 |
| 중복 인증 승인 → 400 BadRequest | ✅ 정상 |
| 과제 등록/수정/삭제 | ✅ 정상 |
| 불가 상태 전이 → 400 BadRequest | ✅ 정상 |
| 전체 상태 흐름 (DRAFT→COMPLETED) | ✅ 정상 |
| 상태 변경 이력 조회 | ✅ 정상 |
| 트랜잭션 3-way 원자성 | ✅ 정상 |
| 존재하지 않는 리소스 → 404 | ✅ 정상 |
