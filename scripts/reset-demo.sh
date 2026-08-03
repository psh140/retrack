#!/bin/bash
# 데모 데이터 초기화 — 방문자가 변경·삭제한 데이터를 원상 복구한다.
#
# sql/demo.sql은 맨 앞에서 TRUNCATE로 전체를 비우므로 몇 번을 실행해도 같은 상태가 된다.
# 컨테이너에 마운트된 경로(/docker-entrypoint-initdb.d/02_demo.sql)를 그대로 재실행한다.
# initdb 스크립트는 볼륨이 비어 있을 때만 자동 실행되므로, 운영 중인 DB에는 이 스크립트로 적용한다.
#
# cron 등록 예 (매일 새벽 4시):
#   0 4 * * * /home/ubuntu/retrack/scripts/reset-demo.sh >> /var/log/retrack-demo-reset.log 2>&1
#
# @since 2026-08-03
set -euo pipefail

docker exec -i retrack-db \
    psql -U retrack -d retrack -v ON_ERROR_STOP=1 \
    -f /docker-entrypoint-initdb.d/02_demo.sql

# 업로드 파일도 함께 정리 — DB의 files 레코드가 사라지므로 디스크 파일은 고아가 된다
find "$(dirname "$0")/../uploads" -type f ! -name '.gitkeep' -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 데모 데이터 초기화 완료"
