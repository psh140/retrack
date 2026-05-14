# 트러블슈팅 — 12단계 단위 테스트

## 1. JUnit 5 테스트가 실행되지 않는 문제

### 증상
`junit-jupiter` 의존성을 추가하고 `@Test`를 작성했는데 `mvn test` 실행 시 테스트가 0건으로 처리되거나 아예 실행되지 않음.

### 원인
Maven 기본 `maven-surefire-plugin` 버전(2.x)은 JUnit 4 기준으로 동작한다.
JUnit 5(JUnit Platform)를 인식하려면 **3.x 이상**이 필요하다.
Spring Boot는 `spring-boot-starter-test`가 surefire 버전을 자동으로 맞춰주지만,
**Spring Framework(non-Boot) 프로젝트는 직접 명시해야 한다.**

### 해결
`pom.xml`의 `<build><plugins>`에 surefire 버전을 명시한다.

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-surefire-plugin</artifactId>
  <version>3.3.1</version>
</plugin>
```

---

## 2. BCryptPasswordEncoder가 Mock 안 되는 문제

### 증상
`AuthService`를 `@InjectMocks`로 주입하고 `BCryptPasswordEncoder`를 `@Mock`으로 선언해도
실제 BCrypt 로직이 그대로 실행됨. Mock이 주입되지 않음.

### 원인
`AuthService`가 `BCryptPasswordEncoder`를 필드 선언부에서 `new`로 직접 생성한다.

```java
// AuthService.java
private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
```

Mockito의 `@InjectMocks`는 생성자 주입 또는 `@Autowired` 필드만 교체한다.
`new`로 직접 생성된 인스턴스는 Mockito가 접근할 수 없으므로 Mock 주입이 불가능하다.

### 해결
테스트에서 실제 BCrypt 해시를 직접 생성해 `UserVO`에 세팅한다.

```java
// 올바른 테스트 작성 방법
String encoded = new BCryptPasswordEncoder().encode("correct");

UserVO user = new UserVO();
user.setPassword(encoded);

// 틀린 비밀번호 → UnauthorizedException
LoginRequestVO request = new LoginRequestVO();
request.setPassword("wrong");

when(authMapper.findByEmail(any())).thenReturn(user);
assertThrows(UnauthorizedException.class, () -> authService.login(request));
```

### 참고
`BCryptPasswordEncoder`를 생성자 주입으로 바꾸면 Mock 처리가 가능해지지만,
`BCryptPasswordEncoder`는 상태가 없는 유틸 클래스이므로 현행 방식(직접 생성)이 더 자연스럽다.
테스트에서도 실제 인스턴스를 쓰는 것이 BCrypt 동작 자체를 함께 검증하는 효과가 있다.
