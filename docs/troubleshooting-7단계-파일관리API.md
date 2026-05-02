# 트러블슈팅 — 7단계 파일 관리 API

## 1. Maven 커맨드라인 빌드 시 Lombok 어노테이션 미처리

### 증상

`mvn package` 실행 시 아래와 같은 컴파일 에러 다수 발생:

```
[ERROR] cannot find symbol
[ERROR]   symbol:   method getUsername()
[ERROR]   location: variable user of type com.retrack.vo.UserVO
```

`@Getter` / `@Setter`로 생성되어야 할 메서드를 찾지 못함.

### 원인

IntelliJ는 Lombok 플러그인이 어노테이션 프로세서를 자동으로 처리하지만,
커맨드라인 `mvn`은 명시적으로 등록하지 않으면 Lombok을 어노테이션 프로세서로 인식하지 못함.

### 해결

`pom.xml`의 `maven-compiler-plugin`에 `annotationProcessorPaths`로 Lombok을 명시 등록.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.8.1</version>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>1.18.34</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

---

## 2. Maven이 Java 25를 사용해 Java 11 프로젝트 빌드 실패

### 증상

1번 문제를 해결한 후에도 아래 에러 발생:

```
[ERROR] Fatal error compiling: java.lang.ExceptionInInitializerError:
        com.sun.tools.javac.code.TypeTag :: UNKNOWN
```

### 원인

Homebrew로 Maven을 설치하면 Homebrew의 기본 JDK(OpenJDK 25)를 사용함.
프로젝트는 Java 11 기준으로 작성되어 있어 내부 컴파일러 API 불일치 발생.

```
# mvn -version 결과
Java version: 25.0.2, vendor: Homebrew  ← 문제 원인
```

### 해결

`JAVA_HOME`을 Java 11 경로로 명시하여 빌드:

```bash
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.0.10.jdk/Contents/Home mvn package
```

### 참고

매번 입력이 번거로우면 셸 프로파일(`~/.zshrc`)에 추가:

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.0.10.jdk/Contents/Home
```
