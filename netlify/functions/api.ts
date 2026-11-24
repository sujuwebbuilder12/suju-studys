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
} from "../../server/geminiService";

function jsonResponse(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const route = url.pathname
    .replace(/^\/(\.netlify\/functions\/api|api)/, "")
    .replace(/\/+$/, "") || "/";

  const apiKey = process.env.GEMINI_API_KEY;

  if (req.method === "GET" && (route === "/health" || route === "/")) {
    return jsonResponse(200, { ok: true });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON payload" });
  }

  if (route === "/suggest") {
    const out = await handleSuggest(body, apiKey);
    return jsonResponse(out.status, out.data);
  }

  if (route === "/course/syllabus") {
    const out = await handleCourseSyllabus(body, apiKey);
    return jsonResponse(out.status, out.data);
  }

  if (route === "/course/lesson") {
    const out = await handleCourseLesson(body, apiKey);
    return jsonResponse(out.status, out.data);
  }

  if (route === "/course/lesson-stream") {
    const prepared = prepareLessonStreamRequest(body, apiKey);
    if ("errorStatus" in prepared) {
      return jsonResponse(prepared.errorStatus, { error: prepared.error });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const pushEvent = (payload: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        };

        try {
          const { firstText, iterator } =
            await openStreamWithRetryAndFallback(
              prepared.ai,
              prepared.contents,
              prepared.systemInstruction
            );

          if (firstText) {
            pushEvent({ type: "chunk", text: firstText });
          }

          while (true) {
            const next = await iterator.next();
            if (next.done) break;
            const chunkText = next.value?.text;
            if (chunkText) {
              pushEvent({ type: "chunk", text: chunkText });
            }
          }

          pushEvent({ type: "done" });
        } catch (err: unknown) {
          const rawMessage = err instanceof Error ? err.message : "";
          const friendlyMessage = isAuthError(rawMessage)
            ? "API key issue detected. Please verify GEMINI_API_KEY in environment settings."
            : getFriendlyBusyMessage(prepared.validLanguage);

          pushEvent({ type: "error", message: friendlyMessage });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  }

  if (route === "/course/exam") {
    const out = await handleCourseExam(body, apiKey);
    return jsonResponse(out.status, out.data);
  }

  if (route === "/code/run") {
    const out = await handleCodeRun(body, apiKey);
    return jsonResponse(out.status, out.data);
  }

  if (route === "/memory/validate") {
    const out = await handleMemoryValidate(body, apiKey);
    return jsonResponse(out.status, out.data);
  }

  if (route === "/ask") {
    const prepared = prepareAskRequest(body, apiKey);
    if ("errorStatus" in prepared) {
      return jsonResponse(prepared.errorStatus, { error: prepared.error });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const pushEvent = (payload: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        };

        try {
          const { firstText, iterator } =
            await openStreamWithRetryAndFallback(
              prepared.ai,
              prepared.contents,
              prepared.systemInstruction
            );

          if (firstText) {
            pushEvent({ type: "chunk", text: firstText });
          }

          while (true) {
            const next = await iterator.next();
            if (next.done) break;
            const chunkText = next.value?.text;
            if (chunkText) {
              pushEvent({ type: "chunk", text: chunkText });
            }
          }

          pushEvent({ type: "done" });
        } catch (err: unknown) {
          const rawMessage = err instanceof Error ? err.message : "";
          const friendlyMessage = isAuthError(rawMessage)
            ? "API key issue detected. Please verify GEMINI_API_KEY in environment settings."
            : getFriendlyBusyMessage(prepared.validLanguage);

          pushEvent({ type: "error", message: friendlyMessage });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  }

  return jsonResponse(404, { error: "API route not found" });
}
