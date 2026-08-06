# 운영 DB 접속 구성 (DBeaver + SSH 터널)

> **상태: 미실행 — 계획 단계**
> 2026-08-06 기준 **서버에는 아무것도 적용하지 않았다.**
> 아래는 검토를 마친 방향이며, 실행 전에 8장의 미결정 항목을 먼저 확정해야 한다.
> 실제로 수행한 배포 절차는 [`배포-작업기록.md`](배포-작업기록.md)에 있다 — 이 문서와 혼동하지 말 것.

작성일: 2026-08-06

---

## 1. 목적

운영 DB(EC2의 PostgreSQL 컨테이너)를 DBeaver로 조회하고 싶다.
현재 유일한 조회 수단이 `docker exec` + `psql` CLI뿐이라 불편하다.

## 2. 지금 붙지 않는 이유

두 겹으로 막혀 있다.

1. **호스트에 포트가 없다** — `docker-compose.prod.yml`의 db 서비스가 `ports: !reset []`이라
   컨테이너 포트가 EC2 호스트로 노출되지 않는다
2. **보안 그룹이 5432를 열지 않는다** — 22 · 80 · 443만 열려 있다

그래서 SSH로 EC2에 들어가도 `localhost:5432`가 존재하지 않는다.
DBeaver의 SSH 터널 기능만으로는 붙을 수 없다 — 터널 반대편에 열린 포트가 없기 때문이다.

## 3. 방향 — 포트를 인터넷에 열지 않는다

SSH 터널을 통로로 쓰고, 컨테이너 포트는 **루프백에만** 바인딩한다.
보안 그룹은 손대지 않는다.

`docker-compose.prod.yml`의 db 서비스:

```yaml
db:
  ports: !override
    - "127.0.0.1:5432:5432"
```

## 4. `!override`가 반드시 필요하다

**이 문서에서 가장 중요한 부분이다.**

그냥 `ports:`로 쓰면 base `docker-compose.yml`의 `"5432:5432"`와 **리스트가 병합된다.**
결과적으로 `0.0.0.0:5432`가 살아나 **DB가 전 세계에 열린다.**

```yaml
# 절대 이렇게 쓰지 말 것 — base의 "5432:5432"와 병합되어 0.0.0.0에 열린다
db:
  ports:
    - "127.0.0.1:5432:5432"
```

Docker Compose의 병합 규칙상 리스트는 덮어쓰기가 아니라 이어붙이기가 기본이다.
`!override` 태그가 있어야 base의 항목을 대체한다.

## 5. 왜 5432를 직접 열지 않는가

- **평문 통신** — 이 프로젝트의 PostgreSQL은 SSL을 설정하지 않았다.
  5432를 인터넷에 직접 열면 접속 비밀번호가 그대로 네트워크를 흐른다. SSH 터널이 이 문제도 함께 해결한다
- **IP 화이트리스트는 부적합** — 개발 환경이 Windows·macOS 두 곳이고 접속 IP가 고정이 아니다.
  같은 이유로 SSH(22) 소스도 현재 `0.0.0.0/0`으로 두고 있다
  ([`배포-체크리스트.md:130`](배포-체크리스트.md) 참고)

## 6. DBeaver 설정

**흔한 실수: Main 탭 Host에 EC2 IP를 넣는 것.** 터널 반대편 기준이므로 `localhost`가 맞다.

| 탭 | 항목 | 값 |
|---|---|---|
| Main | Host | `localhost` |
| Main | Port | `5432` |
| Main | Database | `retrack` |
| Main | Username / Password | `.env` 참조 |
| SSH | Use SSH Tunnel | 체크 |
| SSH | Host | `52.78.210.188` |
| SSH | User | `ubuntu` |
| SSH | Authentication | Public Key — `중요/retrack-key.pem` |

## 7. 적용 절차

1. 아래 8장의 미결정 항목을 확정한다
2. `docker-compose.prod.yml`에 `ports: !override` 추가
3. db 컨테이너 재생성 — **볼륨은 유지되므로 데이터는 보존된다.** 수 초간 중단 발생

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d db
   ```
4. EC2에서 바인딩이 루프백인지 반드시 확인한다 — `0.0.0.0`이면 즉시 되돌린다

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
   ss -tlnp | grep 5432
   ```
5. DBeaver 연결 테스트

## 8. 미결정 — 실행 전에 정할 것

실수로 운영 데이터를 변경하는 사고를 막는 방법이 두 가지 중 정해지지 않았다.

| 안 | 내용 | 특징 |
|---|---|---|
| ① 조회 전용 계정 | `retrack_ro` 계정을 **추가로** 만들고 DBeaver 연결을 2개(조회용/수정용) 둔다 | DB 레벨에서 강제되므로 확실. 계정 생성 작업이 필요 |
| ② read-only 체크박스 | 계정은 `retrack` 하나만 쓰고 DBeaver 연결 설정의 read-only 옵션으로 전환 | 설정이 간단. 클라이언트 레벨이라 우회 가능 |

①을 선택해도 **기존 `retrack` 계정은 그대로 둔다.** 계정을 하나 더 만드는 것이지
기존 계정을 읽기 전용으로 바꾸는 것이 아니다 — 애플리케이션은 계속 쓰기가 필요하다.
