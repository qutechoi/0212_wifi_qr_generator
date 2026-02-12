# Wi‑Fi QR Generator

카페/음식점 와이파이 안내문을 촬영하면 SSID/Password를 인식해 Wi‑Fi QR을 생성하는 웹앱입니다.

## 기능
- 📷 이미지 업로드 (사진 촬영 또는 갤러리 선택)
- 🤖 Gemini AI를 활용한 정확한 OCR
- 📶 Wi-Fi QR 코드 자동 생성
- 💾 QR 코드 다운로드

## 사용 방법

### 1. API 키 발급
[Google AI Studio](https://aistudio.google.com/apikey)에서 Gemini API 키를 발급받으세요.

### 2. 실행
```bash
npm install
npm run dev
```

### 3. 사용
1. Gemini API 키 입력 (브라우저에 저장됨)
2. 와이파이 안내문 사진 업로드
3. OCR 실행 버튼 클릭
4. 자동으로 추출된 SSID/Password 확인 및 수정
5. QR 코드 생성 및 다운로드

## 모바일에서 QR 사용
- **iOS**: QR 이미지 저장 → 사진 앱에서 열기 → "Wi‑Fi 연결" 배너 클릭
- **Android**: 갤러리에서 Google Lens로 인식 → 바로 연결

## 기술 스택
- React 19 + Vite
- Google Gemini AI (gemini-2.0-flash-exp)
- qrcode.js
