# 트러블슈팅 — 4단계 사용자 관리 API 테스트

> 작성일: 2026-04-28
> 작업 내용: UserMapper / UserService / UserController 구현 후 테스트 과정에서 발생한 문제 정리

---

## 문제 1 — LocalDateTime 직렬화 실패로 JSON 응답이 중간에 깨짐

### 증상

`GET /api/users` 호출 시 응답 JSON이 `createdAt` 필드 직전에 잘리고,  
이후 GlobalExceptionHandler가 서버 오류 응답을 추가로 내려보내 **두 개의 JSON 덩어리**가 이어붙은 형태로 반환됨.

```
{"success":true,"message":"사용자 목록 조회 성공","data":[{..., "createdAt"}]}
{"success":false,"message":"서버 오류가 발생했습니다.","data":null}
```

### 원인

`UserVO`의 `createdAt`, `updatedAt`, `verifiedAt` 필드 타입이 `java.time.LocalDateTime`인데,  
`pom.xml`에 `jackson-datatype-jsr310` 모듈이 없었음.

Jackson은 기본적으로 `LocalDateTime`을 직렬화하는 방법을 모르기 때문에,  
직렬화 도중 예외가 발생해 응답 스트림이 중간에 끊겼고,  
이미 헤더가 전송된 상태에서 GlobalExceptionHandler가 두 번째 JSON을 추가로 썼음.

### 해결

**① `pom.xml`에 의존성 추가**

```xml
<!-- Jackson Java 8 날짜/시간 타입 직렬화 (LocalDateTime 등) -->
<dependency>
  <groupId>com.fasterxml.jackson.datatype</groupId>
  <artifactId>jackson-datatype-jsr310</artifactId>
  <version>2.17.2</version>
</dependency>
```

**② `UserVO` LocalDateTime 필드에 `@JsonFormat` 추가**

```java
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private LocalDateTime verifiedAt;

@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private LocalDateTime createdAt;

@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private LocalDateTime updatedAt;
```

`@JsonFormat`은 출력 형식을 지정하는 역할이며, 실제 직렬화 가능 여부는  
아래 문제 2에서 해결한 `JavaTimeModule` 등록에 의존함.

---

## 문제 2 — ObjectMapper 빈 등록 방식 오류로 Spring 컨텍스트 초기화 실패

### 증상

`spring-mvc.xml`에 `ObjectMapper` 빈을 직접 선언하고  
`<property name="modules">` 로 `JavaTimeModule`을 주입하려 했으나,  
컨테이너 재시작 후 모든 API 요청에서 빈 응답(empty body) 또는 Tomcat 500 HTML 반환.

로그에서 Spring `FrameworkServlet.createWebApplicationContext` 실패 스택 확인.

### 원인

`com.fasterxml.jackson.databind.ObjectMapper`에는 `setModules(List)` 메서드가 존재하지 않음.  
Spring XML의 `<property>` 방식은 setter 주입이기 때문에,  
해당 프로퍼티를 찾을 수 없어 Spring 컨텍스트 자체가 초기화 실패.

```xml
<!-- 잘못된 방식 — ObjectMapper에 setModules() 없음 -->
<bean id="objectMapper" class="com.fasterxml.jackson.databind.ObjectMapper">
    <property name="modules">
        <list>
            <bean class="com.fasterxml.jackson.datatype.jsr310.JavaTimeModule"/>
        </list>
    </property>
</bean>
```

### 해결

`ObjectMapper`를 직접 선언하는 대신, Spring이 제공하는 `Jackson2ObjectMapperFactoryBean`을 사용.  
이 클래스는 `modulesToInstall` 프로퍼티를 통해 모듈 클래스 이름(문자열)을 받아  
내부에서 인스턴스를 생성하고 `ObjectMapper`에 등록해줌.

```xml
<!-- 올바른 방식 — Jackson2ObjectMapperFactoryBean 사용 -->
<bean id="objectMapper" class="org.springframework.http.converter.json.Jackson2ObjectMapperFactoryBean">
    <property name="modulesToInstall">
        <array>
            <value>com.fasterxml.jackson.datatype.jsr310.JavaTimeModule</value>
        </array>
    </property>
</bean>
```

`Jackson2ObjectMapperFactoryBean`은 `FactoryBean<ObjectMapper>`를 구현하므로,  
`ref="objectMapper"`로 참조하면 생성된 `ObjectMapper` 인스턴스가 주입됨.

```xml
<bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter">
    <property name="defaultCharset" value="UTF-8"/>
    <property name="objectMapper" ref="objectMapper"/>
</bean>
```

---

## 최종 테스트 결과

| 테스트 케이스 | HTTP 상태 | 결과 |
|---|---|---|
| `GET /api/users` — 목록 조회 | 200 | ✅ password=null, 날짜 `yyyy-MM-dd HH:mm:ss` 형식 정상 출력 |
| `GET /api/users/1` — 상세 조회 | 200 | ✅ |
| `PATCH /api/users/1/role` — 권한 변경 | 200 | ✅ |
| `PATCH /api/users/1/verify` — 인증 승인 | 200 | ✅ |
| `PATCH /api/users/1/verify` — 중복 인증 시도 | 400 | ✅ "이미 인증된 사용자입니다." |
| `DELETE /api/users/999` — 없는 사용자 삭제 | 404 | ✅ "존재하지 않는 사용자입니다." |
| `PATCH /api/users/1/role` — 잘못된 role 값 | 400 | ✅ "유효하지 않은 권한입니다." |
| `GET /api/users` — 토큰 없이 접근 | 401 | ✅ "로그인이 필요합니다." |
