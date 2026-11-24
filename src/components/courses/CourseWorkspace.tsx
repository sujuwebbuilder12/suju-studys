import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  EyeOff,
  HelpCircle,
  Lightbulb,
  Lock,
  MessageSquarePlus,
  Pause,
  Play,
  RefreshCw,
  Square,
  Terminal,
  Timer,
  Volume2,
  XCircle,
} from "lucide-react";
import {
  getPredefinedCourseSyllabus,
  TIER_METADATA,
  TIER_ORDER,
} from "../../data/coursesCatalog";
import type {
  BookChapter,
  CourseCategory,
  CourseProgressMap,
  CourseTier,
  ExamQuestion,
  GeneratedLesson,
} from "../../types/courses";
import type { LanguageMode } from "../../types/teacher";
import {
  getCompletedChapters,
  hasPassedTier,
  isTierUnlocked,
  loadCachedChapterLesson,
  loadCachedSyllabus,
  saveCachedChapterLesson,
  saveCachedSyllabus,
} from "../../utils/courseProgress";
import { cleanDisplayMarkdown, cleanInlineText } from "../../utils/formatMath";
import { parseStreamingLesson } from "../../utils/lessonStreamParser";
import {
  startChapterVoicePlayback,
  type ChapterSpeechStatus,
  type ChapterVoiceSession,
  type SpokenSectionItem,
} from "../../utils/speech";
import { CertificateModal } from "./CertificateModal";
import { ChapterIndexPanel } from "./ChapterIndexPanel";
import { CodeLabPanel, resolvePresetForTopic } from "./CodeLabPanel";

interface CourseWorkspaceProps {
  courseKey: string;
  courseCategory: CourseCategory;
  courseTitle: string;
  courseContext: string;
  stackTopics?: string[];
  language: LanguageMode;
  progress: CourseProgressMap;
  onBack: () => void;
  onRecordPass: (courseKey: string, tier: CourseTier, score: number) => void;
  onMarkChapterComplete: (
    courseKey: string,
    chapterNumber: number,
    completed?: boolean
  ) => void;
  onAskTeacher: (prompt: string) => void;
}

const TIMED_MOCK_DURATION_SEC = 20 * 60; // 20 minutes for 20-question mock test

function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getNextInitialChapter(
  progress: CourseProgressMap,
  courseKey: string
): number {
  const done = getCompletedChapters(progress, courseKey);
  for (let i = 1; i <= 16; i++) {
    if (!done.includes(i)) return i;
  }
  return 1;
}

export function CourseWorkspace({
  courseKey,
  courseCategory,
  courseTitle,
  courseContext,
  stackTopics,
  language,
  progress,
  onBack,
  onRecordPass,
  onMarkChapterComplete,
  onAskTeacher,
}: CourseWorkspaceProps) {
  const [activeTier, setActiveTier] = useState<CourseTier>("beginner");
  const [topicFocus, setTopicFocus] = useState<string>(
    stackTopics && stackTopics.length > 0 ? stackTopics[0] : ""
  );
  const [mode, setMode] = useState<"lesson" | "exam">("lesson");

  // Full Book 16-Chapter Syllabus State
  const [syllabus, setSyllabus] = useState<BookChapter[]>([]);
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [syllabusError, setSyllabusError] = useState<string | null>(null);
  const [activeChapterNumber, setActiveChapterNumber] = useState<number>(() =>
    getNextInitialChapter(progress, courseKey)
  );

  // Per-Chapter Lesson State
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonStreaming, setLessonStreaming] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [selectedTextbookMcqs, setSelectedTextbookMcqs] = useState<
    Record<number, number>
  >({});

  // Kids Voice Teacher State
  const isPrimaryKidsCourse = /^bseb-[1-5]-/.test(courseKey);
  const [voiceStatus, setVoiceStatus] = useState<ChapterSpeechStatus>("idle");
  const [voiceRate, setVoiceRate] = useState<number>(() =>
    /^bseb-[1-5]-/.test(courseKey) ? 0.78 : 0.98
  );
  const [activeSpokenSection, setActiveSpokenSection] = useState<string | null>(
    null
  );
  const voiceSessionRef = useRef<ChapterVoiceSession | null>(null);

  // Exam State (with Attempt Tracking for Fresh Questions on Retake)
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMED_MOCK_DURATION_SEC);
  const [timeTakenSec, setTimeTakenSec] = useState(0);
  const [examAttemptNumber, setExamAttemptNumber] = useState<number>(1);
  const askedQuestionsRef = useRef<Record<string, string[]>>({});

  const [certificateOpen, setCertificateOpen] = useState(false);
  const [showCodeLab, setShowCodeLab] = useState(false);
  const lessonCacheRef = useRef<Record<string, GeneratedLesson>>({});
  const lessonAbortRef = useRef<AbortController | null>(null);
  const prefetchInFlightRef = useRef<Set<string>>(new Set());
  const lessonTopRef = useRef<HTMLDivElement | null>(null);

  const pickLabel = (hi: string, en: string, hinglish: string) =>
    language === "english" ? en : language === "hinglish" ? hinglish : hi;

  const stopVoicePlayback = () => {
    voiceSessionRef.current?.stop();
    voiceSessionRef.current = null;
    setVoiceStatus("idle");
    setActiveSpokenSection(null);
  };

  useEffect(() => {
    return () => {
      voiceSessionRef.current?.stop();
      lessonAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    stopVoicePlayback();
    setShowCodeLab(false);
    setActiveChapterNumber(getNextInitialChapter(progress, courseKey));
    setActiveTier("beginner");
    setMode("lesson");
    setVoiceRate(/^bseb-[1-5]-/.test(courseKey) ? 0.78 : 0.98);
    setExamAttemptNumber(1);
    setTopicFocus(stackTopics && stackTopics.length > 0 ? stackTopics[0] : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseKey]);

  // Reset exercise toggles & stop speech on chapter/language/mode change
  useEffect(() => {
    stopVoicePlayback();
    setRevealedHints({});
    setRevealedAnswers({});
    setSelectedTextbookMcqs({});
  }, [courseKey, activeChapterNumber, language, topicFocus, mode]);

  const fetchSyllabus = async (forceRefresh = false) => {
    const predefined = getPredefinedCourseSyllabus(courseKey, language);
    if (predefined) {
      saveCachedSyllabus(courseKey, language, predefined);
      setSyllabus(predefined);
      setSyllabusError(null);
      return;
    }

    if (!forceRefresh) {
      const cached = loadCachedSyllabus(courseKey, language);
      if (cached && cached.length >= 14) {
        setSyllabus(cached);
        setSyllabusError(null);
        return;
      }
    }

    setSyllabusLoading(true);
    setSyllabusError(null);
    try {
      const res = await fetch("/api/course/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle,
          courseContext,
          courseCategory,
          language,
        }),
      });
      const data = (await res.json()) as {
        chapters?: BookChapter[];
        error?: string;
      };
      if (!res.ok || data.error || !Array.isArray(data.chapters)) {
        throw new Error(
          data.error ||
            "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।"
        );
      }

      saveCachedSyllabus(courseKey, language, data.chapters);
      setSyllabus(data.chapters);
    } catch (err: unknown) {
      setSyllabusError(
        err instanceof Error
          ? err.message
          : "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।"
      );
    } finally {
      setSyllabusLoading(false);
    }
  };

  useEffect(() => {
    void fetchSyllabus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseKey, language]);

  const activeChapter = syllabus.find(
    (c) => c.chapterNumber === activeChapterNumber
  );
  const completedChapters = getCompletedChapters(progress, courseKey);
  const totalChapters = syllabus.length || 16;
  const completedCount = completedChapters.filter(
    (n) => n >= 1 && n <= totalChapters
  ).length;
  const completionPct = Math.min(
    100,
    Math.round((completedCount / totalChapters) * 100)
  );
  const isCurrentChapterDone = completedChapters.includes(activeChapterNumber);

  const isTimedMockExam =
    courseCategory === "defence_govt" && activeTier === "professional";

  const tierTitle = (t: CourseTier) => {
    if (courseCategory === "defence_govt" && t === "professional") {
      return pickLabel(
        "लेवल 3: फुल-लेंथ मॉक टेस्ट",
        "Level 3: Full-Length Mock Test",
        "Level 3: Full-Length Mock Test"
      );
    }
    return pickLabel(
      TIER_METADATA[t].titleHi,
      TIER_METADATA[t].titleEn,
      TIER_METADATA[t].titleHinglish
    );
  };

  const tierDesc = (t: CourseTier) => {
    if (courseCategory === "defence_govt" && t === "professional") {
      return pickLabel(
        "20 मिनट का टाइमर मॉक टेस्ट (-0.25 नेगेटिव मार्किंग व स्कोर विश्लेषण)",
        "20-Min Timed Mock Test with -0.25 negative marking & instant score analysis",
        "20-Min Timed Mock Test (-0.25 negative marking) aur instant score analysis"
      );
    }
    return pickLabel(
      TIER_METADATA[t].descHi,
      TIER_METADATA[t].descEn,
      TIER_METADATA[t].descHinglish
    );
  };

  const buildSpokenSections = (
    currentLesson: GeneratedLesson
  ): SpokenSectionItem[] => {
    const items: SpokenSectionItem[] = [];
    const introParts = [
      cleanInlineText(currentLesson.lessonTitle),
      cleanInlineText(currentLesson.summary),
      currentLesson.zeroToHeroAnalogy
        ? cleanInlineText(currentLesson.zeroToHeroAnalogy)
        : "",
    ].filter(Boolean);

    if (introParts.length > 0) {
      items.push({
        id: "intro",
        label: pickLabel(
          "परिचय और भूमिका",
          "Classroom Introduction",
          "Introduction"
        ),
        text: introParts.join("। "),
      });
    }

    currentLesson.sections.forEach((sec, idx) => {
      const text = [
        cleanInlineText(sec.heading),
        sec.contentMarkdown,
        sec.keyTakeaway ? cleanInlineText(sec.keyTakeaway) : "",
      ]
        .filter(Boolean)
        .join("। ");
      if (text.trim()) {
        items.push({
          id: `section-${idx}`,
          label: cleanInlineText(sec.heading),
          text,
        });
      }
    });

    if (
      currentLesson.examImportantPoints &&
      currentLesson.examImportantPoints.length > 0
    ) {
      items.push({
        id: "revision",
        label: pickLabel(
          "त्वरित रिवीजन नोट्स",
          "Quick Revision Notes",
          "Quick Revision Notes"
        ),
        text: currentLesson.examImportantPoints.map(cleanInlineText).join("। "),
      });
    }

    return items;
  };

  const handlePlaySectionOrAll = (sectionId?: string) => {
    if (!lesson) return;
    const sectionsToRead = buildSpokenSections(lesson);
    if (sectionsToRead.length === 0) return;

    // If clicking the same active section button, toggle stop
    if (sectionId && activeSpokenSection === sectionId && voiceStatus !== "idle") {
      stopVoicePlayback();
      return;
    }

    const startIdx = sectionId
      ? Math.max(
          0,
          sectionsToRead.findIndex((s) => s.id === sectionId)
        )
      : 0;

    voiceSessionRef.current?.stop();
    voiceSessionRef.current = startChapterVoicePlayback({
      sections: sectionsToRead,
      language,
      initialRate: voiceRate,
      startIndex: startIdx,
      onSectionChange: (id) => setActiveSpokenSection(id),
      onStatusChange: (status) => {
        setVoiceStatus(status);
        if (status === "idle") {
          voiceSessionRef.current = null;
        }
      },
    });
  };

  const handleTogglePlayPauseAll = () => {
    if (voiceStatus === "playing") {
      voiceSessionRef.current?.pause();
    } else if (voiceStatus === "paused") {
      voiceSessionRef.current?.resume();
    } else {
      handlePlaySectionOrAll();
    }
  };

  const handleChangeVoiceRate = (nextRate: number) => {
    setVoiceRate(nextRate);
    voiceSessionRef.current?.setRate(nextRate);
  };

  const fetchLesson = async (forceRefresh = false) => {
    const chapterTier: CourseTier = activeChapter?.tier || activeTier;
    const memCacheKey = `${courseKey}::ch${activeChapterNumber}::${topicFocus}::${language}`;

    lessonAbortRef.current?.abort();

    if (!forceRefresh) {
      if (lessonCacheRef.current[memCacheKey]) {
        setLesson(lessonCacheRef.current[memCacheKey]);
        setLessonError(null);
        setLessonLoading(false);
        setLessonStreaming(false);
        return;
      }
      const localCached = loadCachedChapterLesson(
        courseKey,
        activeChapterNumber,
        language,
        topicFocus
      );
      if (localCached) {
        lessonCacheRef.current[memCacheKey] = localCached;
        setLesson(localCached);
        setLessonError(null);
        setLessonLoading(false);
        setLessonStreaming(false);
        return;
      }
    }

    const controller = new AbortController();
    lessonAbortRef.current = controller;
    setLessonLoading(true);
    setLessonStreaming(true);
    setLessonError(null);
    setLesson(null);

    try {
      const res = await fetch("/api/course/lesson-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle,
          courseContext,
          courseCategory,
          tier: chapterTier,
          language,
          topicFocus,
          chapterNumber: activeChapterNumber,
          chapterTitle: activeChapter?.title || "",
          chapterTopics: activeChapter?.keyTopics || [],
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let errMsg =
          "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।";
        try {
          const errData = (await res.json()) as { error?: string };
          if (errData?.error) errMsg = errData.error;
        } catch {
          // keep fallback
        }
        throw new Error(errMsg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";
      let rawLessonText = "";
      let firstRenderDone = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const events = sseBuffer.split("\n\n");
        sseBuffer = events.pop() ?? "";

        for (const eventChunk of events) {
          for (const line of eventChunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            const parsedEvent = JSON.parse(jsonStr) as {
              type: "chunk" | "done" | "error";
              text?: string;
              message?: string;
            };

            if (parsedEvent.type === "chunk" && parsedEvent.text) {
              rawLessonText += parsedEvent.text;
              const liveLesson = parseStreamingLesson(
                rawLessonText,
                activeChapter?.title || courseTitle
              );

              if (
                !firstRenderDone &&
                (liveLesson.summary ||
                  liveLesson.zeroToHeroAnalogy ||
                  liveLesson.sections.length > 0)
              ) {
                firstRenderDone = true;
                setLessonLoading(false);
              }
              if (firstRenderDone) {
                setLesson(liveLesson);
              }
            } else if (parsedEvent.type === "error") {
              throw new Error(
                parsedEvent.message ||
                  "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।"
              );
            }
          }
        }
      }

      const finalLesson = parseStreamingLesson(
        rawLessonText,
        activeChapter?.title || courseTitle
      );

      if (finalLesson.sections.length === 0) {
        throw new Error(
          "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।"
        );
      }

      lessonCacheRef.current[memCacheKey] = finalLesson;
      saveCachedChapterLesson(
        courseKey,
        activeChapterNumber,
        language,
        finalLesson,
        topicFocus
      );
      setLesson(finalLesson);
      setLessonLoading(false);
      setLessonStreaming(false);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setLessonStreaming(false);
        return;
      }
      setLessonLoading(false);
      setLessonStreaming(false);
      setLessonError(
        err instanceof Error
          ? err.message
          : "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।"
      );
    }
  };

  // Load chapter lesson once syllabus is resolved (or if syllabus errored, still load fallback lesson)
  useEffect(() => {
    if (mode !== "lesson") return;
    if (syllabusLoading) return;
    if (syllabus.length === 0 && !syllabusError) return;
    void fetchLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    courseKey,
    activeChapterNumber,
    topicFocus,
    language,
    mode,
    syllabusLoading,
    syllabus.length,
    syllabusError,
  ]);

  // Background Pre-Fetch: silently cache the next chapter while student reads the current chapter
  useEffect(() => {
    if (mode !== "lesson" || lessonLoading || lessonStreaming || !lesson) {
      return;
    }
    const nextNum = activeChapterNumber + 1;
    if (nextNum > totalChapters) return;

    const nextChapter = syllabus.find((c) => c.chapterNumber === nextNum);
    const nextCacheKey = `${courseKey}::ch${nextNum}::${topicFocus}::${language}`;

    if (
      lessonCacheRef.current[nextCacheKey] ||
      loadCachedChapterLesson(courseKey, nextNum, language, topicFocus) ||
      prefetchInFlightRef.current.has(nextCacheKey)
    ) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (prefetchInFlightRef.current.has(nextCacheKey)) return;
      prefetchInFlightRef.current.add(nextCacheKey);

      void (async () => {
        try {
          const res = await fetch("/api/course/lesson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseTitle,
              courseContext,
              courseCategory,
              tier: nextChapter?.tier || activeTier,
              language,
              topicFocus,
              chapterNumber: nextNum,
              chapterTitle: nextChapter?.title || "",
              chapterTopics: nextChapter?.keyTopics || [],
            }),
            signal: controller.signal,
          });
          if (!res.ok) return;
          const data = (await res.json()) as GeneratedLesson & { error?: string };
          if (data && !data.error && Array.isArray(data.sections) && data.sections.length > 0) {
            lessonCacheRef.current[nextCacheKey] = data;
            saveCachedChapterLesson(
              courseKey,
              nextNum,
              language,
              data,
              topicFocus
            );
          }
        } catch {
          // Silent background prefetch failure is harmless
        } finally {
          prefetchInFlightRef.current.delete(nextCacheKey);
        }
      })();
    }, 900);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    lessonLoading,
    lessonStreaming,
    activeChapterNumber,
    totalChapters,
    courseKey,
    language,
    topicFocus,
    syllabus.length,
  ]);

  const submitExamWithStats = (
    questions: ExamQuestion[],
    answers: Record<number, number>
  ) => {
    if (questions.length === 0) return;
    setExamSubmitted(true);
    setTimeTakenSec(TIMED_MOCK_DURATION_SEC - secondsLeft);

    const total = questions.length;
    let correct = 0;
    let wrong = 0;
    for (const q of questions) {
      const chosen = answers[q.id];
      if (typeof chosen === "number") {
        if (chosen === q.correctIndex) correct++;
        else wrong++;
      }
    }

    const netScore = isTimedMockExam ? correct - wrong * 0.25 : correct;
    const pct = Math.max(0, Math.round((netScore / total) * 100));
    const normalizedOutOf10 = Math.max(
      0,
      Math.min(10, Math.round((netScore / total) * 10))
    );

    if (pct >= 60) {
      onRecordPass(courseKey, activeTier, Math.max(6, normalizedOutOf10));
    }
  };

  // Live countdown timer for Level 3 Defence & Govt Full-Length Timed Mock Test
  useEffect(() => {
    if (
      mode !== "exam" ||
      !isTimedMockExam ||
      examLoading ||
      examSubmitted ||
      examQuestions.length === 0
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          submitExamWithStats(examQuestions, selectedAnswers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isTimedMockExam, examLoading, examSubmitted, examQuestions.length]);

  const startExam = async (tierOverride?: CourseTier, isRetake = false) => {
    const requestedTier = tierOverride ?? activeTier;
    const targetTier = isTierUnlocked(progress, courseKey, requestedTier)
      ? requestedTier
      : hasPassedTier(progress, courseKey, "beginner")
        ? hasPassedTier(progress, courseKey, "advance")
          ? "professional"
          : "advance"
        : "beginner";

    const historyKey = `${courseKey}::${targetTier}::${topicFocus}`;
    const prevQs = askedQuestionsRef.current[historyKey] || [];
    const nextAttempt = isRetake
      ? examAttemptNumber + 1
      : prevQs.length > 0
        ? Math.floor(prevQs.length / (courseCategory === "defence_govt" && targetTier === "professional" ? 20 : 10)) + 1
        : 1;

    setExamAttemptNumber(nextAttempt);
    setActiveTier(targetTier);
    const timedMock =
      courseCategory === "defence_govt" && targetTier === "professional";

    setMode("exam");
    setExamLoading(true);
    setExamError(null);
    setSelectedAnswers({});
    setExamSubmitted(false);
    setSecondsLeft(TIMED_MOCK_DURATION_SEC);
    setTimeTakenSec(0);

    try {
      const res = await fetch("/api/course/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle,
          courseContext,
          courseCategory,
          tier: targetTier,
          language,
          topicFocus,
          questionCount: timedMock ? 20 : 10,
          attemptNumber: nextAttempt,
          previousQuestions: prevQs,
        }),
      });

      const data = (await res.json()) as {
        questions?: ExamQuestion[];
        error?: string;
      };
      if (!res.ok || data.error || !Array.isArray(data.questions)) {
        throw new Error(
          data.error ||
            "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।"
        );
      }

      askedQuestionsRef.current[historyKey] = [
        ...prevQs,
        ...data.questions.map((q) => q.question),
      ].slice(-40);
      setExamQuestions(data.questions);
    } catch (err: unknown) {
      setExamError(
        err instanceof Error
          ? err.message
          : "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।"
      );
    } finally {
      setExamLoading(false);
    }
  };

  const handleSelectChapter = (ch: BookChapter) => {
    setActiveChapterNumber(ch.chapterNumber);
    if (isTierUnlocked(progress, courseKey, ch.tier)) {
      setActiveTier(ch.tier);
    }
    setMode("lesson");
    lessonTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCompleteAndNextChapter = () => {
    onMarkChapterComplete(courseKey, activeChapterNumber, true);
    if (activeChapterNumber < totalChapters) {
      const nextNum = activeChapterNumber + 1;
      const nextCh = syllabus.find((c) => c.chapterNumber === nextNum);
      setActiveChapterNumber(nextNum);
      if (nextCh && isTierUnlocked(progress, courseKey, nextCh.tier)) {
        setActiveTier(nextCh.tier);
      }
      lessonTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const totalQuestions = examQuestions.length || (isTimedMockExam ? 20 : 10);
  const correctCount = examSubmitted
    ? examQuestions.reduce(
        (acc, q) => acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0),
        0
      )
    : 0;
  const wrongCount = examSubmitted
    ? examQuestions.reduce((acc, q) => {
        const chosen = selectedAnswers[q.id];
        return (
          acc + (typeof chosen === "number" && chosen !== q.correctIndex ? 1 : 0)
        );
      }, 0)
    : 0;
  const skippedCount = examSubmitted
    ? totalQuestions - correctCount - wrongCount
    : 0;
  const attemptedCount = correctCount + wrongCount;
  const accuracyPct =
    attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  const netMarks = isTimedMockExam
    ? Math.max(0, Number((correctCount - wrongCount * 0.25).toFixed(2)))
    : correctCount;
  const percentage = Math.max(0, Math.round((netMarks / totalQuestions) * 100));
  const isPassed = examSubmitted && percentage >= 60;

  const profBestScore = progress[courseKey]?.passedTiers?.professional;
  const hasCertificate = typeof profBestScore === "number" && profBestScore >= 6;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
      {/* Top Breadcrumb & Certificate Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>
            {pickLabel("सभी कोर्स (Library)", "All Courses", "All Courses (Library)")}
          </span>
        </button>

        {hasCertificate && (
          <button
            type="button"
            onClick={() => setCertificateOpen(true)}
            className="inline-flex min-h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 sm:text-sm"
          >
            <Award className="h-4 w-4 text-amber-600" aria-hidden="true" />
            <span>
              {pickLabel(
                "सर्टिफिकेट देखें (Certificate)",
                "View Certificate",
                "View Certificate"
              )}
            </span>
          </button>
        )}
      </div>

      {/* Course Header + Live Book Completion Progress Bar */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {courseTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{courseContext}</p>
          </div>

          {/* Book Completion Progress Meter */}
          <div className="w-full shrink-0 rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 lg:w-72">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-700">
                {pickLabel("पुस्तक प्रगति", "Book Progress", "Book Progress")}
              </span>
              <span className="font-bold text-emerald-700 tabular-nums">
                {completedCount}/{totalChapters}{" "}
                {pickLabel("अध्याय", "Chapters", "Chapters")} · {completionPct}%
              </span>
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuenow={completionPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Subject / Syllabus Topic Focus Tabs */}
        {stackTopics && stackTopics.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {stackTopics.map((topic) => {
              const active = topicFocus === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setTopicFocus(topic);
                    setMode("lesson");
                  }}
                  className={`min-h-[34px] rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        )}

        {/* 3-Tier Exam Stepper (Beginner -> Advance -> Professional) */}
        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {TIER_ORDER.map((tier) => {
            const unlocked = isTierUnlocked(progress, courseKey, tier);
            const passed = hasPassedTier(progress, courseKey, tier);
            const bestScore = progress[courseKey]?.passedTiers?.[tier];
            const isSelected = activeTier === tier;

            return (
              <button
                key={tier}
                type="button"
                disabled={!unlocked}
                onClick={() => {
                  setActiveTier(tier);
                  const firstCh =
                    tier === "beginner" ? 1 : tier === "advance" ? 6 : 12;
                  setActiveChapterNumber(firstCh);
                  setMode("lesson");
                }}
                className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                  !unlocked
                    ? "cursor-not-allowed border-slate-200 bg-slate-50/70 opacity-65"
                    : isSelected
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-100"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {tierTitle(tier)}
                  </span>
                  {!unlocked ? (
                    <Lock
                      className="h-4 w-4 shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                  ) : passed ? (
                    <CheckCircle2
                      className="h-4.5 w-4.5 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                  ) : (
                    <BookOpen
                      className="h-4 w-4 shrink-0 text-blue-600"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {tierDesc(tier)}
                </p>
                <p className="mt-2 text-[11px] font-medium text-slate-500 tabular-nums">
                  {!unlocked
                    ? pickLabel(
                        "पिछले लेवल में 60% लाकर एग्जाम अनलॉक करें",
                        "Pass previous level (60%) to unlock exam",
                        "Pichhle level me 60% laakar exam unlock karein"
                      )
                    : passed
                      ? `Passed · Best: ${bestScore}/10`
                      : pickLabel(
                          "पढ़ने के लिए तैयार · 60% पास परीक्षा",
                          "Ready · 60% pass exam",
                          "Ready · 60% pass exam"
                        )}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Switcher & Action Bar */}
      <div
        ref={lessonTopRef}
        className="mt-4 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("lesson")}
            className={`min-h-[36px] shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
              mode === "lesson"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {pickLabel(
              "पूरी किताब व अध्याय (Book)",
              "Full Book Chapters",
              "Full Book Chapters"
            )}
          </button>
          <button
            type="button"
            onClick={() => void startExam()}
            className={`min-h-[36px] shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
              mode === "exam"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isTimedMockExam
              ? pickLabel(
                  "फुल मॉक टेस्ट (20 प्रश्न · टाइमर)",
                  "Full Timed Mock Test (20 Qs)",
                  "Full Timed Mock Test (20 Qs)"
                )
              : pickLabel(
                  "10-प्रश्नों की परीक्षा (Exam)",
                  "10-Question Exam",
                  "10-Question Exam"
                )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {courseCategory === "technology" && (
            <button
              type="button"
              onClick={() => setShowCodeLab(true)}
              className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-900 transition-colors hover:border-emerald-400 hover:bg-emerald-100 sm:text-sm"
            >
              <Terminal className="h-4 w-4" aria-hidden="true" />
              <span>
                {pickLabel(
                  "Live Terminal में प्रैक्टिस करें",
                  "Practice in Live Terminal",
                  "Practice in Live Terminal"
                )}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onAskTeacher(
                lesson?.askTeacherPrompt ||
                  pickLabel(
                    `${courseTitle} — अध्याय ${activeChapterNumber} (${activeChapter?.title || topicFocus || activeTier}) को आसान भाषा और उदाहरण के साथ स्टेप-बाय-स्टेप समझाइए।`,
                    `Explain Chapter ${activeChapterNumber} (${activeChapter?.title || topicFocus || activeTier}) of ${courseTitle} step-by-step with easy examples.`,
                    `${courseTitle} ke Chapter ${activeChapterNumber} (${activeChapter?.title || topicFocus || activeTier}) ko easy examples ke saath step-by-step samjhaiye.`
                  )
              )
            }
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800 transition-colors hover:border-blue-400 hover:bg-blue-100 sm:text-sm"
          >
            <MessageSquarePlus
              className="h-4 w-4 text-blue-600"
              aria-hidden="true"
            />
            <span>
              {pickLabel(
                "SuJu AI गुरुजी से पूछें",
                "Ask SuJu AI Teacher",
                "Ask SuJu AI Guruji"
              )}
            </span>
          </button>
        </div>
      </div>

      {courseCategory === "technology" && showCodeLab && (
        <CodeLabPanel
          language={language}
          initialPreset={resolvePresetForTopic(
            topicFocus || activeChapter?.title || courseTitle
          )}
          onClose={() => setShowCodeLab(false)}
          onAskTeacher={onAskTeacher}
        />
      )}

      {/* Content Stage: Full Book Chapters (2-column) OR Exam */}
      {mode === "lesson" ? (
        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
          {/* Left Column: 15-Chapter Book Index */}
          <div className="lg:col-span-4">
            <ChapterIndexPanel
              chapters={syllabus}
              activeChapterNumber={activeChapterNumber}
              completedChapters={completedChapters}
              loading={syllabusLoading}
              error={syllabusError}
              language={language}
              onSelectChapter={handleSelectChapter}
              onRetrySyllabus={() => void fetchSyllabus(true)}
            />
          </div>

          {/* Right Column: Full Textbook Chapter Lesson */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-8">
            {syllabusLoading || lessonLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                <p className="text-sm font-medium text-slate-600">
                  {syllabusLoading
                    ? pickLabel(
                        "पूरी पुस्तक की 16-अध्याय मास्टर सूची तैयार हो रही है...",
                        "Building the complete 16-chapter master book index...",
                        "Poori book ki 16-chapter master index taiyar ho rahi hai..."
                      )
                    : pickLabel(
                        `SuJu AI गुरुजी अध्याय ${activeChapterNumber} का पूरा क्लासरूम पाठ तैयार कर रहे हैं...`,
                        `SuJu AI Guruji is preparing Chapter ${activeChapterNumber} as a complete classroom textbook...`,
                        `SuJu AI Guruji Chapter ${activeChapterNumber} ka full classroom textbook lesson taiyar kar rahe hain...`
                      )}
                </p>
              </div>
            ) : lessonError ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-sm font-medium text-red-700">{lessonError}</p>
                <button
                  type="button"
                  onClick={() => void fetchLesson(true)}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  <span>Retry</span>
                </button>
              </div>
            ) : lesson ? (
              <div>
                {/* Chapter Header */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 tabular-nums">
                    <span className="font-semibold text-blue-700">
                      {pickLabel(
                        `अध्याय ${activeChapterNumber} / ${totalChapters}`,
                        `Chapter ${activeChapterNumber} of ${totalChapters}`,
                        `Chapter ${activeChapterNumber} of ${totalChapters}`
                      )}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{tierTitle(activeChapter?.tier || activeTier)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {lesson.estimatedMinutes} min
                    </span>
                    {isCurrentChapterDone && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          {pickLabel("पूरा हुआ", "Completed", "Completed")}
                        </span>
                      </>
                    )}
                    {lessonStreaming && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-blue-600">
                          {pickLabel("लिखा जा रहा है...", "Writing live...", "Live streaming...")}
                        </span>
                      </>
                    )}
                  </div>

                  <h2 className="mt-1.5 text-xl font-bold text-slate-900 sm:text-2xl">
                    {cleanInlineText(lesson.lessonTitle)}
                  </h2>
                  {lesson.summary && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {cleanInlineText(lesson.summary)}
                    </p>
                  )}
                </div>

                {/* Kids Voice Teacher & Full Chapter Audio Player Bar */}
                {!lessonStreaming && (
                  <div className="mt-4 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/70 to-blue-50/70 p-3.5 sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                          <Volume2 className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {isPrimaryKidsCourse
                              ? pickLabel(
                                  "गुरुजी से सुनें (बच्चों के लिए बोलकर पढ़ाई)",
                                  "Listen to Guruji (Voice Teacher for Kids)",
                                  "Guruji se Sunein (Baccho ke liye Audio)"
                                )
                              : pickLabel(
                                  "गुरुजी से सुनें (Listen to Lesson)",
                                  "Listen to Guruji (Audio Lesson)",
                                  "Guruji se Sunein (Listen to Lesson)"
                                )}
                          </p>
                          <p className="text-xs text-slate-600">
                            {activeSpokenSection
                              ? pickLabel(
                                  "अभी गुरुजी पढ़कर सुना रहे हैं — नीचे हाइलाइट देखें",
                                  "Reading aloud — highlighted section below",
                                  "Abhi Guruji padh kar suna rahe hain"
                                )
                              : pickLabel(
                                  "पढ़ने में दिक्कत हो तो Play दबाएं और पूरा पाठ सुनें",
                                  "Tap Play to hear the full lesson explained aloud",
                                  "Play dabayein aur poora path bolkar sunein"
                                )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleTogglePlayPauseAll}
                          className="inline-flex min-h-[42px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-700 sm:text-sm"
                        >
                          {voiceStatus === "playing" ? (
                            <>
                              <Pause className="h-4 w-4" aria-hidden="true" />
                              <span>{pickLabel("रोकें (Pause)", "Pause", "Pause")}</span>
                            </>
                          ) : voiceStatus === "paused" ? (
                            <>
                              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                              <span>{pickLabel("जारी रखें (Resume)", "Resume", "Resume")}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-4 w-4" aria-hidden="true" />
                              <span>
                                {pickLabel(
                                  "गुरुजी से सुनें",
                                  "Listen to Lesson",
                                  "Guruji se Sunein"
                                )}
                              </span>
                            </>
                          )}
                        </button>

                        {voiceStatus !== "idle" && (
                          <button
                            type="button"
                            onClick={stopVoicePlayback}
                            className="inline-flex min-h-[42px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          >
                            <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                            <span>{pickLabel("बंद करें", "Stop", "Stop")}</span>
                          </button>
                        )}

                        {/* Slow / Normal Speed Toggle */}
                        <div className="flex items-center gap-1 rounded-xl border border-amber-200 bg-white/90 p-1">
                          <button
                            type="button"
                            onClick={() => handleChangeVoiceRate(0.78)}
                            className={`min-h-[34px] shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                              voiceRate <= 0.85
                                ? "bg-amber-600 text-white"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {pickLabel("धीमा (बच्चों के लिए)", "Slow", "Slow (Kids)")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeVoiceRate(0.98)}
                            className={`min-h-[34px] shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                              voiceRate > 0.85
                                ? "bg-amber-600 text-white"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {pickLabel("सामान्य", "Normal", "Normal")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1. शिक्षक की भूमिका और परिचय — Classroom Introduction */}
                {lesson.zeroToHeroAnalogy && (
                  <div
                    className={`mt-5 rounded-xl border p-4 transition-all ${
                      activeSpokenSection === "intro"
                        ? "border-amber-500 bg-amber-50 ring-2 ring-amber-300"
                        : "border-amber-200/90 bg-amber-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 sm:text-sm">
                        <Lightbulb
                          className="h-4 w-4 shrink-0 text-amber-600"
                          aria-hidden="true"
                        />
                        <span>
                          {pickLabel(
                            "शिक्षक की भूमिका और परिचय (Classroom Introduction)",
                            "Classroom Introduction & Blackboard Intuition",
                            "Shikshak ki Bhumika aur Parichay (Classroom Intro)"
                          )}
                        </span>
                      </div>
                      {!lessonStreaming && (
                        <button
                          type="button"
                          onClick={() => handlePlaySectionOrAll("intro")}
                          aria-label={pickLabel("परिचय सुनें", "Listen to introduction", "Intro sunein")}
                          className={`inline-flex min-h-[32px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                            activeSpokenSection === "intro" && voiceStatus === "playing"
                              ? "border-amber-600 bg-amber-600 text-white"
                              : "border-amber-200 bg-white text-amber-900 hover:bg-amber-100"
                          }`}
                        >
                          {activeSpokenSection === "intro" && voiceStatus === "playing" ? (
                            <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          <span>{pickLabel("सुनें", "Listen", "Sunein")}</span>
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-800">
                      {cleanInlineText(lesson.zeroToHeroAnalogy)}
                    </p>
                  </div>
                )}

                {/* Detailed Textbook Sections */}
                <div className="mt-5 space-y-6">
                  {lesson.sections.map((section, idx) => {
                    const secId = `section-${idx}`;
                    const isReadingThis = activeSpokenSection === secId;

                    return (
                      <section
                        key={idx}
                        className={`rounded-xl border p-4 transition-all sm:p-5 ${
                          isReadingThis
                            ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-300"
                            : "border-slate-200/80 bg-slate-50/40"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                            {idx + 1}. {cleanInlineText(section.heading)}
                          </h3>
                          <div className="flex items-center gap-2">
                            {!lessonStreaming && (
                              <button
                                type="button"
                                onClick={() => handlePlaySectionOrAll(secId)}
                                aria-label={pickLabel("यह भाग सुनें", "Listen to section", "Section sunein")}
                                className={`inline-flex min-h-[34px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                                  isReadingThis && voiceStatus === "playing"
                                    ? "border-amber-600 bg-amber-600 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
                                }`}
                              >
                                {isReadingThis && voiceStatus === "playing" ? (
                                  <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                                ) : (
                                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                                <span>{pickLabel("सुनें", "Listen", "Sunein")}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                onAskTeacher(
                                  pickLabel(
                                    `${courseTitle} (अध्याय ${activeChapterNumber}) के "${cleanInlineText(section.heading)}" टॉपिक को और भी आसान भाषा में उदाहरण सहित समझाइए।`,
                                    `Please explain "${cleanInlineText(section.heading)}" from Chapter ${activeChapterNumber} of ${courseTitle} in simpler words with an example.`,
                                    `${courseTitle} (Chapter ${activeChapterNumber}) ke "${cleanInlineText(section.heading)}" topic ko aur aasaan language me example ke saath samjhaiye.`
                                  )
                                )
                              }
                              className="inline-flex min-h-[34px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50"
                            >
                              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>
                                {pickLabel("गुरुजी से पूछें", "Ask Doubt", "Guruji se puchein")}
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="teacher-prose mt-3">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {cleanDisplayMarkdown(section.contentMarkdown)}
                          </ReactMarkdown>
                        </div>

                        {section.keyTakeaway && (
                          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-800 sm:text-sm">
                            <span className="font-bold text-blue-800">
                              {pickLabel("मुख्य बात: ", "Key Takeaway: ", "Mukhya Baat: ")}
                            </span>
                            {cleanInlineText(section.keyTakeaway)}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>

                {/* त्वरित रिवीजन नोट्स (Quick Revision Key Points) */}
                {lesson.examImportantPoints &&
                  lesson.examImportantPoints.length > 0 && (
                    <div
                      className={`mt-6 rounded-xl border p-4 transition-all sm:p-5 ${
                        activeSpokenSection === "revision"
                          ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-300"
                          : "border-emerald-200 bg-emerald-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-emerald-950 sm:text-base">
                          {pickLabel(
                            "त्वरित रिवीजन नोट्स (Quick Revision Key Points)",
                            "Quick Revision Key Points (Exam Day Notes)",
                            "Quick Revision Notes (Exam Key Points)"
                          )}
                        </h3>
                        {!lessonStreaming && (
                          <button
                            type="button"
                            onClick={() => handlePlaySectionOrAll("revision")}
                            className={`inline-flex min-h-[32px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                              activeSpokenSection === "revision" && voiceStatus === "playing"
                                ? "border-amber-600 bg-amber-600 text-white"
                                : "border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-100"
                            }`}
                          >
                            {activeSpokenSection === "revision" && voiceStatus === "playing" ? (
                              <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            <span>{pickLabel("सुनें", "Listen", "Sunein")}</span>
                          </button>
                        )}
                      </div>
                      <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-800 sm:text-sm">
                        {lesson.examImportantPoints.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-0.5 font-bold text-emerald-700 tabular-nums">
                              {idx + 1}.
                            </span>
                            <span>{cleanInlineText(pt)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* पाठ्यपुस्तक अभ्यास प्रश्नोत्तर (Textbook Exercise Q&A: Objective MCQs + Short + Long Answer) */}
                {lesson.textbookExercises && (
                  <div className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                        {pickLabel(
                          "पाठ्यपुस्तक अभ्यास प्रश्नोत्तर (Textbook Exercise Q&A)",
                          "Textbook Exercise Q&A (Objective, Short & Long Answers)",
                          "Textbook Exercise Q&A (Objective, Short & Long)"
                        )}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {pickLabel(
                          "परीक्षा पैटर्न के अनुसार वस्तुनिष्ठ (MCQ), लघु उत्तरीय और दीर्घ उत्तरीय प्रश्न व आदर्श उत्तर।",
                          "Exam-ready Objective MCQs, Short Answer, and Long Answer model solutions.",
                          "Exam pattern ke anusar Objective MCQs, Short Answer aur Long Answer model solutions."
                        )}
                      </p>
                    </div>

                    {/* 1. Objective MCQs */}
                    {lesson.textbookExercises.objectiveMcqs?.length > 0 && (
                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        <h4 className="text-xs font-bold tracking-wide text-blue-800 sm:text-sm">
                          {pickLabel(
                            "क. वस्तुनिष्ठ प्रश्न (Important Objective MCQs)",
                            "A. Important Objective MCQs",
                            "A. Important Objective MCQs"
                          )}
                        </h4>

                        <div className="space-y-3">
                          {lesson.textbookExercises.objectiveMcqs.map((mcq, mIdx) => {
                            const chosen = selectedTextbookMcqs[mIdx];
                            const hasChosen = typeof chosen === "number";

                            return (
                              <div
                                key={mIdx}
                                className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5"
                              >
                                <p className="text-xs font-semibold leading-relaxed text-slate-900 sm:text-sm">
                                  <span className="mr-1.5 text-blue-700 tabular-nums">
                                    {mIdx + 1}.
                                  </span>
                                  {cleanInlineText(mcq.question)}
                                </p>

                                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  {mcq.options.map((opt, optIdx) => {
                                    const isSelected = chosen === optIdx;
                                    const isRight = mcq.correctIndex === optIdx;
                                    let optStyle =
                                      "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50/50";
                                    if (hasChosen) {
                                      if (isRight) {
                                        optStyle =
                                          "border-emerald-400 bg-emerald-50 font-semibold text-emerald-950";
                                      } else if (isSelected && !isRight) {
                                        optStyle =
                                          "border-red-400 bg-red-50 text-red-950";
                                      } else {
                                        optStyle =
                                          "border-slate-200 bg-white/60 text-slate-500";
                                      }
                                    }

                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        onClick={() =>
                                          setSelectedTextbookMcqs((prev) => ({
                                            ...prev,
                                            [mIdx]: optIdx,
                                          }))
                                        }
                                        className={`min-h-[38px] rounded-lg border px-3 py-1.5 text-left text-xs transition-colors sm:text-[13px] ${optStyle}`}
                                      >
                                        <span className="mr-1.5 font-semibold">
                                          {String.fromCharCode(65 + optIdx)}.
                                        </span>
                                        {cleanInlineText(opt)}
                                      </button>
                                    );
                                  })}
                                </div>

                                {hasChosen && mcq.explanation && (
                                  <p className="mt-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-700">
                                    <span className="font-semibold text-slate-900">
                                      {pickLabel("व्याख्या: ", "Explanation: ", "Explanation: ")}
                                    </span>
                                    {cleanInlineText(mcq.explanation)}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. Short Answer Questions */}
                    {lesson.textbookExercises.shortAnswers?.length > 0 && (
                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        <h4 className="text-xs font-bold tracking-wide text-indigo-800 sm:text-sm">
                          {pickLabel(
                            "ख. लघु उत्तरीय प्रश्न (Short Answer Questions · 2–3 Marks)",
                            "B. Short Answer Questions (2–3 Marks)",
                            "B. Short Answer Questions (Laghu Uttariya)"
                          )}
                        </h4>

                        <div className="space-y-3">
                          {lesson.textbookExercises.shortAnswers.map((ex, idx) => {
                            const keyId = `short-${idx}`;
                            const showHint = !!revealedHints[keyId];
                            const showAnswer = !!revealedAnswers[keyId];

                            return (
                              <div
                                key={keyId}
                                className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5"
                              >
                                <p className="text-xs font-semibold leading-relaxed text-slate-900 sm:text-sm">
                                  <span className="mr-1.5 text-indigo-700 tabular-nums">
                                    Q{idx + 1}.
                                  </span>
                                  {cleanInlineText(ex.question)}
                                </p>

                                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                  {ex.hint && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setRevealedHints((prev) => ({
                                          ...prev,
                                          [keyId]: !prev[keyId],
                                        }))
                                      }
                                      className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-amber-300 hover:bg-amber-50"
                                    >
                                      <Lightbulb
                                        className="h-3.5 w-3.5 text-amber-600"
                                        aria-hidden="true"
                                      />
                                      <span>
                                        {showHint
                                          ? pickLabel("संकेत छुपाएं", "Hide Hint", "Hint Chhupayein")
                                          : pickLabel("संकेत देखें", "Show Hint", "Hint Dekhein")}
                                      </span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRevealedAnswers((prev) => ({
                                        ...prev,
                                        [keyId]: !prev[keyId],
                                      }))
                                    }
                                    className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 hover:border-blue-300 hover:bg-blue-100"
                                  >
                                    {showAnswer ? (
                                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                                    ) : (
                                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                    )}
                                    <span>
                                      {showAnswer
                                        ? pickLabel("आदर्श उत्तर छुपाएं", "Hide Answer", "Answer Chhupayein")
                                        : pickLabel("आदर्श उत्तर देखें", "Show Model Answer", "Model Answer Dekhein")}
                                    </span>
                                  </button>
                                </div>

                                {showHint && ex.hint && (
                                  <p className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-950">
                                    <span className="font-semibold">
                                      {pickLabel("संकेत: ", "Hint: ", "Hint: ")}
                                    </span>
                                    {cleanInlineText(ex.hint)}
                                  </p>
                                )}

                                {showAnswer && (
                                  <div className="teacher-prose mt-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs text-slate-800 sm:text-sm">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm, remarkMath]}
                                      rehypePlugins={[rehypeKatex]}
                                    >
                                      {cleanDisplayMarkdown(ex.answer)}
                                    </ReactMarkdown>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. Long Answer Questions */}
                    {lesson.textbookExercises.longAnswers?.length > 0 && (
                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        <h4 className="text-xs font-bold tracking-wide text-emerald-800 sm:text-sm">
                          {pickLabel(
                            "ग. दीर्घ उत्तरीय प्रश्न (Long Answer Questions · 5–10 Marks)",
                            "C. Long Answer Questions (5–10 Marks)",
                            "C. Long Answer Questions (Dirgha Uttariya)"
                          )}
                        </h4>

                        <div className="space-y-3">
                          {lesson.textbookExercises.longAnswers.map((ex, idx) => {
                            const keyId = `long-${idx}`;
                            const showHint = !!revealedHints[keyId];
                            const showAnswer = !!revealedAnswers[keyId];

                            return (
                              <div
                                key={keyId}
                                className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5"
                              >
                                <p className="text-xs font-semibold leading-relaxed text-slate-900 sm:text-sm">
                                  <span className="mr-1.5 text-emerald-700 tabular-nums">
                                    Q{idx + 1}.
                                  </span>
                                  {cleanInlineText(ex.question)}
                                </p>

                                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                  {ex.hint && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setRevealedHints((prev) => ({
                                          ...prev,
                                          [keyId]: !prev[keyId],
                                        }))
                                      }
                                      className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-amber-300 hover:bg-amber-50"
                                    >
                                      <Lightbulb
                                        className="h-3.5 w-3.5 text-amber-600"
                                        aria-hidden="true"
                                      />
                                      <span>
                                        {showHint
                                          ? pickLabel("संकेत छुपाएं", "Hide Hint", "Hint Chhupayein")
                                          : pickLabel("संकेत देखें", "Show Hint", "Hint Dekhein")}
                                      </span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRevealedAnswers((prev) => ({
                                        ...prev,
                                        [keyId]: !prev[keyId],
                                      }))
                                    }
                                    className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 hover:border-blue-300 hover:bg-blue-100"
                                  >
                                    {showAnswer ? (
                                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                                    ) : (
                                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                    )}
                                    <span>
                                      {showAnswer
                                        ? pickLabel("विस्तृत उत्तर छुपाएं", "Hide Long Answer", "Long Answer Chhupayein")
                                        : pickLabel("विस्तृत आदर्श उत्तर देखें", "Show Detailed Model Answer", "Detailed Answer Dekhein")}
                                    </span>
                                  </button>
                                </div>

                                {showHint && ex.hint && (
                                  <p className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-950">
                                    <span className="font-semibold">
                                      {pickLabel("संकेत: ", "Hint: ", "Hint: ")}
                                    </span>
                                    {cleanInlineText(ex.hint)}
                                  </p>
                                )}

                                {showAnswer && (
                                  <div className="teacher-prose mt-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs text-slate-800 sm:text-sm">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm, remarkMath]}
                                      rehypePlugins={[rehypeKatex]}
                                    >
                                      {cleanDisplayMarkdown(ex.answer)}
                                    </ReactMarkdown>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Fallback for legacy practiceExercises if ever present */}
                {!lesson.textbookExercises &&
                  lesson.practiceExercises &&
                  lesson.practiceExercises.length > 0 && (
                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                      <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                        {pickLabel(
                          "अध्याय अभ्यास प्रश्न (Practice Exercises)",
                          "Chapter Practice Exercises",
                          "Chapter Practice Exercises"
                        )}
                      </h3>
                      <div className="mt-3.5 space-y-3">
                        {lesson.practiceExercises.map((ex, idx) => {
                          const keyId = `legacy-${idx}`;
                          const showAnswer = !!revealedAnswers[keyId];
                          return (
                            <div
                              key={keyId}
                              className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5"
                            >
                              <p className="text-xs font-semibold leading-relaxed text-slate-900 sm:text-sm">
                                <span className="mr-1.5 text-blue-700 tabular-nums">
                                  Q{idx + 1}.
                                </span>
                                {cleanInlineText(ex.question)}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedAnswers((prev) => ({
                                    ...prev,
                                    [keyId]: !prev[keyId],
                                  }))
                                }
                                className="mt-2 inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800"
                              >
                                {showAnswer
                                  ? pickLabel("उत्तर छुपाएं", "Hide Answer", "Hide Answer")
                                  : pickLabel("उत्तर देखें", "Show Answer", "Show Answer")}
                              </button>
                              {showAnswer && (
                                <div className="teacher-prose mt-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs text-slate-800 sm:text-sm">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                  >
                                    {cleanDisplayMarkdown(ex.answer)}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Bottom Chapter Completion & Exam Action Bar */}
                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void startExam()}
                      className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800 transition-colors hover:border-blue-400 hover:bg-blue-100 sm:text-sm"
                    >
                      <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {isTimedMockExam
                          ? pickLabel(
                              "फुल मॉक टेस्ट (20 Qs)",
                              "Timed Mock Test (20 Qs)",
                              "Timed Mock Test (20 Qs)"
                            )
                          : pickLabel(
                              "लेवल टेस्ट दें (60% पास)",
                              "Take Level Exam (60% Pass)",
                              "Level Exam Dein (60% Pass)"
                            )}
                      </span>
                    </button>

                    {courseCategory === "technology" && !showCodeLab && (
                      <button
                        type="button"
                        onClick={() => setShowCodeLab(true)}
                        className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-900 transition-colors hover:border-emerald-400 hover:bg-emerald-100 sm:text-sm"
                      >
                        <Terminal className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                        <span>{pickLabel("Code Lab", "Code Lab", "Code Lab")}</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCompleteAndNextChapter}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 sm:text-sm"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                    <span>
                      {activeChapterNumber < totalChapters
                        ? pickLabel(
                            "✓ अध्याय पूरा हुआ — अगला अध्याय पढ़ें",
                            "Mark Complete & Next Chapter",
                            "Chapter Complete — Next Chapter Padhein"
                          )
                        : pickLabel(
                            "✓ अंतिम अध्याय पूरा हुआ (100%)",
                            "Mark Final Chapter Complete",
                            "Final Chapter Complete Karein"
                          )}
                    </span>
                    {activeChapterNumber < totalChapters && (
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* Exam / Full-Length Timed Mock Test View */
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          {examLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              <p className="text-sm font-medium text-slate-600">
                {isTimedMockExam
                  ? pickLabel(
                      "आपका 20-प्रश्नों का फुल-लेंथ मॉक टेस्ट तैयार हो रहा है...",
                      "Preparing your 20-question full-length timed mock test...",
                      "Aapka 20-questions ka full-length mock test taiyar ho raha hai..."
                    )
                  : pickLabel(
                      "आपका 10-प्रश्नों का टेस्ट पेपर तैयार हो रहा है...",
                      "Preparing your 10-question test paper...",
                      "Aapka 10-questions ka test paper taiyar ho raha hai..."
                    )}
              </p>
            </div>
          ) : examError ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm font-medium text-red-700">{examError}</p>
              <button
                type="button"
                onClick={() => void startExam()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                <span>Retry Exam</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    {tierTitle(activeTier)} —{" "}
                    {isTimedMockExam
                      ? pickLabel(
                          "फुल-लेंथ मॉक टेस्ट (20 प्रश्न)",
                          "Timed Mock Paper (20 Questions)",
                          "Timed Mock Paper (20 Questions)"
                        )
                      : pickLabel(
                          "परीक्षा पेपर (10 प्रश्न)",
                          "Test Paper (10 Questions)",
                          "Test Paper (10 Questions)"
                        )}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                    {examAttemptNumber > 1 && (
                      <span className="font-semibold text-blue-700">
                        {pickLabel(
                          `प्रयास #${examAttemptNumber} (नए प्रश्न) · `,
                          `Attempt #${examAttemptNumber} (Fresh Questions) · `,
                          `Attempt #${examAttemptNumber} (New Questions) · `
                        )}
                      </span>
                    )}
                    {isTimedMockExam
                      ? pickLabel(
                          "+1.0 सही · -0.25 गलत (Negative Marking) · 60% पास · उत्तर:",
                          "+1.0 correct · -0.25 wrong · 0 skipped · 60% passing · Attempted:",
                          "+1.0 sahi · -0.25 galat · 60% pass · Attempted:"
                        )
                      : pickLabel(
                          "पास होने के लिए 60% (6/10) ज़रूरी · उत्तर दिए:",
                          "Passing score: 60% (6/10) · Answered:",
                          "Pass hone ke liye 60% (6/10) zaroori · Answered:"
                        )}{" "}
                    {Object.keys(selectedAnswers).length}/{totalQuestions}
                  </p>
                </div>

                {isTimedMockExam && !examSubmitted && (
                  <div
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold tabular-nums ${
                      secondsLeft <= 120
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-blue-200 bg-blue-50 text-blue-800"
                    }`}
                    aria-label="Time remaining"
                  >
                    <Timer className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{formatClock(secondsLeft)}</span>
                  </div>
                )}
              </div>

              {/* Exam Result Summary */}
              {examSubmitted && (
                <div
                  className={`mt-4 rounded-xl border p-4 ${
                    isPassed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                      : "border-red-200 bg-red-50 text-red-950"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      {isPassed ? (
                        <CheckCircle2
                          className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                      ) : (
                        <XCircle
                          className="mt-0.5 h-6 w-6 shrink-0 text-red-600"
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <p className="text-base font-bold tabular-nums">
                          {isPassed
                            ? pickLabel(
                                `बधाई हो, आप PASS हो गए! कुल अंक: ${netMarks}/${totalQuestions} (${percentage}%)`,
                                `PASSED! Net Score: ${netMarks}/${totalQuestions} (${percentage}%)`,
                                `PASSED! Score: ${netMarks}/${totalQuestions} (${percentage}%)`
                              )
                            : pickLabel(
                                `अंक: ${netMarks}/${totalQuestions} (${percentage}%) — पास होने के लिए 60% ज़रूरी है।`,
                                `NOT PASSED (${percentage}%). Need 60% to clear.`,
                                `NOT PASSED (${percentage}%). Pass ke liye 60% chahiye.`
                              )}
                        </p>
                        <p className="mt-0.5 text-xs opacity-90">
                          {isPassed
                            ? activeTier === "professional"
                              ? pickLabel(
                                  "आपने सभी 3 लेवल पास कर लिए! आपका SuJu स्टडी सर्टिफिकेट तैयार है।",
                                  "You completed all 3 levels! Your SuJu Study Certificate is ready.",
                                  "Aapne teeno level pass kar liye! SuJu Study Certificate taiyar hai."
                                )
                              : pickLabel(
                                  "अगला लेवल अब अनलॉक हो गया है!",
                                  "Next level is now unlocked!",
                                  "Agla level ab unlock ho gaya hai!"
                                )
                            : pickLabel(
                                "नीचे सही उत्तर समझें या SuJu AI गुरुजी से पूछें, फिर दोबारा प्रयास करें।",
                                "Review the explanations below or ask SuJu AI Guruji for help, then retake.",
                                "Neeche sahi answer samjhein ya SuJu AI Guruji se puchein, fir dubara try karein."
                              )}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {isPassed && activeTier === "beginner" && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTier("advance");
                            setActiveChapterNumber(6);
                            setMode("lesson");
                          }}
                          className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                        >
                          {pickLabel(
                            "Level 2: Advance शुरू करें →",
                            "Continue to Advance →",
                            "Level 2: Advance Shuru Karein →"
                          )}
                        </button>
                      )}
                      {isPassed && activeTier === "advance" && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTier("professional");
                            setActiveChapterNumber(12);
                            setMode("lesson");
                          }}
                          className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                        >
                          {pickLabel(
                            "Level 3 शुरू करें →",
                            "Continue to Level 3 →",
                            "Level 3 Shuru Karein →"
                          )}
                        </button>
                      )}
                      {isPassed && activeTier === "professional" && (
                        <button
                          type="button"
                          onClick={() => setCertificateOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                        >
                          <Award className="h-4 w-4" aria-hidden="true" />
                          <span>
                            {pickLabel(
                              "सर्टिफिकेट प्राप्त करें",
                              "Get Certificate",
                              "Certificate Prapt Karein"
                            )}
                          </span>
                        </button>
                      )}
                      {!isPassed && (
                        <button
                          type="button"
                          onClick={() => void startExam(undefined, true)}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          {pickLabel(
                            "फिर से परीक्षा दें (नए सवाल)",
                            "Retake Exam (New Questions)",
                            "Fir se Exam Dein (New Questions)"
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detailed Score Analysis Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-black/10 pt-3 sm:grid-cols-5">
                    <div className="rounded-lg bg-white/80 px-3 py-2">
                      <p className="text-[11px] font-medium text-slate-500">
                        {pickLabel("सही (+1)", "Correct (+1)", "Sahi (+1)")}
                      </p>
                      <p className="text-sm font-bold text-emerald-700 tabular-nums">
                        {correctCount}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/80 px-3 py-2">
                      <p className="text-[11px] font-medium text-slate-500">
                        {isTimedMockExam
                          ? pickLabel("गलत (-0.25)", "Wrong (-0.25)", "Galat (-0.25)")
                          : pickLabel("गलत", "Wrong", "Galat")}
                      </p>
                      <p className="text-sm font-bold text-red-700 tabular-nums">
                        {wrongCount}
                        {isTimedMockExam && wrongCount > 0
                          ? ` (-${(wrongCount * 0.25).toFixed(2)})`
                          : ""}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/80 px-3 py-2">
                      <p className="text-[11px] font-medium text-slate-500">
                        {pickLabel("छोड़े गए", "Skipped", "Skipped")}
                      </p>
                      <p className="text-sm font-bold text-slate-700 tabular-nums">
                        {skippedCount}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/80 px-3 py-2">
                      <p className="text-[11px] font-medium text-slate-500">
                        {pickLabel("सटीकता", "Accuracy", "Accuracy")}
                      </p>
                      <p className="text-sm font-bold text-blue-700 tabular-nums">
                        {accuracyPct}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/80 px-3 py-2">
                      <p className="text-[11px] font-medium text-slate-500">
                        {pickLabel("लगा समय", "Time Taken", "Time Taken")}
                      </p>
                      <p className="text-sm font-bold text-slate-800 tabular-nums">
                        {isTimedMockExam
                          ? formatClock(Math.max(1, timeTakenSec))
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="mt-5 space-y-5">
                {examQuestions.map((q, qIdx) => {
                  const chosen = selectedAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 sm:text-[15px]">
                          <span className="mr-1.5 text-blue-600 tabular-nums">
                            Q{qIdx + 1}.
                          </span>
                          {cleanInlineText(q.question)}
                        </p>
                        {isTimedMockExam &&
                          !examSubmitted &&
                          typeof chosen === "number" && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedAnswers((prev) => {
                                  const next = { ...prev };
                                  delete next[q.id];
                                  return next;
                                })
                              }
                              className="shrink-0 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                            >
                              {pickLabel("छोड़ें", "Skip / Clear", "Skip")}
                            </button>
                          )}
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {q.options.map((option, optIdx) => {
                          const isSelected = chosen === optIdx;
                          const isCorrectOption = q.correctIndex === optIdx;

                          let styleClass =
                            "border-slate-200 bg-slate-50/70 text-slate-800 hover:border-blue-300 hover:bg-blue-50/50";
                          if (examSubmitted) {
                            if (isCorrectOption) {
                              styleClass =
                                "border-emerald-400 bg-emerald-50 text-emerald-950 font-semibold";
                            } else if (isSelected && !isCorrectOption) {
                              styleClass =
                                "border-red-400 bg-red-50 text-red-950";
                            } else {
                              styleClass =
                                "border-slate-200 bg-white text-slate-500";
                            }
                          } else if (isSelected) {
                            styleClass =
                              "border-blue-600 bg-blue-50 text-blue-950 ring-1 ring-blue-600 font-semibold";
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={examSubmitted}
                              onClick={() =>
                                setSelectedAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: optIdx,
                                }))
                              }
                              className={`min-h-[42px] rounded-lg border px-3.5 py-2 text-left text-xs transition-colors sm:text-sm ${styleClass}`}
                            >
                              <span className="mr-2 font-semibold">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              {cleanInlineText(option)}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
                          <span className="font-semibold text-slate-900">
                            {pickLabel("व्याख्या: ", "Explanation: ", "Explanation: ")}
                          </span>
                          {cleanInlineText(q.explanation)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!examSubmitted && examQuestions.length > 0 && (
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    {isTimedMockExam
                      ? pickLabel(
                          "-0.25 नेगेटिव मार्किंग से बचने के लिए कठिन प्रश्न छोड़ सकते हैं।",
                          "You can leave unsure questions unattempted to avoid -0.25 penalty.",
                          "-0.25 negative marking se bachne ke liye mushkil questions chhod sakte hain."
                        )
                      : ""}
                  </p>
                  <button
                    type="button"
                    disabled={
                      !isTimedMockExam &&
                      Object.keys(selectedAnswers).length < examQuestions.length
                    }
                    onClick={() =>
                      submitExamWithStats(examQuestions, selectedAnswers)
                    }
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <span>
                      {pickLabel(
                        "टेस्ट पेपर सबमिट करें",
                        "Submit Test Paper",
                        "Test Paper Submit Karein"
                      )}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <CertificateModal
        isOpen={certificateOpen}
        onClose={() => setCertificateOpen(false)}
        courseTitle={courseTitle}
        score={
          profBestScore ||
          Math.max(6, Math.round((netMarks / totalQuestions) * 10))
        }
        language={language}
      />
    </div>
  );
}
