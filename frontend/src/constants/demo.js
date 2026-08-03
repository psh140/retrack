/**
 * 데모 계정 정보
 *
 * 포트폴리오 방문자가 가입 없이 시스템을 둘러볼 수 있도록 공개하는 계정이다.
 * 노출이 목적이므로 환경변수로 분리하지 않는다 — Vite는 빌드 시점에 값을
 * 번들에 그대로 넣기 때문에 환경변수로 옮겨도 은닉 효과가 없고,
 * Docker 빌드 인자만 복잡해진다.
 *
 * 권한은 ADMIN이다. 통계·사용자 관리·활동 로그까지 전부 보여주기 위함이며,
 * 그만큼 방문자가 데이터를 지울 수 있으므로 scripts/reset-demo.sh가 매일 초기화한다.
 *
 * 계정 자체는 sql/demo.sql에서 user_id = 1로 생성된다.
 *
 * @since 2026-08-03
 */
export const DEMO_ACCOUNT = {
  email: 'demo@hughpark.com',
  password: 'demo1234!',
};
