const MODEL = "gemini-2.5-flash";

function parseJson(text) {
  if (!text) throw new Error("Empty model response");
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse JSON from model response");
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "Server Gemini key not configured. Set GEMINI_API_KEY in Vercel environment variables.",
    });
  }

  const { prompt, schemaHint } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${prompt}\n\nRespond with valid JSON only. Schema:\n${schemaHint || "{}"}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Gemini API error: ${errText.slice(0, 200)}`,
      });
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

    parseJson(text);
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Gemini proxy failed",
    });
  }
}
