# 트러블슈팅 — Nginx 업스트림 DNS 캐싱 (백엔드 재생성 후 502)

작성일: 2026-07-29

## 1. 백엔드 컨테이너 재생성 후 모든 API 요청이 502

**증상**

브라우저에서 로그인을 시도하면 "로그인에 실패했습니다" 토스트만 뜨고 진행되지 않음.
개발자 도구 Network 탭에서 확인한 응답:

```
POST http://localhost:3000/api/auth/login  →  502 Bad Gateway
```

백엔드를 직접 호출하면 정상 동작한다. 즉 백엔드 자체는 문제가 없다.

```bash
# 8080 직접 호출 — 정상
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.com","password":"admin1234"}'
# {"success":true,"message":"로그인 성공", ...}  HTTP 200

# 3000(Nginx 프록시) 경유 — 실패
curl -X POST http://localhost:3000/api/auth/login ...
# HTTP 502
```

**원인**

`docker logs retrack-frontend`에 원인이 그대로 찍힌다.

```
[error] connect() failed (111: Connection refused) while connecting to upstream,
upstream: "http://172.18.0.2:8080/api/auth/login"
```

Nginx는 `proxy_pass`에 **상수 호스트명**을 쓰면 기동 시점에 딱 한 번 DNS를 조회하고
그 IP를 프로세스가 살아있는 동안 계속 재사용한다.

```nginx
proxy_pass http://backend:8080;   # 기동 시점에 172.18.0.2로 고정됨
```

Docker 컨테이너 IP는 **재생성될 때마다 바뀐다.** (`restart`는 유지되지만
`docker-compose up -d --force-recreate` 등으로 컨테이너를 새로 만들면 변경됨)

```
backend 재생성 →  172.18.0.2 → 172.18.0.3 으로 변경
frontend        →  여전히 172.18.0.2 를 바라봄  →  Connection refused → 502
```

프론트엔드 컨테이너를 재시작하면 DNS를 다시 조회하므로 증상이 사라진다.
이 때문에 원인을 오해하기 쉽다 — **프론트엔드 코드나 빌드 문제가 아니다.**

**임시 해결**

```bash
docker restart retrack-frontend
```

**근본 해결**

`frontend/nginx.conf`에서 업스트림 호스트를 변수로 지정하고,
Docker 내장 DNS(`127.0.0.11`)를 resolver로 등록한다.
변수를 쓰면 Nginx가 기동 시점 IP를 고정하지 않고 요청 시점에 다시 조회한다.

```nginx
server {
    listen 80;
    server_name _;

    # Docker 내장 DNS — backend 컨테이너 IP를 요청 시마다 재조회한다.
    resolver 127.0.0.11 valid=10s ipv6=off;

    location /api {
        set $backend_host backend;
        proxy_pass http://$backend_host:8080$request_uri;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

| 항목 | 이유 |
|---|---|
| `resolver 127.0.0.11` | Docker 내장 DNS 서버 주소. 변수 `proxy_pass` 사용 시 resolver가 없으면 기동 실패 |
| `valid=10s` | 조회 결과 캐싱 시간. 컨테이너 재생성 후 최대 10초 안에 복구 |
| `ipv6=off` | Docker 내장 DNS는 AAAA 레코드를 주지 않음. 불필요한 조회 제거 |
| `set $backend_host backend;` | 변수로 지정해야 요청 시점 재조회가 일어남 |
| `$request_uri` | **변수를 쓰면 요청 URI가 자동 전달되지 않으므로 반드시 명시해야 한다.** 빠뜨리면 모든 요청이 `/`로 전달됨 |

`nginx.conf`는 이미지 빌드 시점에 복사되므로, 수정 후 **재빌드**가 필요하다.

```bash
docker-compose build frontend
docker-compose up -d --force-recreate frontend
docker exec retrack-frontend nginx -t   # 문법 검증
```

**검증 방법**

컨테이너를 그냥 재생성하면 IP가 그대로일 수 있어 검증이 안 된다.
더미 컨테이너로 기존 IP를 선점해 백엔드가 새 IP를 받도록 강제한다.

```bash
# 1. 백엔드 중지 후 더미 컨테이너가 기존 IP를 가져가게 함
docker stop retrack-backend
docker run -d --name ip-squatter --network retrack_default alpine sleep 300

# 2. 백엔드 재기동 → 새 IP 할당
docker start retrack-backend
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' retrack-backend

# 3. 프론트엔드를 재시작하지 않은 상태로 프록시 경유 호출
curl -s -o /dev/null -w "HTTP %{http_code}\n" \
  -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.com","password":"admin1234"}'

# 4. 정리
docker rm -f ip-squatter
```

적용 후 실측 결과 — 백엔드 IP가 `172.18.0.3` → `172.18.0.5`로 바뀌었으나
프론트엔드 재시작 없이 `HTTP 200` 유지.

---

## 2. (함께 발견) 배포된 WAR가 옛 빌드본이라 DB 인증 실패

**증상**

`.env`에 `DB_PASSWORD`를 설정하고 컨테이너를 재생성했는데도 로그인 API가 500을 반환.

```
org.postgresql.util.PSQLException: FATAL: password authentication failed for user "retrack"
```

컨테이너 환경변수는 정상적으로 주입된 상태였다.

```bash
docker exec retrack-backend printenv DB_PASSWORD   # .env 값과 일치
```

**원인**

`docker-compose.yml`은 `backend/target/*.war`를 마운트한다.
소스의 `spring-db.xml`은 환경변수 참조로 바뀌었지만,
**배포 중이던 WAR는 그 변경 이전에 빌드된 것**이라 내부에 옛 비밀번호가 하드코딩돼 있었다.

```bash
unzip -p backend/target/retrack-backend-1.0-SNAPSHOT.war WEB-INF/spring-db.xml | grep password
# <property name="password" value="retrack1234"/>   ← 옛 값
```

**해결**

WAR를 재빌드한다. 프로젝트는 Java 11 기준이므로 JDK 버전을 지정해야 한다.

```bash
cd backend
JAVA_HOME=$(/usr/libexec/java_home -v 11) mvn clean package -DskipTests
```

빌드 후 내용 확인:

```bash
unzip -p backend/target/retrack-backend-1.0-SNAPSHOT.war WEB-INF/spring-db.xml | grep password
# <property name="password" value="#{systemEnvironment['DB_PASSWORD']}"/>
```

**주의 — `mvn clean` 직후 컨테이너 restart 실패**

`clean`이 WAR 파일을 지우는 순간 Docker의 마운트 소스가 사라져 `docker restart`가 실패한다.

```
Error response from daemon: Cannot restart container retrack-backend:
error while creating mount source path '...war': no such file or directory
```

`restart` 대신 컨테이너를 재생성하면 해소된다.

```bash
docker-compose up -d --force-recreate backend
```

---

## 3. (함께 발견) 기존 DB 볼륨은 `POSTGRES_PASSWORD` 변경이 반영되지 않음

**증상**

`.env`의 `DB_PASSWORD`를 새 값으로 바꿨는데 DB 인증이 계속 실패.

**원인**

`POSTGRES_PASSWORD`는 **볼륨이 비어 있을 때(최초 초기화 시)만** 적용된다.
`retrack_postgres-data` 볼륨이 이미 존재하면 값을 바꿔도 무시되고,
DB 안의 계정은 예전 비밀번호를 그대로 유지한다.

**해결**

데이터를 유지하면서 계정 비밀번호만 변경한다.
컨테이너 내부 소켓 접속은 trust 인증이라 비밀번호 없이 실행 가능하다.

```bash
docker exec retrack-db psql -U retrack -d retrack \
  -c "ALTER USER retrack WITH PASSWORD '새비밀번호';"
```

데이터를 버려도 되는 개발 환경이라면 볼륨을 삭제해 재초기화해도 된다.
(`sql/seed.sql`이 자동 실행되므로 테스트 데이터는 복구된다)

```bash
docker-compose down
docker volume rm retrack_postgres-data
docker-compose up -d db backend frontend
```

---

## 정리 — 컨테이너 재생성 시 체크리스트

| 상황 | 필요한 조치 |
|---|---|
| `spring-db.xml` 등 백엔드 소스 수정 | Maven 재빌드 (JDK 11) 후 `--force-recreate` |
| `nginx.conf` 수정 | `docker-compose build frontend` 후 `--force-recreate` |
| `.env`의 `DB_PASSWORD` 변경 | 기존 볼륨이 있으면 `ALTER USER`도 함께 실행 |
| `JWT_SECRET` 변경 | 기존 토큰 전부 무효 — 브라우저에서 재로그인 필요 |
| 백엔드 컨테이너 재생성 | (본 문서 1번 적용 후) 프론트엔드 재시작 불필요 |
