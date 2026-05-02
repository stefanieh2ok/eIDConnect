export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return Response.json(
      { error: 'TTS ist nicht konfiguriert (OPENAI_API_KEY fehlt auf dem Server).' },
      { status: 503 },
    );
  }

  let body: { text?: string; speed?: number };
  try {
    body = (await req.json()) as { text?: string; speed?: number };
  } catch {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (text.length < 1) {
    return Response.json({ error: 'Text fehlt.' }, { status: 400 });
  }
  const speed = body.speed === 1 || body.speed === 1.15 ? body.speed : 1.05;

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice: 'nova',
      input: text.slice(0, 4000),
      speed,
    }),
  });

  if (!response.ok) {
    let detail = `OpenAI TTS (${response.status})`;
    try {
      const errJson = (await response.json()) as { error?: { message?: string } };
      if (errJson?.error?.message) detail = errJson.error.message;
    } catch {
      // ignore
    }
    return Response.json({ error: detail }, { status: 502 });
  }

  const audioBuffer = await response.arrayBuffer();

  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
    },
  });
}
