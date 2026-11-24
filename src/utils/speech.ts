import type { LanguageMode } from "../types/teacher";

export function cleanTextForSpeech(markdown: string): string {
  return markdown
    // Remove fenced code blocks' triple backticks & language tags, keep readable content
    .replace(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g, "$1")
    // Convert display math $$...$$ and inline math $...$ to plain readable text
    .replace(/\$\$([\s\S]*?)\$\$/g, " $1 ")
    .replace(/\$([^$]+)\$/g, " $1 ")
    // Remove markdown headings, blockquotes, list bullets, table pipes, bold/italic markers
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\|/g, " ")
    .replace(/[*_`~#]/g, "")
    // Replace common LaTeX commands with spoken equivalents
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 divided by $2")
    .replace(/\\times/g, " times ")
    .replace(/\\cdot/g, " dot ")
    .replace(/\\pm/g, " plus or minus ")
    .replace(/\\sqrt\{([^}]+)\}/g, " square root of $1 ")
    .replace(/\\rightarrow|\\to/g, " gives ")
    .replace(/[{}^\\]/g, " ")
    // Collapse excess whitespace
    .replace(/\s+/g, " ")
    .trim();
}

function splitIntoSpeakableChunks(text: string, maxLen = 190): string[] {
  const sentences = text.split(/(?<=[।.!?])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    if ((current + " " + sentence).trim().length <= maxLen) {
      current = (current + " " + sentence).trim();
    } else {
      if (current) chunks.push(current);
      if (sentence.length <= maxLen) {
        current = sentence;
      } else {
        const words = sentence.split(/\s+/);
        let part = "";
        for (const w of words) {
          if ((part + " " + w).trim().length <= maxLen) {
            part = (part + " " + w).trim();
          } else {
            if (part) chunks.push(part);
            part = w;
          }
        }
        current = part;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function pickVoiceForLanguage(lang: LanguageMode): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferredLangPrefix = lang === "english" ? "en-IN" : "hi-IN";
  const fallbackPrefix = lang === "english" ? "en" : "hi";

  return (
    voices.find((v) => v.lang.toLowerCase() === preferredLangPrefix.toLowerCase()) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(fallbackPrefix)) ||
    null
  );
}

export function speakTeacherResponse(
  text: string,
  language: LanguageMode,
  onEnd: () => void,
  rate = 0.96
): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd();
    return () => {};
  }

  window.speechSynthesis.cancel();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    onEnd();
    return () => {};
  }

  const chunks = splitIntoSpeakableChunks(cleaned);
  let cancelled = false;
  const voice = pickVoiceForLanguage(language);
  const targetLang = language === "english" ? "en-IN" : "hi-IN";

  const speakIndex = (idx: number) => {
    if (cancelled || idx >= chunks.length) {
      if (!cancelled) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[idx]);
    utterance.lang = voice?.lang || targetLang;
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = 1.02;

    utterance.onend = () => speakIndex(idx + 1);
    utterance.onerror = () => {
      if (!cancelled) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  speakIndex(0);

  return () => {
    cancelled = true;
    window.speechSynthesis.cancel();
  };
}

export interface SpokenSectionItem {
  id: string;
  label: string;
  text: string;
}

export type ChapterSpeechStatus = "idle" | "playing" | "paused";

export interface ChapterVoiceSession {
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (newRate: number) => void;
}

/**
 * Multi-section read-aloud player for Kids Voice Teacher:
 * - Reads sections sequentially with active section highlight callback
 * - Supports Play / Pause / Resume / Stop and live Slow/Normal speed switching
 */
export function startChapterVoicePlayback(options: {
  sections: SpokenSectionItem[];
  language: LanguageMode;
  initialRate: number;
  startIndex?: number;
  onSectionChange: (sectionId: string | null) => void;
  onStatusChange: (status: ChapterSpeechStatus) => void;
}): ChapterVoiceSession {
  const {
    sections,
    language,
    initialRate,
    startIndex = 0,
    onSectionChange,
    onStatusChange,
  } = options;

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onSectionChange(null);
    onStatusChange("idle");
    return {
      pause: () => {},
      resume: () => {},
      stop: () => {},
      setRate: () => {},
    };
  }

  // Flatten all sections into speakable chunks tagged by sectionId
  const queue: Array<{ sectionId: string; chunk: string }> = [];
  for (let sIdx = Math.max(0, startIndex); sIdx < sections.length; sIdx++) {
    const sec = sections[sIdx];
    const cleaned = cleanTextForSpeech(sec.text);
    if (!cleaned) continue;
    for (const chunk of splitIntoSpeakableChunks(cleaned)) {
      queue.push({ sectionId: sec.id, chunk });
    }
  }

  if (queue.length === 0) {
    onSectionChange(null);
    onStatusChange("idle");
    return {
      pause: () => {},
      resume: () => {},
      stop: () => {},
      setRate: () => {},
    };
  }

  window.speechSynthesis.cancel();

  let currentIdx = 0;
  let currentRate = initialRate;
  let stopped = false;
  let paused = false;
  let ignoreNextEnd = false;

  const targetLang = language === "english" ? "en-IN" : "hi-IN";

  const speakAt = (idx: number) => {
    if (stopped || idx >= queue.length) {
      if (!stopped) {
        stopped = true;
        onSectionChange(null);
        onStatusChange("idle");
      }
      return;
    }

    currentIdx = idx;
    const item = queue[idx];
    onSectionChange(item.sectionId);
    onStatusChange("playing");

    const voice = pickVoiceForLanguage(language);
    const utterance = new SpeechSynthesisUtterance(item.chunk);
    utterance.lang = voice?.lang || targetLang;
    if (voice) utterance.voice = voice;
    utterance.rate = currentRate;
    utterance.pitch = 1.03;

    utterance.onend = () => {
      if (ignoreNextEnd) {
        ignoreNextEnd = false;
        return;
      }
      if (!stopped && !paused) {
        speakAt(idx + 1);
      }
    };

    utterance.onerror = (ev) => {
      if (ignoreNextEnd || ev.error === "interrupted" || ev.error === "canceled") {
        ignoreNextEnd = false;
        return;
      }
      if (!stopped) {
        stopped = true;
        onSectionChange(null);
        onStatusChange("idle");
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  speakAt(0);

  return {
    pause: () => {
      if (stopped || paused) return;
      paused = true;
      ignoreNextEnd = true;
      window.speechSynthesis.cancel();
      onStatusChange("paused");
    },
    resume: () => {
      if (stopped || !paused) return;
      paused = false;
      ignoreNextEnd = false;
      speakAt(currentIdx);
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      paused = false;
      ignoreNextEnd = true;
      window.speechSynthesis.cancel();
      onSectionChange(null);
      onStatusChange("idle");
    },
    setRate: (newRate: number) => {
      currentRate = newRate;
      if (!stopped && !paused) {
        ignoreNextEnd = true;
        window.speechSynthesis.cancel();
        // Small tick so speechSynthesis clears queue before re-speaking current chunk at new rate
        window.setTimeout(() => {
          if (!stopped && !paused) {
            ignoreNextEnd = false;
            speakAt(currentIdx);
          }
        }, 40);
      }
    },
  };
}
