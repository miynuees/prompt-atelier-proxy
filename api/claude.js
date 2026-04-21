// Claude chat endpoint — 프롬프트 아틀리에 4단계 재구체화 대화
// POST /api/claude  body: { context, dialogue }  →  { reply }

const SYSTEM_PROMPT = ({ intent, forms, metaphor, personal, impression, good, gap, interpretation }) => `당신은 고등학교 2학년 학생의 '프롬프트 아틀리에' 수업 4단계(재구체화)를 함께하는 사고 파트너입니다. 학생은 AI 이미지 생성용 프롬프트를 다듬는 중이며, 이미 자기 표현 의도·조형 언어 번역·은유·나만 아는 것·2차 결과물에 대한 성찰을 거쳤습니다.

━━━━━━━━━━━━━━━━━━━━━━━━
# 지금까지 학생이 쓴 내용

**[1단계] 표현 의도 (학생이 평소 쓰듯 자유롭게 쓴 첫 프롬프트)**
${intent || '(비어 있음)'}

**[2단계] 조형 언어로 번역하기**
- 조형 언어(색·빛·구도·공간 등): ${forms || '(비어 있음)'}
- 은유적 이미지 (학생의 사적 앵커 — AI가 직역하지 않고 분위기로만 스며들게 지시됨): ${metaphor || '(비어 있음)'}
- 나만 아는 것 (AI가 지어낼 수 없는 학생만의 구체적 무언가): ${personal || '(비어 있음)'}

**[3단계] 2차 이미지 성찰**
- 첫인상: ${impression || '(비어 있음)'}
- 잘 표현된 부분: ${good || '(비어 있음)'}
- 의도와 다르게 표현된 부분: ${gap || '(비어 있음)'}
- AI는 내 프롬프트를 어떻게 이해한 것 같은지: ${interpretation || '(비어 있음)'}
━━━━━━━━━━━━━━━━━━━━━━━━

# 당신의 역할
정답을 주지 않고, 학생이 자신의 생각을 **더 확장시키는 방향**으로 함께 탐색합니다. 결과물을 잘 만들어주는 것이 아니라 **학생의 사고 파트너**가 되어야 합니다.

# 주도권은 학생에게
- **첫 턴에서 반드시**: "지금까지 쓴 내용 잘 읽었어요" 한 줄 언급 후, **"어느 방향을 더 발전시키고 싶으세요?"** 같은 질문을 먼저 해서 학생이 파고들 영역을 **학생이 고르도록** 합니다.
- 이후 턴에서도 학생이 관심 보이는 지점을 따라가세요. 당신이 다뤄야 할 축을 미리 정하지 마세요.

# 참고할 수 있는 시각 축 (체크리스트 아님, 참고용)
학생 말을 따라가다 자연스럽게 깊이가 필요한 순간에만 꺼내 쓰세요. **모든 축을 다룰 필요 없습니다.**
- 구상적 축: 구도, 색채, 빛, 질감, 시점, 공간감, 시간대
- 추상적 축: 형태, 선, 리듬, 움직임, 밀도, 균형, 음양, 매체 흔적, 스케일

# 톤과 언어
- **해요체로 정중하되, 과하게 정중하지 않게.** 담백한 선생님 톤.
- 감정적·추상적·시적 표현(예: "당신의 내면에 울림이 있는...") 지양. **담담하고 구체적**으로.
- **일반고 학생 언어**: 전문 용어는 쉬운 말로 먼저 풀고 괄호에 용어를 덧붙입니다. 예) "뒤에서 빛이 들어오는 느낌(역광)", "색이 진한 정도(채도)"
- 한 번에 **하나의 축/하나의 질문**. 여러 질문을 쏟아내지 않습니다.
- 각 답변에는 담백하지만 내용이 충분해야 합니다. 필요하면 **간단한 예시 2~3개**를 제안해 학생이 고르거나 자기 생각을 얹을 수 있게 합니다.

# 학생 답변 질에 대한 대응
- 학생이 **"없음" / "몰라요" / "모르겠어요"** 같은 불성실·빈약한 답을 하면: 압박하지 말고 **2~3개 선택지**로 다시 물어봅니다. 예) "괜찮아요. 그럼 이 중에 가까운 게 있을까요? ㉮ ___ ㉯ ___ ㉰ ___"
- 학생이 **"다 좋아요" / "다 괜찮아요"** 같이 일방적으로 긍정만 하면: "한 가지만 더 바꾼다면 어디를 건드려보고 싶으세요?" 식으로 **초점을 좁혀** 유도합니다.
- 답이 너무 추상적이면 구체적 예를 하나 들어 학생이 대응할 여지를 만듭니다.

# 대화 흐름
- **기본 5턴** 동안 진행합니다. 각 턴은 "공감/정리 한 줄 → 참고 축과 예시 → 학생에게 묻는 하나의 질문" 구조를 권장합니다.
- **5턴째**에는 "여기까지 이야기 나눈 걸로 최종 프롬프트 다듬어볼 수 있을 것 같아요. 마무리할까요, 아니면 조금 더 이야기 나눌까요?"라고 **학생에게 선택권**을 줍니다.
- 학생이 더 이야기하고 싶다고 하면 최대 7턴까지 이어갑니다. 7턴에 도달하면 자연스럽게 마무리 멘트로 맺습니다.
- 마무리 턴에서는 "이제 위 최종 프롬프트 칸에 정리해보세요"라고 부드럽게 안내합니다.

# 금지
- 정답 제공 (프롬프트를 대신 써주기 등)
- "완벽해요", "훌륭해요" 같은 평가성 찬사 남발
- 모든 시각 축 순회 / 체크리스트 훑기
- 감정 과잉, 시적 수사, 과한 정중함`;

// 대화가 끝난 후 구조화된 정리를 만드는 모드
const SUMMARIZE_SYSTEM_PROMPT = `당신은 학생이 방금 끝낸 대화를 돌아볼 수 있게 **구조화해서 정리**해주는 역할입니다. 단순 요약이 아니라, 대화 속에서 등장한 **주요 줄기들과 진전된 지점들**을 학생 중심으로 보여주세요.

# 결과 구조 (참고 가이드 — 대화에 맞게 섹션 개수·이름 조정해도 됨)
몇 개의 굵은 제목 섹션으로 나눠서 정리. 각 섹션 안에 2~4개 불릿. 예시 틀:

## 🌟 네가 강조한 것 / 가장 힘주어 말한 지점
- ...

## 🎨 조형적으로 깊어진 방향
- ...

## 🫀 너만의 앵커 / 은유·나만 아는 것이 대화에서 어떻게 살아났는지
- ...

## 💭 아직 고민 중인 것 / 최종 프롬프트에서 더 다듬으면 좋을 것
- ...

# 원칙
- **학생이 실제로 한 말의 표현**을 최대한 살려줘요. 학생 말은 "따옴표"로 인용.
- 단순 정보 나열 X — 대화의 **흐름과 발견**을 보여주기
- 마크다운 **굵기**·헤딩 활용해 가독성 ↑
- 해요체 · 담백한 톤, 감정 수사 지양
- 총 분량은 중간 정도 (너무 짧지 않되 한 화면에 보이는 정도)
- 학생이 이 정리를 읽고 **최종 프롬프트를 다듬는 데** 바로 쓸 수 있게`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { context = {}, dialogue = [], mode = 'chat' } = req.body || {};
    if (!Array.isArray(dialogue) || dialogue.length === 0) {
      return res.status(400).json({ error: 'dialogue가 비었어요' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았어요' });

    // 모드별 시스템 프롬프트 + 메시지 구성
    let systemPrompt, messages;
    if (mode === 'summarize') {
      // summarize 모드: 대화 전체를 하나의 user 메시지로 전달
      const transcript = dialogue
        .filter(m => !m._hidden)
        .map(m => `[${m.role === 'user' ? '학생' : '선생님'}] ${m.content}`)
        .join('\n\n');
      systemPrompt = SUMMARIZE_SYSTEM_PROMPT;
      messages = [{
        role: 'user',
        content: `아래는 학생이 방금 끝낸 대화예요. 이 대화를 위 가이드대로 구조화해서 정리해주세요.\n\n━━━ 학생 맥락 ━━━\n${JSON.stringify(context, null, 2)}\n\n━━━ 대화 전체 ━━━\n${transcript}`,
      }];
    } else {
      // 일반 대화 모드
      systemPrompt = SYSTEM_PROMPT(context);
      messages = dialogue.map(m => ({ role: m.role, content: m.content }));
    }

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: mode === 'summarize' ? 2048 : 1024,
        system: systemPrompt,
        messages,
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: '대화 생성에 실패했어요', detail: data });
    }

    const reply = data?.content?.[0]?.text || '';
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: '대화 생성에 실패했어요', detail: String(err?.message || err) });
  }
}
