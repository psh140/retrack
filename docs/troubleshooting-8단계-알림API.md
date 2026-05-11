# 8단계 — 알림 API 트러블슈팅

## 1. .env 환경변수가 `docker-compose restart`로 반영되지 않는 문제

### 증상
`.env` 파일에 `MAIL_USERNAME`, `MAIL_PASSWORD`를 추가했지만, 컨테이너 내부에서 `env | grep MAIL` 실행 시 빈 값으로 나옴. 이메일 발송 시 `no password specified` 에러 발생.

### 원인
`docker-compose restart`는 컨테이너를 재시작할 뿐, 컨테이너 생성 시의 환경변수 설정을 다시 읽지 않는다.
`.env` 파일은 컨테이너 **생성** 시점에만 읽힌다.

### 해결
```bash
# restart 대신 up -d 사용 — 변경사항 감지 시 컨테이너 재생성
docker-compose up -d backend
```

---

## 2. Git Bash에서 curl 한글 인코딩 오류

### 증상
curl `-d` 파라미터에 한글을 넣으면 서버에서 `Invalid UTF-8 start byte` 오류 발생 → 500 응답.

### 원인
Windows Git Bash 터미널의 기본 인코딩이 CP949(EUC-KR)이라 한글이 깨진 채로 전송됨.
서버는 UTF-8을 기대하므로 Jackson이 JSON 파싱에 실패.

### 해결
테스트 시 curl 파라미터의 한글을 영문으로 대체한다.
근본 해결책은 프론트엔드 구현 후 브라우저에서 직접 테스트하거나, PowerShell의 `Invoke-RestMethod`를 사용하는 것.
