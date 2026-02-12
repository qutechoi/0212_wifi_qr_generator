export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const ssid = url.searchParams.get('ssid');
  const password = url.searchParams.get('password');

  if (!ssid || !password) {
    return new Response(JSON.stringify({ error: 'ssid and password are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const escapeXml = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const safeSsid = escapeXml(ssid);
  const safePassword = escapeXml(password);

  const mobileconfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>AutoJoin</key>
      <true/>
      <key>EncryptionType</key>
      <string>WPA2</string>
      <key>HIDDEN_NETWORK</key>
      <false/>
      <key>IsHotspot</key>
      <false/>
      <key>Password</key>
      <string>${safePassword}</string>
      <key>SSID_STR</key>
      <string>${safeSsid}</string>
      <key>PayloadDescription</key>
      <string>Wi-Fi 네트워크 ${safeSsid} 설정</string>
      <key>PayloadDisplayName</key>
      <string>Wi-Fi: ${safeSsid}</string>
      <key>PayloadIdentifier</key>
      <string>com.wifi-qr.profile.wifi</string>
      <key>PayloadType</key>
      <string>com.apple.wifi.managed</string>
      <key>PayloadUUID</key>
      <string>${crypto.randomUUID()}</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>Wi-Fi 네트워크에 자동 연결합니다.</string>
  <key>PayloadDisplayName</key>
  <string>Wi-Fi: ${safeSsid}</string>
  <key>PayloadIdentifier</key>
  <string>com.wifi-qr.profile</string>
  <key>PayloadOrganization</key>
  <string>Wi-Fi QR Generator</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>${crypto.randomUUID()}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>`;

  return new Response(mobileconfig, {
    headers: {
      'Content-Type': 'application/x-apple-aspen-config',
      'Content-Disposition': `attachment; filename="wifi-${ssid}.mobileconfig"`,
    },
  });
}
