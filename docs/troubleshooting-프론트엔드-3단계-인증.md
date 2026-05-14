# 트러블슈팅 — 프론트엔드 3단계 (인증)

## 1. 로그인 API 403 Forbidden

**증상**
```
POST http://localhost:5173/api/auth/login 403 (Forbidden)
```

**원인**
백엔드 `spring-mvc.xml` CORS 설정이 `http://localhost:3000`만 허용.
Vite 개발 서버는 `5173` 포트를 사용하므로 Spring CORS 필터에서 차단됨.

백엔드 curl 직접 호출은 정상 동작하나, Vite proxy를 통한 브라우저 요청은 `Origin: http://localhost:5173` 헤더가 포함되어 거부됨.

**해결**
`vite.config.js` proxy에 `headers` 옵션 추가 — Origin 헤더를 백엔드 허용 값으로 덮어씀:

```js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    headers: { Origin: 'http://localhost:3000' },
  },
},
```

**배포 시 주의**
배포 환경에서는 Nginx 리버스 프록시가 `/api` 요청을 백엔드로 전달하므로
브라우저 입장에서 CORS가 발생하지 않음. 별도 처리 불필요.
→ `docs/nginx-배포설정.md` 참고
