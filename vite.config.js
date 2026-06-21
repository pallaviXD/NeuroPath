import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const MODEL = "gemini-2.5-flash";

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function geminiDevProxy(apiKey) {
  return {
    name: "gemini-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/api/gemini", async (req, res) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.end();
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error:
                "Set GEMINI_API_KEY or VITE_GEMINI_API_KEY in .env for dev proxy",
            })
          );
          return;
        }

        try {
          const body = await readJsonBody(req);
          const { prompt, schemaHint } = body;
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

          const data = await response.json();
          if (!response.ok) {
            res.statusCode = response.status;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: data.error?.message || "Gemini API error",
              })
            );
            return;
          }

          const text =
            data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
            "";

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ text }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err.message || "Proxy error" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || "";

  return {
    server: {
      host: "127.0.0.1",
      port: 5173,
      watch: {
        ignored: ["**/public/**", "**/*.jpg", "**/*.png", "**/*.webp", "**/*.gif"],
      },
    },
    plugins: [react(), geminiDevProxy(apiKey)],
  };
});
