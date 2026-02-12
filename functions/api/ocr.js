import { GoogleGenAI } from '@google/genai';

export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageData } = await context.request.json();
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `이 이미지에서 Wi-Fi 네트워크 정보를 추출해주세요.
다음 형식으로만 답변해주세요:
SSID: [와이파이 이름]
PASSWORD: [비밀번호]

만약 정보를 찾을 수 없다면 "NONE"이라고 답변해주세요.`,
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const text = response.text || '';

    let ssid = '';
    let password = '';

    const ssidMatch = text.match(/SSID:\s*(.+)/i);
    const passMatch = text.match(/PASSWORD:\s*(.+)/i);

    if (ssidMatch) ssid = ssidMatch[1].trim();
    if (passMatch) password = passMatch[1].trim();

    return new Response(
      JSON.stringify({ ssid, password, rawText: text }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
