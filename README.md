# easy-trip-gn

강릉을 타겟으로 한 무장애(barrier-free) 여행 정보 앱입니다. 한국관광공사 관광데이터 활용공모전 제출용으로 제작 중이며, 실시간 버스 도착정보·저상버스 여부·지도 기반 무장애 경로 안내를 목표로 합니다.

## 주요 기능 (진행 상황)

- **카카오 로그인** — REST API 기반 OAuth 인가코드 흐름 (`expo-auth-session`), 로그인 안 한 상태로 앱을 켜면 로그인 화면이 먼저 보이고, 로그인해야 탭 화면으로 진입할 수 있습니다.
- **지도 / 탐색 탭** — `react-native-maps`로 강릉 지역 버스정류장을 마커로 표시하고, 정류장을 누르면 바텀시트로 노선별 도착시간·저상버스 여부를 보여줍니다 (`server/`의 API에서 조회, 현재는 시드된 더미 데이터).
- **현재 위치로 이동** — 위치 권한을 요청하고, 지도 좌측 상단 버튼으로 현재 위치로 이동합니다.
- **마이페이지** — 카카오 프로필(닉네임, 프로필 사진) 표시 및 로그아웃.

## 기술 스택

- Expo SDK 56 / Expo Router (file-based routing)
- React Native 0.85, React 19
- `react-native-maps`, `expo-location`, `expo-auth-session`, `expo-secure-store`
- `zustand` — 전역 상태 관리 (현재는 로그인 상태 하나, `store/authStore.ts`)
- `@tanstack/react-query` — 서버 상태(API 데이터) 관리, `hooks/useBusStops.ts`
- `server/` — Express + Prisma 백엔드 (버스정류장/도착정보 API)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 참고해서 `.env.local`을 만들고 값을 채워주세요.

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
| --- | --- |
| `EXPO_PUBLIC_KAKAO_REST_API_KEY` | 카카오 디벨로퍼스에서 발급받은 REST API 키 |
| `EXPO_PUBLIC_KAKAO_BRIDGE_REDIRECT_URI` | 카카오 로그인 Redirect URI (아래 "카카오 로그인 설정" 참고) |
| `EXPO_PUBLIC_API_URL` | `server/` API 주소. iOS 시뮬레이터는 `http://localhost:4000` 그대로 동작하지만, 실기기에서는 PC의 LAN IP로 바꿔야 합니다 (예: `http://192.168.0.10:4000`) |

### 3. 카카오 로그인 설정

카카오는 Redirect URI로 `http(s)`만 허용해서, `easytripgn://` 같은 커스텀 스킴을 바로 등록할 수 없습니다. 그래서 [docs/redirect.html](docs/redirect.html)을 GitHub Pages로 띄워서 중간 다리로 사용합니다.

1. 이 저장소의 GitHub 설정에서 **Settings > Pages > Source: `main` 브랜치 / `/docs` 폴더**로 지정
2. 생성된 주소(`https://<계정>.github.io/<저장소명>/redirect.html`)를:
   - [카카오 디벨로퍼스](https://developers.kakao.com) → 내 애플리케이션 → 카카오 로그인 → **Redirect URI**에 등록
   - `.env.local`의 `EXPO_PUBLIC_KAKAO_BRIDGE_REDIRECT_URI`에 동일하게 입력
3. 카카오 로그인 > 보안 탭에서 **Client Secret은 "사용 안 함"** 으로 둡니다 (앱에 시크릿을 넣지 않는 구조라서 켜져 있으면 로그인이 실패합니다)
4. 동의항목에서 닉네임/프로필 사진을 "필수 동의"로 설정해두면 마이페이지에 프로필이 항상 표시됩니다

### 4. 실행 (iOS 시뮬레이터)

탐색 탭은 `server/` API에서 버스정류장 데이터를 가져오므로, 앱을 켜기 전에 아래 "백엔드 서버" 섹션대로 서버를 먼저 띄워두세요.

이 프로젝트는 `expo-auth-session`(커스텀 스킴 딥링크)과 `react-native-maps`(네이티브 모듈)를 쓰기 때문에 **Expo Go로는 정상 동작하지 않습니다.** Dev Client를 빌드해서 실행해야 합니다.

```bash
npx expo run:ios
```

최초 빌드는 시간이 꽤 걸립니다. 이후에는 다음과 같이 더 빠르게 켤 수 있습니다.

```bash
npm start
# 터미널에서 i 키
```

> Android는 아직 `react-native-maps`용 Google Maps API 키가 설정되어 있지 않습니다 (`app.json`의 `react-native-maps` 플러그인에 `androidGoogleMapsApiKey` 추가 필요).

## 백엔드 서버 (`server/`)

탐색 탭의 버스정류장/도착정보를 제공하는 Express + Prisma API 서버입니다 (로컬 개발용 SQLite 사용, 추후 공공데이터로 교체 예정).

```bash
cd server
npm install
cp .env.example .env
npm run prisma:migrate   # 스키마 적용 + 더미 데이터 시드
npm run dev               # http://localhost:4000
```

- `GET /health` — 헬스체크
- `GET /api/bus-stops` — 정류장 목록 (노선별 도착정보 포함)

## 폴더 구조

```
app/                  expo-router 화면 (파일 = 라우트)
  (tabs)/              홈 / 탐색(지도) / 마이페이지 탭
  login.tsx            로그인 화면
components/            공용 UI 컴포넌트
store/authStore.ts     Zustand 전역 스토어 — 카카오 로그인 상태(user, isLoading)와 로그인/로그아웃 액션
hooks/useBusStops.ts   React Query 훅 — server/ API에서 버스정류장 데이터 조회
lib/                   카카오 OAuth, 위치 권한, API 클라이언트(lib/api.ts) 등 순수 로직
constants/busStops.ts  버스정류장/도착정보 타입 정의 (BusStop, BusArrival)
docs/redirect.html     카카오 로그인용 Redirect URI 브릿지 페이지 (GitHub Pages)
server/                Express + Prisma 백엔드 (버스정류장 API, 앱과 별도 실행)
  src/index.ts          서버 엔트리포인트
  src/routes/           API 라우트
  prisma/schema.prisma   DB 스키마 (BusStop, BusArrival)
  prisma/seed.ts         더미 데이터 시드 스크립트
```

## 전역 상태 관리

전역으로 공유해야 하는 값은 `store/` 아래에 Zustand 스토어로 둡니다 (Provider로 감쌀 필요 없이 `useXxxStore()` 훅만 호출). 화면 안에서만 쓰는 상태(지도 카메라 위치, 선택된 마커 등)는 그냥 해당 컴포넌트의 `useState`로 두고, 여러 화면/탭에서 같이 봐야 하는 값만 스토어로 올립니다.

- `store/authStore.ts` — 로그인 여부(`user`), 초기 로딩 상태(`isLoading`), `signIn`/`signOut`. 앱 시작 시 SecureStore에 저장된 토큰으로 자동 로그인을 시도합니다.

서버에서 가져오는 데이터(API 응답)는 Zustand가 아니라 `@tanstack/react-query`로 관리합니다 (`hooks/` 아래에 `useXxx` 훅으로 래핑). 캐싱·로딩/에러 상태·리패칭을 React Query가 처리하므로, 전역 스토어에 직접 넣지 않습니다.
