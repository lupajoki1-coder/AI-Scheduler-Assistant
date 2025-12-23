export const config = {
  runtime: 'edge', // Menggunakan Edge Runtime agar ultra-cepat
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { message, time, timezone } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY; // Diambil dari Vercel Env

    if (!apiKey) {
      return new Response(JSON.stringify({ status: "INVALID", reply: "Server Error: API Key Missing" }), { status: 500 });
    }

    const systemPrompt = `
      Anda adalah Validator Jadwal. Base Time: ${time}. Timezone: ${timezone}.
      Ekstrak input menjadi JSON: { "status": "VALID/INVALID", "summary": "Judul", "start_time": "ISO8601", "end_time": "ISO8601", "reply": "Konfirmasi ramah" }.
      Output JSON Only. No Markdown.
    `;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });

    const data = await geminiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanJson = rawText.replace(/```json|```/g, '').trim();

    return new Response(cleanJson, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ status: "INVALID", reply: "Terjadi kesalahan sistem." }), { status: 500 });
  }
}