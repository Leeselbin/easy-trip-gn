# easy-trip-gn

강릉을 타겟으로 한 무장애(barrier-free) 여행 정보 앱입니다. 한국관광공사 관광데이터 활용공모전 제출용으로 제작 중이며, 실시간 버스 도착정보·저상버스 여부·지도 기반 무장애 경로 안내를 목표로 합니다.

## 주요 기능 (진행 상황)

- **카카오 로그인** — REST API 기반 OAuth 인가코드 흐름 (`expo-auth-session`), 로그인 안 한 상태로 앱을 켜면 로그인 화면이 먼저 보이고, 로그인해야 탭 화면으로 진입할 수 있습니다.
- **지도 / 탐색 탭** — `react-native-maps`로 강릉 지역 버스정류장을 마커로 표시하고, 정류장을 누르면 바텀시트로 노선별 도착시간·저상버스 여부를 보여줍니다 (현재는 더미 데이터).
- **현재 위치로 이동** — 위치 권한을 요청하고, 지도 좌측 상단 버튼으로 현재 위치로 이동합니다.
- **마이페이지** — 카카오 프로필(닉네임, 프로필 사진) 표시 및 로그아웃.

## 기술 스택

- Expo SDK 56 / Expo Router (file-based routing)
- React Native 0.85, React 19
- `react-native-maps`, `expo-location`, `expo-auth-session`, `expo-secure-store`

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

### 3. 카카오 로그인 설정

카카오는 Redirect URI로 `http(s)`만 허용해서, `easytripgn://` 같은 커스텀 스킴을 바로 등록할 수 없습니다. 그래서 [docs/redirect.html](docs/redirect.html)을 GitHub Pages로 띄워서 중간 다리로 사용합니다.

1. 이 저장소의 GitHub 설정에서 **Settings > Pages > Source: `main` 브랜치 / `/docs` 폴더**로 지정
2. 생성된 주소(`https://<계정>.github.io/<저장소명>/redirect.html`)를:
   - [카카오 디벨로퍼스](https://developers.kakao.com) → 내 애플리케이션 → 카카오 로그인 → **Redirect URI**에 등록
   - `.env.local`의 `EXPO_PUBLIC_KAKAO_BRIDGE_REDIRECT_URI`에 동일하게 입력
3. 카카오 로그인 > 보안 탭에서 **Client Secret은 "사용 안 함"** 으로 둡니다 (앱에 시크릿을 넣지 않는 구조라서 켜져 있으면 로그인이 실패합니다)
4. 동의항목에서 닉네임/프로필 사진을 "필수 동의"로 설정해두면 마이페이지에 프로필이 항상 표시됩니다

### 4. 실행 (iOS 시뮬레이터)

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

## 폴더 구조

```
app/                  expo-router 화면 (파일 = 라우트)
  (tabs)/              홈 / 탐색(지도) / 마이페이지 탭
  login.tsx            로그인 화면
components/            공용 UI 컴포넌트
contexts/AuthContext.tsx  카카오 로그인 상태를 앱 전역에서 공유
hooks/useKakaoAuth.ts  카카오 로그인/로그아웃, 토큰 저장/복원
lib/                   카카오 OAuth, 위치 권한 등 순수 로직
constants/busStops.ts  버스정류장 더미 데이터
docs/redirect.html     카카오 로그인용 Redirect URI 브릿지 페이지 (GitHub Pages)
```
