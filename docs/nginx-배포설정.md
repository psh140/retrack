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

**③ HTTPS (적용 완료)**
운영에는 Let's Encrypt 인증서를 적용했고 HTTP → HTTPS 리다이렉트도 설정되어 있음.
구성은 아래 「운영 설정에서 판단한 것들」 참고.

**④ .dockerignore**
`frontend/.dockerignore`에 `node_modules/`, `dist/`, `.env`가 제외 설정되어 있음.
빌드 컨텍스트가 불필요하게 커지는 것을 방지.

---

## 운영 설정에서 판단한 것들

아래는 운영용 `frontend/nginx.prod.conf`에 적용된 내용이다.
HTTPS 적용 이후의 구성이므로 위 `nginx.conf`(로컬용)와는 다르다.

### 설정 파일을 둘로 나눈 이유

443 서버 블록은 **인증서 파일이 실재해야 nginx가 기동한다.**
한 파일에 80과 443을 함께 넣으면, 인증서가 없는 로컬 개발 환경에서
프론트엔드 컨테이너가 기동 자체를 실패한다.

| 환경 | 파일 | 적용 방식 |
|---|---|---|
| 로컬 개발 | `frontend/nginx.conf` (80만) | Dockerfile이 이미지에 COPY |
| 운영(EC2) | `frontend/nginx.prod.conf` (80 리다이렉트 + 443) | `docker-compose.prod.yml`에서 볼륨 마운트로 덮어쓰기 |

볼륨 마운트 방식이라 설정만 바꿀 때는 이미지 재빌드 없이 컨테이너 재생성으로 반영된다.

### `add_header`는 상속되지 않는다

nginx의 `add_header`에는 함정이 있다.
**하위 블록에 `add_header`가 하나라도 있으면 상위 블록의 것을 전혀 상속하지 않는다.**
일부만 덮어쓰는 것이 아니라 통째로 사라진다.

정적 자산 location에 캐시 헤더 하나를 추가한 순간, 서버 블록에 선언해 둔
보안 헤더 네 종이 그 경로에서만 빠지게 된다.

```nginx
location ~* \.(js|css|svg|woff2?|ico|png|jpg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";

    # 위에 add_header가 생겼으므로 server 블록의 헤더가 상속되지 않는다 — 다시 선언한다
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

응답 헤더를 눈으로 확인하지 않으면 알아채기 어려운 종류의 누락이다.

### `client_max_body_size`는 백엔드와 맞춰야 한다

nginx의 기본 요청 본문 상한은 **1MB**이고, 백엔드 `spring-mvc.xml`의
`maxUploadSize`는 **10MB**다. nginx 쪽을 올려두지 않으면 두 값이 어긋난다.

```nginx
client_max_body_size 10m;
```

어긋났을 때의 증상이 특히 헷갈린다.
1MB를 넘는 업로드는 **백엔드에 도달하기 전에 nginx가 끊는다.**
그래서 `GlobalExceptionHandler`의 `MaxUploadSizeExceededException` 핸들러가 실행되지 않고,
JSON 대신 nginx 기본 413 HTML 페이지가 그대로 사용자에게 노출된다.
프론트엔드는 JSON을 기대하고 파싱하다 또 다른 오류를 낸다.

백엔드 예외 핸들러가 동작하려면 요청이 백엔드까지 도달해야 한다.
따라서 nginx 상한은 백엔드 상한보다 작으면 안 된다.

### HTTPS 403 대응 — 두 겹으로 막아둔 이유

HTTPS 전환 직후 로그인·회원가입이 403으로 막혔다.
브라우저는 `Origin: https://hughpark.com`을 보내는데 nginx는 백엔드로 HTTP로 프록시하므로,
백엔드가 인식하는 scheme은 `http`다. Spring은 둘을 cross-origin으로 판정했고
`allowed-origins`에는 개발용 주소만 있어 차단됐다.

조치는 두 가지이고, **둘 다 유지한다.**

```nginx
# nginx.prod.conf — Origin 헤더 제거
proxy_set_header Origin "";
```

```xml
<!-- spring-mvc.xml — 운영 도메인을 허용 목록에 추가 -->
```

Origin 제거만으로도 동작한다. nginx 뒤는 항상 동일 출처이므로 Origin을 전달할 이유가 없고,
헤더가 비면 Spring이 CORS 검사를 건너뛴다.

그럼에도 백엔드 설정을 함께 고친 것은 **nginx를 거치지 않는 접근 경로**에 대비한 것이다.
지금은 모든 트래픽이 nginx를 지나지만, 그 전제가 깨지는 순간
nginx 쪽 조치는 아무 역할도 하지 못한다.
한쪽이 무력화돼도 다른 쪽이 남도록 두 곳에 모두 반영해 두었다.

→ 발생 경위와 조치 과정: [`배포-작업기록.md`](배포-작업기록.md) 8-1
