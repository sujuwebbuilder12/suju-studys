import { BookMarked, Heart, HelpCircle, PlusCircle } from "lucide-react";
import { LANGUAGE_OPTIONS, TEACHER_CONTENT } from "../data/teacherContent";
import type { LanguageMode } from "../types/teacher";

export type AppViewMode = "teacher" | "courses";

interface HeaderProps {
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
  viewMode: AppViewMode;
  onToggleCoursesView: () => void;
  onGoToTeacher: () => void;
  hasMessages: boolean;
  onResetChat: () => void;
  memoryCount: number;
  onOpenMemory: () => void;
  onOpenDonate: () => void;
  onOpenTour: () => void;
}

export function Header({
  language,
  onLanguageChange,
  viewMode,
  onToggleCoursesView,
  onGoToTeacher,
  hasMessages,
  onResetChat,
  memoryCount,
  onOpenMemory,
  onOpenDonate,
  onOpenTour,
}: HeaderProps) {
  const strings = TEACHER_CONTENT[language];
  const isCoursesActive = viewMode === "courses";

  const bookTooltip =
    language === "english"
      ? isCoursesActive
        ? "Back to AI Guruji Chat"
        : "Open SuJu Study Courses Library"
      : language === "hinglish"
        ? isCoursesActive
          ? "AI Guruji par wapas jayein"
          : "SuJu Study Courses kholein"
        : isCoursesActive
          ? "AI गुरुजी पर वापस जाएं"
          : "SuJu स्टडी Courses खोलें";

  const guideTooltip =
    language === "english"
      ? "How to use? (Guide)"
      : language === "hinglish"
        ? "Kaise use karein? (Guide)"
        : "कैसे इस्तेमाल करें? (मदद / गाइड)";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-1 px-2 sm:h-16 sm:gap-3 sm:px-6">
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {/* Interactive Book Icon for Courses & Study Library */}
          <button
            type="button"
            data-tour="courses-book"
            onClick={onToggleCoursesView}
            title={bookTooltip}
            aria-label={bookTooltip}
            aria-pressed={isCoursesActive}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:h-9 sm:w-9 ${
              isCoursesActive
                ? "border-amber-500 bg-amber-500 text-white shadow-sm ring-2 ring-amber-200"
                : "border-blue-600 bg-blue-600 text-white shadow-xs hover:bg-blue-700"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4.5 w-4.5 sm:h-5 sm:w-5"
              aria-hidden="true"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onGoToTeacher}
            className="rounded-lg py-1 pr-0.5 text-left transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label="SuJu स्टडी AI गुरुजी"
          >
            <span className="whitespace-nowrap text-[14px] font-bold tracking-tight text-slate-900 sm:text-xl">
              SuJu <span className="text-blue-600">स्टडी</span>
            </span>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onOpenTour}
            title={guideTooltip}
            aria-label={guideTooltip}
            className="inline-flex min-h-[34px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:min-h-[36px] sm:gap-1.5 sm:px-2.5 sm:py-1.5"
          >
            <HelpCircle className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" />
            <span className="hidden md:inline">
              {language === "english" ? "Guide" : language === "hinglish" ? "Guide" : "गाइड"}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenMemory}
            title={strings.memoryModalTitle}
            aria-label={strings.memoryModalTitle}
            className="inline-flex min-h-[34px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:min-h-[36px] sm:gap-1.5 sm:px-2.5 sm:py-1.5"
          >
            <BookMarked className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
            <span className="hidden lg:inline">{strings.memoryButtonLabel}</span>
            {memoryCount > 0 && (
              <span className="hidden tabular-nums text-slate-500 lg:inline">
                ({memoryCount})
              </span>
            )}
          </button>

          {viewMode === "teacher" && hasMessages && (
            <button
              type="button"
              onClick={onResetChat}
              title={strings.newDoubtLabel}
              aria-label={strings.newDoubtLabel}
              className="inline-flex min-h-[34px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:min-h-[36px] sm:px-2.5 sm:py-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
              <span className="hidden md:inline">{strings.newDoubtLabel}</span>
            </button>
          )}

          <div
            data-tour="language-toggle"
            role="group"
            aria-label="Select explanation language"
            className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5"
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const isActive = language === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onLanguageChange(opt.id)}
                  aria-pressed={isActive}
                  className={`min-h-[30px] whitespace-nowrap shrink-0 rounded-md px-1.5 py-1 text-[10px] font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 sm:min-h-[32px] sm:px-3 sm:text-[13px] ${
                    isActive
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {opt.id === "english" ? (
                    <>
                      <span className="sm:hidden">EN</span>
                      <span className="hidden sm:inline">{opt.label}</span>
                    </>
                  ) : (
                    opt.label
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            data-tour="donate-button"
            onClick={onOpenDonate}
            title={
              language === "english"
                ? "Support SuJu Study (Donate)"
                : "SuJu स्टडी को सपोर्ट करें (Donate)"
            }
            aria-label={
              language === "english"
                ? "Donate to support SuJu Study"
                : "SuJu स्टडी को सपोर्ट करें"
            }
            className="inline-flex min-h-[34px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-rose-200 bg-rose-50 px-1.5 py-1 text-[10.5px] font-bold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 sm:min-h-[36px] sm:gap-1.5 sm:px-3 sm:text-xs"
          >
            <Heart
              className="h-3.5 w-3.5 shrink-0 fill-rose-500 text-rose-500"
              aria-hidden="true"
            />
            <span>Donate</span>
          </button>
        </div>
      </div>
    </header>
  );
}
