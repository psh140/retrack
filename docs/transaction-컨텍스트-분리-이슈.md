# @Transactional이 동작하지 않은 이유와 해결

> 작성일: 2026-04-28

---

## 무슨 일이 있었나

과제 상태 변경 API(`PATCH /api/projects/{id}/status`)에서  
DB 작업 3개를 하나의 트랜잭션으로 묶으려고 `@Transactional`을 달았는데,  
실제로는 트랜잭션이 적용되지 않고 있었다.

---

## 배경 지식: Spring MVC의 컨텍스트 구조

Spring MVC 프로젝트에는 **컨텍스트(ApplicationContext)가 두 개** 존재한다.

```
┌─────────────────────────────────────────────────────┐
│              루트 컨텍스트 (Root Context)             │
│  로드: ContextLoaderListener → spring-db.xml         │
│  담당: DataSource, SqlSessionFactory, TransactionManager │
│  범위: 앱 전체에서 공유                               │
└──────────────────────┬──────────────────────────────┘
                       │ 부모
┌──────────────────────▼──────────────────────────────┐
│            서블릿 컨텍스트 (Servlet Context)           │
│  로드: DispatcherServlet → spring-mvc.xml            │
│  담당: Controller, Service, Interceptor, Converter   │
│  범위: DispatcherServlet 전용                        │
└─────────────────────────────────────────────────────┘
```

- 서블릿 컨텍스트는 루트 컨텍스트의 빈을 **참조할 수 있다** (부모-자식 관계)
- 반대로 루트 컨텍스트는 서블릿 컨텍스트의 빈을 **모른다**

---

## 문제의 원인

`<tx:annotation-driven>`은 **자신이 선언된 컨텍스트의 빈에만 적용**된다.

처음 설정:
```xml
<!-- spring-db.xml (루트 컨텍스트) -->
<tx:annotation-driven transaction-manager="transactionManager"/>
```

`ProjectService`는 어디에 등록되는가?

```xml
<!-- spring-mvc.xml (서블릿 컨텍스트) -->
<context:component-scan base-package="com.retrack"/>
```

`@Service`가 붙은 `ProjectService`는 `spring-mvc.xml`의 component-scan이 찾아서  
**서블릿 컨텍스트**에 등록한다.

결론:
```
<tx:annotation-driven> 위치 → 루트 컨텍스트
ProjectService 위치       → 서블릿 컨텍스트

→ @Transactional 적용 안 됨
```

---

## @Transactional이 없으면 뭐가 달라지나

`@Transactional`이 없으면 각 MyBatis 쿼리가 **독립적인 트랜잭션**으로 실행된다.  
즉, 자동 커밋(auto-commit) 모드처럼 동작한다.

과제 상태 변경 흐름:

```
① updateStatus()    → 즉시 커밋
② insertHistory()   → 즉시 커밋
③ insertNotification() → 실패!

결과:
  - projects.status 는 바뀐 채로 남아있음
  - project_history 에 이력이 남아있음
  - k_notifications 에는 기록 없음
  → DB 데이터 정합성 깨짐
```

`@Transactional`이 있으면:

```
① updateStatus()
② insertHistory()
③ insertNotification() → 실패!

→ ①②③ 전부 없던 일로 롤백
→ DB는 변경 전 상태 그대로
```

---

## 해결 방법

`spring-mvc.xml`(서블릿 컨텍스트)에도 `<tx:annotation-driven>`을 추가한다.  
`transactionManager` 빈은 루트 컨텍스트에 있지만,  
서블릿 컨텍스트가 루트 컨텍스트 빈을 참조할 수 있으므로 문제없다.

```xml
<!-- spring-mvc.xml (서블릿 컨텍스트) -->
<tx:annotation-driven transaction-manager="transactionManager"/>
```

---

## 롤백 동작 검증

PostgreSQL 트리거로 `insertNotification`(3번 작업)에서 강제 예외를 발생시키고  
앞서 실행된 1번, 2번 작업이 함께 롤백되는지 확인했다.

```
시나리오: 새 과제(status=DRAFT) → SUBMITTED 상태 변경 시도
조건: k_notifications INSERT 직전 트리거로 예외 발생

결과:
  projects.status  → DRAFT 유지 (1번 롤백 확인 ✅)
  project_history  → 이력 0건  (2번 롤백 확인 ✅)
  k_notifications  → 삽입 없음 (3번 실패 확인 ✅)
```

---

## 핵심 정리

| 항목 | 내용 |
|---|---|
| 문제 | `<tx:annotation-driven>`을 루트 컨텍스트에만 선언 |
| 원인 | Service 빈은 서블릿 컨텍스트 소속, 루트의 AOP 설정이 적용 안 됨 |
| 해결 | `spring-mvc.xml`에도 `<tx:annotation-driven>` 추가 |
| 교훈 | Spring MVC XML 설정에서 `@Transactional`은 Service가 등록된 컨텍스트에 선언해야 함 |
