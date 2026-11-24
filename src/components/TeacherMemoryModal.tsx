import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { TEACHER_CONTENT } from "../data/teacherContent";
import type {
  LanguageMode,
  MemoryCategory,
  TeacherMemoryItem,
} from "../types/teacher";
import { isObviouslyUnsafeMemoryInput } from "../utils/memory";

interface TeacherMemoryModalProps {
  isOpen: boolean;
  language: LanguageMode;
  memories: TeacherMemoryItem[];
  onClose: () => void;
  onAddMemory: (item: TeacherMemoryItem) => void;
  onDeleteMemory: (id: string) => void;
}

const STARTER_SUGGESTIONS: Record<LanguageMode, string[]> = {
  hindi: [
    "मैं कक्षा 10 में हूँ और बोर्ड परीक्षा की तैयारी कर रहा हूँ",
    "मुझे गणित के सवाल हर छोटे स्टेप के साथ समझना पसंद है",
  ],
  english: [
    "I am in Class 10 preparing for board exams",
    "Explain science topics using simple everyday examples",
  ],
  hinglish: [
    "Main Class 10 mein hoon aur mujhe Maths step-by-step pasand hai",
    "Coding concepts mujhe real-life examples ke saath samjhaiye",
  ],
};

export function TeacherMemoryModal({
  isOpen,
  language,
  memories,
  onClose,
  onAddMemory,
  onDeleteMemory,
}: TeacherMemoryModalProps) {
  const strings = TEACHER_CONTENT[language];
  const [noteInput, setNoteInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (rawNote?: string) => {
    const candidate = (rawNote ?? noteInput).trim();
    if (!candidate || isValidating) return;

    setFeedback(null);

    if (isObviouslyUnsafeMemoryInput(candidate)) {
      setFeedback({
        type: "error",
        text: strings.memoryRefusalMessage,
      });
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch("/api/memory/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: candidate, language }),
      });

      const data = (await response.json()) as {
        approved?: boolean;
        category?: MemoryCategory;
        cleanedNote?: string;
        message?: string;
      };

      if (!response.ok || !data.approved) {
        setFeedback({
          type: "error",
          text: data.message || strings.memoryRefusalMessage,
        });
        return;
      }

      const newItem: TeacherMemoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: (data.cleanedNote || candidate).trim(),
        category: data.category || "study_note",
        createdAt: Date.now(),
      };

      onAddMemory(newItem);
      if (!rawNote) setNoteInput("");
      setFeedback({
        type: "success",
        text: strings.memorySavedToast,
      });
    } catch {
      setFeedback({
        type: "error",
        text: strings.serverBusyFallbackMessage,
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-memory-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80">
              <BookMarked className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="teacher-memory-title"
                className="text-base font-bold text-slate-900 sm:text-lg"
              >
                {strings.memoryModalTitle}
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>Safety-filtered educational notes</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[13px] leading-relaxed text-slate-600 sm:text-sm">
            {strings.memoryModalSubtitle}
          </p>

          {/* Add Note Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
            className="mt-4 flex flex-col gap-2.5"
          >
            <textarea
              rows={2}
              maxLength={350}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={strings.memoryInputPlaceholder}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 tabular-nums">
                {noteInput.length}/350
              </span>
              <button
                type="submit"
                disabled={!noteInput.trim() || isValidating}
                className="inline-flex min-h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:text-sm"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>{strings.memoryValidatingLabel}</span>
                  </>
                ) : (
                  <span>{strings.memorySaveLabel}</span>
                )}
              </button>
            </div>
          </form>

          {/* Feedback Banner */}
          {feedback && (
            <div
              role="alert"
              className={`mt-3 flex items-start gap-2.5 rounded-xl border p-3 text-xs font-medium leading-relaxed sm:text-[13px] ${
                feedback.type === "error"
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              {feedback.type === "error" ? (
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                  aria-hidden="true"
                />
              ) : (
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Saved Notes List */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            {memories.length === 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 sm:text-sm">
                  {strings.memoryEmptyState}
                </p>
                <div className="flex flex-col gap-2">
                  {STARTER_SUGGESTIONS[language].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={isValidating}
                      onClick={() => void handleSave(suggestion)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-800 disabled:opacity-50"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {memories.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">
                        {strings.memoryCategoryLabels[item.category]}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-800">
                        {item.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteMemory(item.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
