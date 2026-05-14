# Nginx 배포 설정 가이드

## 구조

```
브라우저 (80/443포트)
  ↓
Nginx
  ├── /         → React 빌드 파일 (정적 파일 서빙)
  └── /api/**   → 백엔드:8080 (리버스 프록시)
```

브라우저는 모든 요청을 같은 서버(Nginx)로 보내므로 CORS가 발생하지 않음.
개발 환경의 Vite proxy와 동일한 역할을 Nginx가 담당.

---

## Nginx 설정 예시

```nginx
server {
    listen 80;
    server_name _;

    # React 빌드 파일 서빙
    root /usr/share/nginx/html;
    index index.html;

    # React Router 지원 — 새로고침 시 index.html로 폴백
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API 프록시
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 주의사항

**① React Router 폴백 설정 필수**
`try_files $uri $uri/ /index.html` 없으면 `/dashboard` 같은 경로를
새로고침할 때 Nginx가 해당 파일을 찾다가 404 반환.

**② 백엔드 CORS 설정 재검토**
Nginx 프록시 구조에서는 백엔드 CORS 설정이 불필요하지만,
추후 모바일 앱 등 별도 클라이언트가 생기면 그때 다시 설정.

**③ HTTPS 적용 시**
AWS EC2 배포 시 Let's Encrypt 또는 ACM 인증서 적용 권장.
HTTP → HTTPS 리다이렉트 설정 추가 필요.

---

## docker-compose.yml 반영 예시

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./frontend/dist:/usr/share/nginx/html   # React 빌드 결과물
    - ./nginx.conf:/etc/nginx/conf.d/default.conf
  depends_on:
    - backend
```

배포 전 `cd frontend && npm run build` 실행하여 `dist/` 생성 필요.
