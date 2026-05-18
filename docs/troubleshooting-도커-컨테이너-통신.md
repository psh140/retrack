# 트러블슈팅 — Docker 컨테이너 통신

## 1. frontend 컨테이너 시작 실패 — `Missing script: "start"`

### 증상

```
npm error Missing script: "start"
```

`docker-compose up -d frontend` 후 컨테이너가 즉시 종료됨.

### 원인

`frontend/Dockerfile`의 CMD가 `npm start`였으나, `package.json`에는 `start` 스크립트가 없고 `dev`(Vite)만 존재함.

### 해결

`frontend/Dockerfile` CMD 수정:

```dockerfile
# 수정 전
CMD ["npm", "start"]

# 수정 후
CMD ["npm", "run", "dev", "--", "--host", "--port", "3000"]
```

- `--host`: 컨테이너 외부(호스트)에서 접근 가능하도록 모든 인터페이스에 바인딩
- `--port 3000`: docker-compose.yml의 포트 매핑(`3000:3000`)과 일치시킴

---

## 2. Vite proxy가 백엔드를 찾지 못함

### 증상

프론트엔드에서 `/api/*` 요청 시 백엔드에 도달하지 못하거나 연결 오류 발생.

### 원인

`vite.config.js`의 proxy target이 `http://localhost:8080`으로 설정되어 있었음.  
Docker 컨테이너 내부에서 `localhost`는 백엔드가 아닌 프론트엔드 컨테이너 자신을 가리킴.

### 해결

#### `frontend/vite.config.js`

환경변수 `BACKEND_HOST`를 참조하도록 수정:

```js
target: process.env.BACKEND_HOST || 'http://localhost:8080',
```

#### `docker-compose.yml` — frontend 서비스에 환경변수 추가

```yaml
frontend:
  environment:
    BACKEND_HOST: http://retrack-backend:8080
```

컨테이너 간 통신은 서비스 이름(`retrack-backend`)을 호스트명으로 사용.  
로컬에서 `npm run dev`를 직접 실행할 때는 `BACKEND_HOST`가 없으므로 `localhost:8080` 기본값이 사용됨.

### 검증

```bash
# 401 Unauthorized 응답이 오면 백엔드까지 정상 도달한 것
docker exec retrack-frontend wget -q -O - --server-response http://localhost:3000/api/dashboard
```

---

## 3. `VITE_API_URL` 환경변수 제거

### 배경

`frontend/.env`에 `VITE_API_URL=/api`가 있었고, `api/index.js`에서 이를 참조했음.

```js
// 수정 전
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```

개발(Vite proxy)과 배포(Nginx 리버스 프록시) 모두 `/api`로 라우팅하는 구조라 환경에 따라 값이 달라지지 않음.  
또한 루트 `.gitignore`의 `*.env` 패턴에 의해 `frontend/.env`가 gitignore되어, pull 후 파일이 없으면 `baseURL`이 `undefined`가 되는 잠재적 문제가 있었음.

### 해결

`/api`로 하드코딩하고 `frontend/.env` 파일 삭제:

```js
// 수정 후
const api = axios.create({
  baseURL: '/api',
});
```
