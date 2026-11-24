import { useEffect, useLayoutEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, HelpCircle, X } from "lucide-react";
import type { LanguageMode } from "../types/teacher";

interface TourStepConfig {
  id: string;
  selector: string;
  preferredPlacement: "bottom" | "top";
  titleHi: string;
  titleEn: string;
  titleHinglish: string;
  bodyHi: string;
  bodyEn: string;
  bodyHinglish: string;
}

const TOUR_STEPS: TourStepConfig[] = [
  {
    id: "courses-book",
    selector: '[data-tour="courses-book"]',
    preferredPlacement: "bottom",
    titleHi: "सभी कोर्स और किताबें (16-अध्याय)",
    titleEn: "All Courses & 16-Chapter Books",
    titleHinglish: "Sabhi Courses aur Books (16-Chapter)",
    bodyHi:
      "यहाँ क्लिक करके आप बिहार बोर्ड (Class 1–12), कॉलेज (B.A./B.Sc./B.Com.), आर्मी/पुलिस और कोडिंग के सभी 16-अध्याय वाले कोर्स पढ़ सकते हैं।",
    bodyEn:
      "Click here to read 16-chapter courses for Bihar Board (Class 1–12), College (B.A./B.Sc./B.Com.), Army/Police, and Coding.",
    bodyHinglish:
      "Yahan click karke aap Bihar Board (Class 1–12), College (B.A./B.Sc./B.Com.), Army/Police aur Coding ke sabhi 16-chapter courses padh sakte hain.",
  },
  {
    id: "language-toggle",
    selector: '[data-tour="language-toggle"]',
    preferredPlacement: "bottom",
    titleHi: "पढ़ाई की भाषा बदलें",
    titleEn: "Switch Study Language",
    titleHinglish: "Padhai ki Language Badlein",
    bodyHi:
      "यहाँ से आप पूरी पढ़ाई और टेस्ट की भाषा हिंदी, इंग्लिश या हिंग्लिश में बदल सकते हैं।",
    bodyEn:
      "From here you can switch the language of all lessons, notes, and tests between Hindi, English, or Hinglish.",
    bodyHinglish:
      "Yahan se aap poori padhai aur test ki language Hindi, English ya Hinglish mein badal sakte hain.",
  },
  {
    id: "ask-box",
    selector: '[data-tour="ask-box"]',
    preferredPlacement: "top",
    titleHi: "AI गुरुजी से कोई भी सवाल पूछें",
    titleEn: "Ask AI Guruji Anything",
    titleHinglish: "AI Guruji se Koi Bhi Sawal Puchhein",
    bodyHi:
      "यहाँ अपना कोई भी सवाल लिखें, माइक दबाकर बोलें, या किताब की फोटो/PDF भेजकर AI गुरुजी से स्टेप-बाय-स्टेप समझें।",
    bodyEn:
      "Type any question here, tap the Mic to speak, or send a book Photo/PDF to learn step-by-step from AI Guruji.",
    bodyHinglish:
      "Yahan apna koi bhi sawal likhein, Mic dabakar bolein, ya book ki Photo/PDF bhejkar AI Guruji se step-by-step samjhein.",
  },
  {
    id: "donate-button",
    selector: '[data-tour="donate-button"]',
    preferredPlacement: "bottom",
    titleHi: "SuJu स्टडी को सपोर्ट करें",
    titleEn: "Support SuJu Study",
    titleHinglish: "SuJu Study ko Support Karein",
    bodyHi:
      "अगर आपको SuJu स्टडी पसंद आए, तो यहाँ से ₹10 या अपनी इच्छा अनुसार सहयोग कर सकते हैं।",
    bodyEn:
      "If you find SuJu Study helpful, you can contribute ₹10 or any amount you wish from here.",
    bodyHinglish:
      "Agar aapko SuJu Study pasand aaye, to yahan se ₹10 ya apni iccha anusaar support kar sakte hain.",
  },
];

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface GuidedTourProps {
  isOpen: boolean;
  language: LanguageMode;
  onComplete: () => void;
}

export function GuidedTour({ isOpen, language, onComplete }: GuidedTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });

  const pickLabel = (hi: string, en: string, hinglish: string) =>
    language === "english" ? en : language === "hinglish" ? hinglish : hi;

  useEffect(() => {
    if (isOpen) {
      setStepIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onComplete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onComplete]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const currentStep = TOUR_STEPS[stepIndex];
    if (!currentStep) return;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setViewport({ width: vw, height: vh });

      const el = document.querySelector(currentStep.selector) as HTMLElement | null;
      if (!el) {
        setTargetRect(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setTargetRect(null);
        return;
      }

      const padding = currentStep.id === "ask-box" ? 6 : 5;
      setTargetRect({
        top: Math.max(4, rect.top - padding),
        left: Math.max(4, rect.left - padding),
        width: Math.min(vw - 8, rect.width + padding * 2),
        height: Math.min(vh - 8, rect.height + padding * 2),
      });
    };

    const el = document.querySelector(currentStep.selector) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    measure();
    const timer = window.setTimeout(measure, 120);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [isOpen, stepIndex]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[stepIndex];
  const isLastStep = stepIndex === TOUR_STEPS.length - 1;

  const cardWidth = Math.min(350, Math.max(270, viewport.width - 24));
  const estimatedCardHeight = 225;
  const margin = 12;

  let cardTop = Math.max(margin, Math.round((viewport.height - estimatedCardHeight) / 2));
  let cardLeft = Math.round((viewport.width - cardWidth) / 2);
  let caretSide: "top" | "bottom" | "none" = "none";
  let caretLeftOffset = 24;

  if (targetRect) {
    const spaceBelow = viewport.height - (targetRect.top + targetRect.height) - margin;
    const spaceAbove = targetRect.top - margin;

    const placeBelow =
      step.preferredPlacement === "bottom"
        ? spaceBelow >= 170 || spaceBelow >= spaceAbove
        : spaceAbove < 185 && spaceBelow > spaceAbove;

    if (placeBelow) {
      cardTop = Math.min(
        viewport.height - estimatedCardHeight - margin,
        targetRect.top + targetRect.height + 12
      );
      caretSide = "top";
    } else {
      cardTop = Math.max(margin, targetRect.top - estimatedCardHeight - 12);
      caretSide = "bottom";
    }

    const targetCenterX = targetRect.left + targetRect.width / 2;
    const rawLeft = targetCenterX - cardWidth / 2;
    cardLeft = Math.max(margin, Math.min(viewport.width - cardWidth - margin, rawLeft));
    caretLeftOffset = Math.max(18, Math.min(cardWidth - 28, targetCenterX - cardLeft - 6));
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={pickLabel("SuJu स्टडी गाइड", "SuJu Study Guided Tour", "SuJu Study Guide")}
    >
      {/* Dimmed Backdrop (when target isn't found yet, fallback dark overlay) */}
      {!targetRect && (
        <div
          className="fixed inset-0 bg-slate-900/60"
          onClick={onComplete}
          aria-hidden="true"
        />
      )}

      {/* Spotlight Cutout Frame */}
      {targetRect && (
        <>
          <div
            className="fixed inset-0"
            onClick={onComplete}
            aria-hidden="true"
          />
          <div
            aria-hidden="true"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.62)",
            }}
            className="pointer-events-none fixed rounded-xl border-2 border-amber-400 transition-all duration-200"
          />
        </>
      )}

      {/* Floating Tooltip Card */}
      <div
        style={{
          top: cardTop,
          left: cardLeft,
          width: cardWidth,
        }}
        className="fixed z-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl transition-all duration-200"
      >
        {/* Caret pointing to highlighted element */}
        {caretSide === "top" && (
          <div
            style={{ left: caretLeftOffset }}
            className="absolute -top-2 h-3.5 w-3.5 rotate-45 border-t border-l border-slate-200 bg-white"
            aria-hidden="true"
          />
        )}
        {caretSide === "bottom" && (
          <div
            style={{ left: caretLeftOffset }}
            className="absolute -bottom-2 h-3.5 w-3.5 rotate-45 border-r border-b border-slate-200 bg-white"
            aria-hidden="true"
          />
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold text-blue-700 tabular-nums">
              {pickLabel(
                `कदम ${stepIndex + 1} / ${TOUR_STEPS.length}`,
                `Step ${stepIndex + 1} of ${TOUR_STEPS.length}`,
                `Step ${stepIndex + 1} / ${TOUR_STEPS.length}`
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onComplete}
            aria-label={pickLabel("गाइड बंद करें", "Close guide", "Guide band karein")}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <h3 className="mt-2.5 text-sm font-bold text-slate-900 sm:text-base">
          {pickLabel(step.titleHi, step.titleEn, step.titleHinglish)}
        </h3>

        <p className="mt-1.5 text-xs leading-relaxed text-slate-700 sm:text-[13px]">
          {pickLabel(step.bodyHi, step.bodyEn, step.bodyHinglish)}
        </p>

        {/* Progress Indicator Bars */}
        <div className="mt-3.5 flex items-center gap-1.5" aria-hidden="true">
          {TOUR_STEPS.map((s, idx) => (
            <span
              key={s.id}
              className={`h-1 flex-1 rounded-full transition-colors ${
                idx <= stepIndex ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onComplete}
            className="min-h-[36px] whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            {pickLabel("छोड़ें (Skip)", "Skip", "Skip")}
          </button>

          <div className="flex items-center gap-1.5">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{pickLabel("पिछला", "Back", "Back")}</span>
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={onComplete}
                className="inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{pickLabel("समझ गया (Got it!)", "Got it!", "Samajh gaya!")}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setStepIndex((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1))
                }
                className="inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <span>{pickLabel("अगला (Next)", "Next", "Agla (Next)")}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
