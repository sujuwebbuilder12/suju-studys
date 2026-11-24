import type {
  GeneratedLesson,
  LessonSection,
  TextbookExercises,
} from "../types/courses";
import { cleanInlineText } from "./formatMath";

function stripTrailingPartialTag(text: string): string {
  // Prevent half-received delimiter tags like "[[SEC" or "[[TA" from flashing on screen
  return text.replace(/\[\[[^\]]*$/, "").trimEnd();
}

function extractTagBlock(buffer: string, tag: string): string | null {
  const startMarker = `[[${tag}]]`;
  const startIdx = buffer.indexOf(startMarker);
  if (startIdx === -1) return null;

  const contentStart = startIdx + startMarker.length;
  const rest = buffer.slice(contentStart);
  const nextTagMatch = rest.match(/\n?\[\[[A-Z_/]+\]\]/);
  const rawContent = nextTagMatch
    ? rest.slice(0, nextTagMatch.index)
    : stripTrailingPartialTag(rest);

  return rawContent.trim();
}

export function parseStreamingLesson(
  rawBuffer: string,
  fallbackTitle = ""
): GeneratedLesson {
  const rawTitle = extractTagBlock(rawBuffer, "TITLE");
  const rawMinutes = extractTagBlock(rawBuffer, "MINUTES");
  const rawSummary = extractTagBlock(rawBuffer, "SUMMARY");
  const rawIntro = extractTagBlock(rawBuffer, "INTRO");
  const rawRevision = extractTagBlock(rawBuffer, "REVISION");
  const rawAskPrompt = extractTagBlock(rawBuffer, "ASK_PROMPT");

  const lessonTitle = cleanInlineText(rawTitle || fallbackTitle || "Loading...");
  const parsedMin = rawMinutes ? Number.parseInt(rawMinutes, 10) : NaN;
  const estimatedMinutes =
    Number.isFinite(parsedMin) && parsedMin > 0 && parsedMin <= 120
      ? parsedMin
      : 20;
  const summary = cleanInlineText(rawSummary || "");
  const zeroToHeroAnalogy = rawIntro ? cleanInlineText(rawIntro) : undefined;

  // Parse all [[SECTION]] blocks progressively
  const sections: LessonSection[] = [];
  const sectionMarker = "[[SECTION]]";
  let searchFrom = 0;

  while (true) {
    const secIdx = rawBuffer.indexOf(sectionMarker, searchFrom);
    if (secIdx === -1) break;

    const afterStart = secIdx + sectionMarker.length;
    const tail = rawBuffer.slice(afterStart);

    // Find where this section ends (next [[SECTION]], [[REVISION]], [[EXERCISES_JSON]], [[ASK_PROMPT]], or [[END]])
    const endMatch = tail.match(
      /\n?\[\[(?:SECTION|REVISION|EXERCISES_JSON|ASK_PROMPT|END)\]\]/
    );
    const block = endMatch
      ? tail.slice(0, endMatch.index)
      : stripTrailingPartialTag(tail);

    const headingMarker = "[[HEADING]]";
    const takeawayMarker = "[[TAKEAWAY]]";

    let heading = "";
    let contentMarkdown = "";
    let keyTakeaway = "";

    const hIdx = block.indexOf(headingMarker);
    const tIdx = block.indexOf(takeawayMarker);

    if (hIdx !== -1) {
      const afterH = block.slice(hIdx + headingMarker.length);
      const newlineIdx = afterH.indexOf("\n");
      if (newlineIdx !== -1) {
        heading = cleanInlineText(afterH.slice(0, newlineIdx));
        const bodyPart = afterH.slice(newlineIdx + 1);
        if (tIdx !== -1) {
          const bodyEndInBlock = tIdx;
          const hEndInBlock = hIdx + headingMarker.length + newlineIdx + 1;
          contentMarkdown = block.slice(hEndInBlock, bodyEndInBlock).trim();
          keyTakeaway = cleanInlineText(
            block.slice(tIdx + takeawayMarker.length)
          );
        } else {
          contentMarkdown = stripTrailingPartialTag(bodyPart).trim();
        }
      } else {
        heading = cleanInlineText(stripTrailingPartialTag(afterH));
      }
    } else if (block.trim()) {
      contentMarkdown = stripTrailingPartialTag(block).trim();
    }

    if (heading || contentMarkdown) {
      sections.push({
        heading: heading || `Section ${sections.length + 1}`,
        contentMarkdown,
        keyTakeaway,
      });
    }

    if (!endMatch) break;
    searchFrom = afterStart + (endMatch.index ?? 0);
  }

  // Parse [[REVISION]] bullet lines
  const examImportantPoints = rawRevision
    ? rawRevision
        .split("\n")
        .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim())
        .filter((line) => line.length > 0)
        .map(cleanInlineText)
    : [];

  // Parse [[EXERCISES_JSON]] once closing tag arrives
  let textbookExercises: TextbookExercises | undefined;
  const exStartMarker = "[[EXERCISES_JSON]]";
  const exEndMarker = "[[/EXERCISES_JSON]]";
  const exStart = rawBuffer.indexOf(exStartMarker);
  const exEnd = rawBuffer.indexOf(exEndMarker);
  if (exStart !== -1 && exEnd > exStart) {
    const rawJson = rawBuffer
      .slice(exStart + exStartMarker.length, exEnd)
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    try {
      const parsedEx = JSON.parse(rawJson) as Partial<TextbookExercises>;
      if (
        parsedEx &&
        Array.isArray(parsedEx.objectiveMcqs) &&
        Array.isArray(parsedEx.shortAnswers) &&
        Array.isArray(parsedEx.longAnswers)
      ) {
        textbookExercises = {
          objectiveMcqs: parsedEx.objectiveMcqs,
          shortAnswers: parsedEx.shortAnswers,
          longAnswers: parsedEx.longAnswers,
        };
      }
    } catch {
      // Ignore malformed JSON during stream
    }
  }

  return {
    lessonTitle,
    estimatedMinutes,
    summary,
    zeroToHeroAnalogy,
    sections,
    examImportantPoints:
      examImportantPoints.length > 0 ? examImportantPoints : undefined,
    textbookExercises,
    askTeacherPrompt:
      cleanInlineText(rawAskPrompt || "") ||
      `${lessonTitle} को और आसान भाषा में समझाइए।`,
  };
}
