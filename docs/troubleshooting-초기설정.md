# 초기 설정 트러블슈팅

---

## 1. mvc:annotation-driven + RequestMappingHandlerAdapter 충돌 (2026-04-16)

**증상**: API 호출 시 Tomcat 400 HTML 응답 반환, Spring 컨트롤러까지 요청이 도달하지 않음

**원인**: `mvc:annotation-driven`과 수동 `RequestMappingHandlerAdapter` 빈을 동시에 선언하면 두 개의 핸들러 어댑터가 충돌

**해결**: 수동 `RequestMappingHandlerAdapter` 빈 제거, `mvc:annotation-driven` 내부에 `mvc:message-converters`로 통합

```xml
<mvc:annotation-driven>
    <mvc:message-converters>
        <bean class="org.springframework.http.converter.StringHttpMessageConverter">
            <property name="defaultCharset" value="UTF-8"/>
        </bean>
        <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter">
            <property name="defaultCharset" value="UTF-8"/>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>
```

---

## 2. Jackson 한글 JSON 파싱 오류 (Invalid UTF-8 middle byte) (2026-04-16)

**증상**: 한글이 포함된 JSON 요청 시 `HttpMessageNotReadableException: Invalid UTF-8 middle byte 0xd7` 오류

**원인**: `mvc:annotation-driven` 기본 설정에서 `MappingJackson2HttpMessageConverter`의 charset이 명시되지 않아 한글 파싱 실패

**해결**: `MappingJackson2HttpMessageConverter`에 `defaultCharset UTF-8` 명시 (위 코드 참고)
