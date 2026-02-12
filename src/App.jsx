import React, { useEffect, useMemo, useState } from 'react';
import Tesseract from 'tesseract.js';
import QRCode from 'qrcode';
import ImageUploader from './components/ImageUploader';
import './App.css';

function parseWifi(text) {
  const lines = text.split(/\n|\r/).map((l) => l.trim()).filter(Boolean);
  let ssid = '';
  let password = '';
  for (const l of lines) {
    if (!ssid && /ssid|wifi|wi-fi|네트워크|와이파이|와이파이명/i.test(l)) {
      ssid = l.split(/[:：]/).slice(1).join(':').trim() || '';
    }
    if (!password && /password|pass|pw|비밀번호|암호/i.test(l)) {
      password = l.split(/[:：]/).slice(1).join(':').trim() || '';
    }
  }
  return { ssid, password };
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

  const qrText = useMemo(() => (ssid ? buildWifiQR(ssid, password) : ''), [ssid, password]);

  useEffect(() => {
    if (!qrText) return setQrUrl('');
    QRCode.toDataURL(qrText, { width: 280, margin: 1 }).then(setQrUrl);
  }, [qrText]);

  const runOCR = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const { data } = await Tesseract.recognize(image, 'eng+kor');
      setOcrText(data.text || '');
      const parsed = parseWifi(data.text || '');
      if (parsed.ssid) setSsid(parsed.ssid);
      if (parsed.password) setPassword(parsed.password);
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
        <ImageUploader image={image} onChange={setImage} />

        <button className="primary-btn wide" onClick={runOCR} disabled={!image || loading}>
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
