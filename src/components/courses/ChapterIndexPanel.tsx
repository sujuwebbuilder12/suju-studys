import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import type { BookChapter, CourseTier } from "../../types/courses";
import type { LanguageMode } from "../../types/teacher";
import { cleanInlineText } from "../../utils/formatMath";

interface ChapterIndexPanelProps {
  chapters: BookChapter[];
  activeChapterNumber: number;
  completedChapters: number[];
  loading: boolean;
  error: string | null;
  language: LanguageMode;
  onSelectChapter: (chapter: BookChapter) => void;
  onRetrySyllabus: () => void;
}

const TIER_GROUPS: Array<{
  tier: CourseTier;
  titleHi: string;
  titleEn: string;
  titleHinglish: string;
  rangeLabel: string;
}> = [
  {
    tier: "beginner",
    titleHi: "लेवल 1: शून्य से शुरुआत (Beginner)",
    titleEn: "Level 1: Zero Basics & Rules",
    titleHinglish: "Level 1: Zero se Shuruat (Beginner)",
    rangeLabel: "Ch 1–5",
  },
  {
    tier: "advance",
    titleHi: "लेवल 2: मुख्य पुस्तक (Advance)",
    titleEn: "Level 2: Core Book & Formulas",
    titleHinglish: "Level 2: Core Book (Advance)",
    rangeLabel: "Ch 6–11",
  },
  {
    tier: "professional",
    titleHi: "लेवल 3: एडवांस व परीक्षा (Pro)",
    titleEn: "Level 3: Mastery, Projects & Exam",
    titleHinglish: "Level 3: Mastery & Exam Prep (Pro)",
    rangeLabel: "Ch 12–16",
  },
];

export function ChapterIndexPanel({
  chapters,
  activeChapterNumber,
  completedChapters,
  loading,
  error,
  language,
  onSelectChapter,
  onRetrySyllabus,
}: ChapterIndexPanelProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const pickLabel = (hi: string, en: string, hinglish: string) =>
    language === "english" ? en : language === "hinglish" ? hinglish : hi;

  const totalCount = chapters.length || 16;
  const completedCount = completedChapters.length;
  const activeChapter = chapters.find(
    (c) => c.chapterNumber === activeChapterNumber
  );

  const indexContent = (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-2.5 py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl border border-slate-100 bg-slate-100/80"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-center">
          <p className="text-xs font-medium text-red-800">{error}</p>
          <button
            type="button"
            onClick={onRetrySyllabus}
            className="mt-2 inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        TIER_GROUPS.map((group) => {
          const groupChapters = chapters.filter((c) => c.tier === group.tier);
          if (groupChapters.length === 0) return null;

          return (
            <div key={group.tier} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 px-1 pt-1">
                <h3 className="text-xs font-bold text-slate-700">
                  {pickLabel(group.titleHi, group.titleEn, group.titleHinglish)}
                </h3>
                <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                  {group.rangeLabel}
                </span>
              </div>

              <div className="space-y-1">
                {groupChapters.map((ch) => {
                  const isActive = ch.chapterNumber === activeChapterNumber;
                  const isDone = completedChapters.includes(ch.chapterNumber);

                  return (
                    <button
                      key={ch.chapterNumber}
                      type="button"
                      onClick={() => {
                        onSelectChapter(ch);
                        setMobileExpanded(false);
                      }}
                      className={`group flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "border-blue-500 bg-blue-50/80 text-blue-950"
                          : isDone
                            ? "border-emerald-200/80 bg-emerald-50/30 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/60"
                            : "border-transparent bg-slate-50/70 text-slate-800 hover:border-slate-200 hover:bg-slate-100/80"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold tabular-nums ${
                          isDone
                            ? "text-emerald-600"
                            : isActive
                              ? "text-blue-700"
                              : "text-slate-400"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
                        ) : (
                          `${ch.chapterNumber}.`
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs leading-snug font-semibold sm:text-[13px] ${
                            isActive ? "text-blue-950" : "text-slate-900"
                          }`}
                        >
                          {cleanInlineText(ch.title)}
                        </p>
                        {ch.keyTopics && ch.keyTopics.length > 0 && (
                          <p className="mt-0.5 truncate text-[11px] text-slate-500">
                            {ch.keyTopics.slice(0, 3).map(cleanInlineText).join(" · ")}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white shadow-xs lg:sticky lg:top-4">
      {/* Desktop Header */}
      <div className="hidden items-center justify-between gap-2 border-b border-slate-100 px-4 py-3.5 lg:flex">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900">
            {pickLabel(
              "अध्याय सूची (Full Book)",
              "Book Chapters (Full Syllabus)",
              "Book Chapters (Full Syllabus)"
            )}
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Mobile Collapsible Header */}
      <button
        type="button"
        onClick={() => setMobileExpanded((prev) => !prev)}
        className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-3 text-left lg:hidden"
        aria-expanded={mobileExpanded}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            <span className="text-xs font-bold text-slate-900 sm:text-sm">
              {pickLabel(
                `अध्याय सूची (${completedCount}/${totalCount} पूरे)`,
                `Chapter Index (${completedCount}/${totalCount} Done)`,
                `Chapter Index (${completedCount}/${totalCount} Done)`
              )}
            </span>
          </div>
          {activeChapter && (
            <p className="mt-0.5 truncate text-xs text-slate-500">
              Ch {activeChapter.chapterNumber}: {cleanInlineText(activeChapter.title)}
            </p>
          )}
        </div>
        {mobileExpanded ? (
          <ChevronUp className="h-4.5 w-4.5 shrink-0 text-slate-500" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4.5 w-4.5 shrink-0 text-slate-500" aria-hidden="true" />
        )}
      </button>

      {/* Desktop always visible, Mobile collapsible */}
      <div
        className={`${
          mobileExpanded ? "block border-t border-slate-100" : "hidden"
        } p-3 lg:block lg:max-h-[calc(100dvh-130px)] lg:overflow-y-auto`}
      >
        {indexContent}
      </div>
    </aside>
  );
}
