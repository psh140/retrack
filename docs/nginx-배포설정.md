# Nginx 배포 설정 가이드

## 구조

```
브라우저 (3000포트 → 컨테이너 내부 80포트)
  ↓
Nginx (frontend 컨테이너 내부, 멀티 스테이지 빌드 포함)
  ├── /         → React 빌드 파일 (정적 파일 서빙)
  └── /api/**   → backend 컨테이너:8080 (리버스 프록시)
```

브라우저는 모든 요청을 같은 서버(Nginx)로 보내므로 CORS가 발생하지 않음.
개발 환경의 Vite proxy와 동일한 역할을 Nginx가 담당.

---

## Dockerfile (멀티 스테이지 빌드)

`frontend/Dockerfile`에 빌드와 Nginx 서빙이 함께 포함되어 있음.
별도의 Nginx 컨테이너는 사용하지 않음.

```dockerfile
# Stage 1: React 빌드
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Nginx로 정적 파일 서빙
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## nginx.conf

`frontend/nginx.conf`가 이미지 빌드 시 컨테이너에 포함됨.

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # React Router SPA 폴백 — 새로고침 시 404 방지
    location / {
        try_files $uri /index.html;
    }

    # Docker 내장 DNS — backend 컨테이너 IP를 요청 시마다 재조회한다.
    resolver 127.0.0.11 valid=10s ipv6=off;

    # /api 요청 → backend 컨테이너(8080) 리버스 프록시
    location /api {
        set $backend_host backend;
        proxy_pass http://$backend_host:8080$request_uri;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 업스트림을 변수로 지정하는 이유

`proxy_pass http://backend:8080;`처럼 호스트명을 상수로 쓰면 nginx가 **기동 시점에 한 번만**
DNS를 조회하고 그 IP를 계속 재사용한다. backend 컨테이너를 재생성하면 IP가 바뀌므로
프론트엔드가 옛 IP를 계속 바라보며 모든 `/api` 요청이 502로 실패한다.

변수(`$backend_host`)를 쓰면 요청 시점에 다시 조회하므로 컨테이너 재생성에도 자동 복구된다.
단, 변수를 쓰면 요청 URI가 자동 전달되지 않으므로 `$request_uri`를 반드시 붙여야 한다.

→ 상세 내용: [`troubleshooting-nginx-업스트림-DNS캐싱.md`](troubleshooting-nginx-업스트림-DNS캐싱.md)

---

## docker-compose.yml 설정

```yaml
frontend:
  build: ./frontend
  container_name: retrack-frontend
  ports:
    - "3000:80"       # 호스트 3000 → 컨테이너 내부 nginx 80
  depends_on:
    - backend
```

`3000:80` — 호스트에서 3000번 포트로 접속하면 컨테이너 내부 nginx(80)로 연결됨.

---

## 주의사항

**① React Router 폴백 설정 필수**
`try_files $uri /index.html` 없으면 `/dashboard` 같은 경로를
새로고침할 때 Nginx가 해당 파일을 찾다가 404 반환.

**② 백엔드 CORS 설정 재검토**
Nginx 프록시 구조에서는 백엔드 CORS 설정이 불필요하지만,
추후 모바일 앱 등 별도 클라이언트가 생기면 그때 다시 설정.

**③ HTTPS 적용 시**
AWS EC2 배포 시 Let's Encrypt 또는 ACM 인증서 적용 권장.
HTTP → HTTPS 리다이렉트 설정 추가 필요.

**④ .dockerignore**
`frontend/.dockerignore`에 `node_modules/`, `dist/`, `.env`가 제외 설정되어 있음.
빌드 컨텍스트가 불필요하게 커지는 것을 방지.
