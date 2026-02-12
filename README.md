# Wi‑Fi QR Generator

카페/음식점 와이파이 안내문을 촬영하면 SSID/Password를 인식해 Wi‑Fi QR을 생성하는 웹앱입니다.

## 기능
- 📷 이미지 업로드 (사진 촬영 또는 갤러리 선택)
- 🤖 Gemini AI를 활용한 정확한 OCR
- 📶 Wi-Fi QR 코드 자동 생성
- 💾 QR 코드 다운로드

## 로컬 개발

```bash
npm install
npm run dev
```

## Cloudflare Pages 배포

### 1. API 키 발급
[Google AI Studio](https://aistudio.google.com/apikey)에서 Gemini API 키를 발급받으세요.

### 2. Cloudflare Pages 설정

**빌드 설정:**
- Build command: `npm run build`
- Build output directory: `dist`

**환경 변수:**
- `GEMINI_API_KEY`: 발급받은 Gemini API 키

### 3. 환경 변수 설정 방법
1. Cloudflare Pages 대시보드 → 프로젝트 선택
2. Settings → Environment variables
3. Production 탭에서 변수 추가:
   - Variable name: `GEMINI_API_KEY`
   - Value: `your-api-key-here`
4. Save 클릭

## 사용 방법
1. 와이파이 안내문 사진 업로드
2. OCR 실행 버튼 클릭
3. 자동으로 추출된 SSID/Password 확인 및 수정
4. QR 코드 생성 및 다운로드

## 모바일에서 QR 사용
- **iOS**: QR 이미지 저장 → 사진 앱에서 열기 → "Wi‑Fi 연결" 배너 클릭
- **Android**: 갤러리에서 Google Lens로 인식 → 바로 연결

## 기술 스택
- React 19 + Vite
- Cloudflare Pages + Functions
- Google Gemini AI (gemini-2.0-flash-exp)
- qrcode.js
