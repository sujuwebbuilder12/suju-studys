import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  getFriendlyBusyMessage,
  handleCodeRun,
  handleCourseExam,
  handleCourseLesson,
  handleCourseSyllabus,
  handleMemoryValidate,
  handleSuggest,
  isAuthError,
  openStreamWithRetryAndFallback,
  prepareAskRequest,
  prepareLessonStreamRequest,
} from "./server/geminiService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "25mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/suggest", async (req, res) => {
    const out = await handleSuggest(
      (req.body ?? {}) as Record<string, unknown>,
      process.env.GEMINI_API_KEY
    );
    res.status(out.status).json(out.data);
  });

  app.post("/api/course/syllabus", async (req, res) => {
    const out = await handleCourseSyllabus(
      (req.body ?? {}) as Record<string, unknown>,
      process.env.GEMINI_API_KEY
    );
    res.status(out.status).json(out.data);
  });

  app.post("/api/course/lesson", async (req, res) => {
    const out = await handleCourseLesson(
      (req.body ?? {}) as Record<string, unknown>,
      process.env.GEMINI_API_KEY
    );
    res.status(out.status).json(out.data);
  });

  app.post("/api/course/lesson-stream", async (req, res) => {
    const prepared = prepareLessonStreamRequest(
      (req.body ?? {}) as Record<string, unknown>,
      process.env.GEMINI_API_KEY
    );

    if ("errorStatus" in prepared) {
      res.status(prepared.errorStatus).json({ error: prepared.error });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    try {
      const { firstText, iterator } = await openStreamWithRetryAndFallback(
        prepared.ai,
        prepared.contents,
        prepared.systemInstruction
      );

      if (firstText) {
        res.write(
          `data: ${JSON.stringify({ type: "chunk", text: firstText })}\n\n`
        );
      }

      while (true) {
        const next = await iterator.next();
        if (next.done) break;
        const chunkText = next.value?.text;
        if (chunkText) {
          res.write(
            `data: ${JSON.stringify({ type: "chunk", text: chunkText })}\n\n`
          );
        }
      }

      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : "";
      const friendlyMessage = isAuthError(rawMessage)
        ? "API key issue detected. Please verify GEMINI_API_KEY in environment settings."
        : getFriendlyBusyMessage(prepared.validLanguage);

      res.write(
        `data: ${JSON.stringify({ type: "error", message: friendlyMessage })}\n\n`
      );
      res.end();
    }
  });

  app.post("/api/course/exam", async (req, res) => {
    const out = await handleCourseExam(
      (req.body ?? {}) as Record<string, unknown>,
      process.env.GEMINI_API_KEY
    );
    res.status(out.status).json(out.data);
  });

  app.post("/api/code/run", async (req, res) => {
    const out = await handleCodeRun(
      (req.body ?? {}) as Record<string, unknown>,
      process.env.GEMINI_API_KEY
    );
    res.status(out.status).json(out.data);
  });

  app.post("/api/memory/validate", async (req, res) => {
    const out = await handleMemoryValidate(
      (req.body ?? {}) as Record<string, unknown>,
      process.env.GEMINI_API_KEY
    );
    res.status(out.status).json(out.data);
  });

  app.post("/api/ask", async (req, res) => {
    const prepared = prepareAskRequest(
      (req.body ?? {}) as Record<string, unknown>,
      process.env.GEMINI_API_KEY
    );

    if ("errorStatus" in prepared) {
      res.status(prepared.errorStatus).json({ error: prepared.error });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    try {
      const { firstText, iterator } = await openStreamWithRetryAndFallback(
        prepared.ai,
        prepared.contents,
        prepared.systemInstruction
      );

      if (firstText) {
        res.write(
          `data: ${JSON.stringify({ type: "chunk", text: firstText })}\n\n`
        );
      }

      while (true) {
        const next = await iterator.next();
        if (next.done) break;
        const chunkText = next.value?.text;
        if (chunkText) {
          res.write(
            `data: ${JSON.stringify({ type: "chunk", text: chunkText })}\n\n`
          );
        }
      }

      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : "";
      const friendlyMessage = isAuthError(rawMessage)
        ? "API key issue detected. Please verify GEMINI_API_KEY in Settings > Secrets."
        : getFriendlyBusyMessage(prepared.validLanguage);

      res.write(
        `data: ${JSON.stringify({ type: "error", message: friendlyMessage })}\n\n`
      );
      res.end();
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SuJu Study server running on http://localhost:${PORT}`);
  });
}

startServer();
