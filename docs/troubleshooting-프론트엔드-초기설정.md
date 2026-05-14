# 트러블슈팅 — 프론트엔드 초기 설정 (Vite + 1단계)

## 1. ESLint: unused-vars — App.jsx에서 PrivateRoute, RoleRoute 미사용 경고

**증상**
```
C:\...\src\App.jsx
  8:8  error  'PrivateRoute' is defined but never used  no-unused-vars
  9:8  error  'RoleRoute' is defined but never used     no-unused-vars
```

**원인**
App.jsx에 PrivateRoute, RoleRoute를 import했으나 실제 라우트가 아직 주석 처리 상태라 사용되지 않음.

**해결**
import 문도 함께 주석 처리. 페이지 구현 시 해당 라우트와 함께 주석 해제.

```jsx
// 페이지 구현 시 주석 해제
// import PrivateRoute from './components/PrivateRoute';
// import RoleRoute from './components/RoleRoute';
```

---

## 2. ESLint: react/prop-types — PrivateRoute, RoleRoute props 검증 누락

**증상**
```
C:\...\src\components\PrivateRoute.jsx
  9:25  error  'children' is missing in props validation  react/prop-types

C:\...\src\components\RoleRoute.jsx
  15:22  error  'children' is missing in props validation  react/prop-types
  15:32  error  'role' is missing in props validation      react/prop-types
```

**원인**
ESLint react/prop-types 규칙은 컴포넌트가 받는 props에 대해 PropTypes 정의를 요구함.
JavaScript 프로젝트에서는 TypeScript가 없어 PropTypes가 유일한 타입 명세 수단이나,
이 프로젝트에서는 boilerplate 비용 대비 실익이 낮다고 판단.

**해결**
`.eslintrc.cjs`에서 해당 규칙 비활성화.

```js
rules: {
  'react/prop-types': 'off',
}
```

---

## 3. 빌드 통과 ≠ 린트 통과

**증상**
`npm run build` 성공 → ESLint 에러 없다고 판단했으나 실제로는 에러 5개 존재.

**원인**
Vite 빌드(`npm run build`)는 ESLint를 실행하지 않음. 코드 컴파일만 수행.
lint는 별도로 `npm run lint`를 실행해야 함.

**해결 및 교훈**
작업 완료 확인 시 반드시 두 가지 모두 실행:
```bash
npm run lint    # ESLint 검사
npm run build   # 빌드 가능 여부 확인
```
