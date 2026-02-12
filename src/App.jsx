import React, { useEffect, useMemo, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import QRCode from 'qrcode';
import ImageUploader from './components/ImageUploader';
import './App.css';

async function extractWifiFromImage(imageDataUrl, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Convert data URL to base64
  const base64Data = imageDataUrl.split(',')[1];

  const prompt = `이 이미지에서 Wi-Fi 네트워크 정보를 추출해주세요.
다음 형식으로만 답변해주세요:
SSID: [와이파이 이름]
PASSWORD: [비밀번호]

만약 정보를 찾을 수 없다면 "NONE"이라고 답변해주세요.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
      },
    },
  ]);

  const text = result.response.text();

  // Parse response
  let ssid = '';
  let password = '';

  const ssidMatch = text.match(/SSID:\s*(.+)/i);
  const passMatch = text.match(/PASSWORD:\s*(.+)/i);

  if (ssidMatch) ssid = ssidMatch[1].trim();
  if (passMatch) password = passMatch[1].trim();

  return { ssid, password, rawText: text };
}

function buildWifiQR(ssid, password, hidden = false, auth = 'WPA') {
  const esc = (s) => s.replace(/([\\;,:\"])/g, '\\$1');
  return `WIFI:T:${auth};S:${esc(ssid)};P:${esc(password)};H:${hidden ? 'true' : 'false'};`;
}

function App() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

  const qrText = useMemo(() => (ssid ? buildWifiQR(ssid, password) : ''), [ssid, password]);

  useEffect(() => {
    if (!qrText) return setQrUrl('');
    QRCode.toDataURL(qrText, { width: 280, margin: 1 }).then(setQrUrl);
  }, [qrText]);

  const runOCR = async () => {
    if (!image || !apiKey) {
      alert('이미지와 API 키를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const result = await extractWifiFromImage(image, apiKey);
      setOcrText(result.rawText || '');
      if (result.ssid) setSsid(result.ssid);
      if (result.password) setPassword(result.password);

      // Save API key to localStorage
      localStorage.setItem('gemini_api_key', apiKey);
    } catch (error) {
      console.error('OCR 오류:', error);
      alert('OCR 처리 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `wifi-${ssid || 'qr'}.png`;
    a.click();
  };

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <div className="brand-badge">📶</div>
          <div>
            <div className="brand-title">Wi‑Fi QR Generator</div>
            <div className="brand-sub">사진 → SSID/PW 인식 → QR 생성</div>
          </div>
        </div>
      </div>

      <main className="container">
        <div className="card">
          <div className="card-title">Gemini API Key</div>
          <div className="field">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Gemini API 키 입력"
            />
          </div>
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            API 키는 브라우저에만 저장됩니다.
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', marginLeft: '4px' }}>
              키 발급받기
            </a>
          </small>
        </div>

        <ImageUploader image={image} onChange={setImage} />

        <button className="primary-btn wide" onClick={runOCR} disabled={!image || !apiKey || loading}>
          {loading ? '인식 중...' : 'OCR 실행'}
        </button>

        <div className="card">
          <div className="card-title">인식 결과 (수정 가능)</div>
          <div className="field">
            <label>SSID</label>
            <input value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="와이파이 이름" />
          </div>
          <div className="field">
            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" />
          </div>
          {ocrText && <pre className="ocr">{ocrText}</pre>}
        </div>

        {qrUrl && (
          <div className="card center">
            <div className="card-title">Wi‑Fi QR</div>
            <img src={qrUrl} alt="wifi qr" className="qr" />
            <button className="ghost-btn" onClick={downloadQR}>QR 저장</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
