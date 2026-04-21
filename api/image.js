// Image generation endpoint — DALL·E 3 + Vision 참조 체인
// POST /api/image  body: { prompt, referenceImage? }  →  { image: base64 }

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

async function describeReferenceImage(referenceImage, openaiKey) {
  // referenceImage는 base64 문자열 또는 data URL일 수 있음
  const imageUrl = referenceImage.startsWith('data:')
    ? referenceImage
    : `data:image/png;base64,${referenceImage}`;

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `이 이미지의 색감, 톤, 구도, 분위기, 질감을 3~4문장으로 요약해주세요. 새 이미지를 이 이미지와 이어지게 만들기 위해 참고할 수 있도록, 구체적인 시각 요소 위주로 묘사해주세요.`,
          },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      }],
    }),
  });

  const data = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(data));
  return data?.choices?.[0]?.message?.content || '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, referenceImage } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt가 필요해요' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return res.status(500).json({ error: 'OPENAI_API_KEY 환경변수가 설정되지 않았어요' });

    // 참조 이미지가 있으면 Vision으로 먼저 시각 특성 추출
    let finalPrompt = prompt;
    if (referenceImage) {
      try {
        const styleDesc = await describeReferenceImage(referenceImage, openaiKey);
        if (styleDesc) {
          finalPrompt = `[이전 이미지의 시각적 특성 — 색감·톤·구도·분위기를 이어가세요]\n${styleDesc}\n\n[이번에 그릴 내용]\n${prompt}`;
        }
      } catch (e) {
        // Vision 실패 시 원본 프롬프트로 진행
        console.error('Vision 분석 실패:', e?.message || e);
      }
    }

    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: finalPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json',
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: '이미지 생성에 실패했어요', detail: data });
    }

    const b64 = data?.data?.[0]?.b64_json || '';
    if (!b64) return res.status(500).json({ error: '이미지 데이터가 비어있어요', detail: data });

    // 프론트엔드가 <img src="..."> 에 바로 꽂을 수 있도록 data URL 형태로 돌려줌
    const image = `data:image/png;base64,${b64}`;
    return res.status(200).json({ image });
  } catch (err) {
    return res.status(500).json({ error: '이미지 생성에 실패했어요', detail: String(err?.message || err) });
  }
}
