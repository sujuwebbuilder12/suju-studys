import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  AlertCircle,
  ArrowRight,
  FileText,
  HelpCircle,
  RotateCcw,
  Square,
  Volume2,
} from "lucide-react";
import { TEACHER_CONTENT } from "../data/teacherContent";
import type { ChatMessage, FollowUpChip, LanguageMode } from "../types/teacher";
import { cleanDisplayMarkdown } from "../utils/formatMath";
import { parseTeacherSuggestions } from "../utils/suggestions";
import { TeacherAvatar } from "./TeacherAvatar";

interface MessageBubbleProps {
  message: ChatMessage;
  uiLanguage: LanguageMode;
  isLatestTeacherMessage: boolean;
  isBusy: boolean;
  activeSpeechId: string | null;
  onToggleSpeak: (messageId: string, text: string, lang: LanguageMode) => void;
  onFollowUpClick: (chip: FollowUpChip) => void;
  onSelectSuggestedQuestion: (question: string) => void;
  onRetry?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageBubble({
  message,
  uiLanguage,
  isLatestTeacherMessage,
  isBusy,
  activeSpeechId,
  onToggleSpeak,
  onFollowUpClick,
  onSelectSuggestedQuestion,
  onRetry,
}: MessageBubbleProps) {
  const strings = TEACHER_CONTENT[uiLanguage];
  const isSpeaking = activeSpeechId === message.id;
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen]);

  if (message.role === "user") {
    const isImage = message.attachment?.mimeType.startsWith("image/");

    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-2xl border border-slate-200/90 bg-slate-100 px-4 py-3 text-slate-900 sm:max-w-[78%]">
          {message.attachment && (
            <div className="mb-2.5">
              {isImage && message.attachment.previewUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="block overflow-hidden rounded-xl border border-slate-200 bg-white focus-visible:outline-2 focus-visible:outline-blue-600"
                    aria-label={`View attached image ${message.attachment.name}`}
                  >
                    <img
                      src={message.attachment.previewUrl}
                      alt={message.attachment.name}
                      className="max-h-52 w-auto object-contain"
                    />
                  </button>
                  {lightboxOpen && (
                    <div
                      role="dialog"
                      aria-modal="true"
                      onClick={() => setLightboxOpen(false)}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
                    >
                      <img
                        src={message.attachment.previewUrl}
                        alt={message.attachment.name}
                        className="max-h-[85vh] max-w-[92vw] rounded-xl bg-white object-contain shadow-xl"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                  <FileText className="h-4.5 w-4.5 shrink-0 text-blue-600" aria-hidden="true" />
                  <div className="min-w-0 text-left">
                    <p className="max-w-[200px] truncate font-semibold text-slate-800">
                      {message.attachment.name}
                    </p>
                    <p className="text-slate-500 tabular-nums">
                      PDF · {formatBytes(message.attachment.size)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {message.text && (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-900">
              {message.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  const { displayText, suggestions } = parseTeacherSuggestions(message.text);
  const hasQuestionSuggestions = suggestions.length > 0;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <TeacherAvatar size="sm" />
          <span className="text-sm font-bold text-slate-900">
            {strings.teacherName}
          </span>
        </div>

        {!message.isStreaming && !message.error && displayText && (
          <button
            type="button"
            onClick={() => onToggleSpeak(message.id, displayText, message.language)}
            className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              isSpeaking
                ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            }`}
            aria-label={isSpeaking ? strings.stopListenLabel : strings.listenLabel}
          >
            {isSpeaking ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                <span>{strings.stopListenLabel}</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                <span>{strings.listenLabel}</span>
              </>
            )}
          </button>
        )}
      </div>

      {message.error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-600" aria-hidden="true" />
            <p>{message.error}</p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 sm:self-center"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Retry</span>
            </button>
          )}
        </div>
      ) : message.isStreaming && !displayText ? (
        <div className="flex items-center gap-2.5 py-2 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <span>{strings.thinkingLabel}</span>
        </div>
      ) : (
        <div className="teacher-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {cleanDisplayMarkdown(displayText)}
          </ReactMarkdown>
          {message.isStreaming && (
            <span className="ml-1 inline-block h-4 w-1.5 animate-pulse rounded-xs bg-blue-600 align-middle" />
          )}
        </div>
      )}

      {/* Interactive Suggested Complete Questions for Incomplete/Vague Doubts */}
      {!message.isStreaming && !message.error && hasQuestionSuggestions && (
        <div className="mt-1 grid grid-cols-1 gap-2 pt-1">
          {suggestions.map((question, idx) => (
            <button
              key={`${message.id}-sug-${idx}`}
              type="button"
              disabled={isBusy}
              onClick={() => onSelectSuggestedQuestion(question)}
              className="group flex min-h-[46px] w-full items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/50 px-3.5 py-2.5 text-left text-sm font-medium text-slate-800 transition-all duration-150 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-950 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <HelpCircle
                  className="h-4.5 w-4.5 shrink-0 text-blue-600"
                  aria-hidden="true"
                />
                <span className="leading-snug">{question}</span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-blue-500 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      )}

      {/* Standard Follow-Up Chips (shown after full explanations, hidden on incomplete-question prompts) */}
      {isLatestTeacherMessage &&
        !message.isStreaming &&
        !message.error &&
        displayText &&
        !hasQuestionSuggestions && (
          <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {strings.followUpChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                disabled={isBusy}
                onClick={() => onFollowUpClick(chip)}
                className="min-h-[38px] rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-left text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:text-[13px]"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
    </article>
  );
}
