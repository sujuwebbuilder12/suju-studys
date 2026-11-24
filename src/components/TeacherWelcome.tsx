import { BookOpen, Calculator, Code2, FlaskConical, ArrowRight } from "lucide-react";
import { TEACHER_CONTENT } from "../data/teacherContent";
import type { LanguageMode, SampleDoubt } from "../types/teacher";
import { TeacherAvatar } from "./TeacherAvatar";

interface TeacherWelcomeProps {
  language: LanguageMode;
  onSelectSample: (doubt: SampleDoubt) => void;
}

function getCategoryIcon(category: SampleDoubt["category"]) {
  switch (category) {
    case "math":
      return <Calculator className="h-4.5 w-4.5 text-blue-600" aria-hidden="true" />;
    case "science":
      return <FlaskConical className="h-4.5 w-4.5 text-emerald-600" aria-hidden="true" />;
    case "hindi":
      return <BookOpen className="h-4.5 w-4.5 text-amber-600" aria-hidden="true" />;
    case "coding":
      return <Code2 className="h-4.5 w-4.5 text-indigo-600" aria-hidden="true" />;
  }
}

export function TeacherWelcome({ language, onSelectSample }: TeacherWelcomeProps) {
  const strings = TEACHER_CONTENT[language];

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-6 pb-4 text-center sm:px-6 sm:pt-10">
      <TeacherAvatar size="lg" />

      <h1
        className="mt-5 max-w-2xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        style={{ textWrap: "balance" }}
      >
        {strings.greetingTitle}
      </h1>

      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
        {strings.greetingBody}
      </p>

      <div className="mt-7 w-full max-w-2xl">
        <p className="mb-3 text-xs font-medium text-slate-500">
          {strings.sampleSectionLabel}
        </p>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
          {strings.sampleDoubts.map((doubt) => (
            <button
              key={doubt.id}
              type="button"
              onClick={() => onSelectSample(doubt)}
              className="group flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-all duration-150 hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-white">
                  {getCategoryIcon(doubt.category)}
                </span>
                <span className="truncate text-sm font-semibold text-slate-800 group-hover:text-slate-950">
                  {doubt.label}
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-blue-600"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
