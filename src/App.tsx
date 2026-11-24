import { useEffect, useRef, useState } from "react";
import { DonationModal } from "./components/DonationModal";
import { GuidedTour } from "./components/GuidedTour";
import { Header, type AppViewMode } from "./components/Header";
import { MessageBubble } from "./components/MessageBubble";
import { SmartDoubtBox } from "./components/SmartDoubtBox";
import { TeacherMemoryModal } from "./components/TeacherMemoryModal";
import { TeacherWelcome } from "./components/TeacherWelcome";
import { CoursesDashboard } from "./components/courses/CoursesDashboard";
import { TEACHER_CONTENT } from "./data/teacherContent";
import type { CourseProgressMap, CourseTier } from "./types/courses";
import type {
  Attachment,
  ChatMessage,
  FollowUpChip,
  LanguageMode,
  SampleDoubt,
  TeacherMemoryItem,
} from "./types/teacher";
import { loadCourseProgress, saveCourseProgress } from "./utils/courseProgress";
import { loadTeacherMemories, saveTeacherMemories } from "./utils/memory";
import { speakTeacherResponse } from "./utils/speech";

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [language, setLanguage] = useState<LanguageMode>("hindi");
  const [viewMode, setViewMode] = useState<AppViewMode>("teacher");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [memories, setMemories] = useState<TeacherMemoryItem[]>(() =>
    loadTeacherMemories()
  );
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [courseProgress, setCourseProgress] = useState<CourseProgressMap>(() =>
    loadCourseProgress()
  );
  const [prefillRequest, setPrefillRequest] = useState<{
    id: number;
    text: string;
  } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  // Persist Teacher Memory & Course Progress cleanly
  useEffect(() => {
    saveTeacherMemories(memories);
  }, [memories]);

  useEffect(() => {
    saveCourseProgress(courseProgress);
  }, [courseProgress]);

  // Auto-launch Interactive Walkthrough Tour for first-time visitors
  useEffect(() => {
    try {
      const completed = window.localStorage.getItem("suju_tour_completed");
      if (completed !== "true") {
        const timer = window.setTimeout(() => {
          setTourOpen(true);
        }, 350);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  // Stop any playing speech on unmount
  useEffect(() => {
    return () => {
      stopSpeechRef.current?.();
      abortControllerRef.current?.abort();
    };
  }, []);

  // Auto-scroll smoothly as teacher explains
  useEffect(() => {
    if (viewMode === "teacher" && messages.length > 0) {
      scrollAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, viewMode]);

  const stopSpeech = () => {
    stopSpeechRef.current?.();
    stopSpeechRef.current = null;
    setActiveSpeechId(null);
  };

  const handleToggleSpeak = (
    messageId: string,
    text: string,
    msgLanguage: LanguageMode
  ) => {
    if (activeSpeechId === messageId) {
      stopSpeech();
      return;
    }

    stopSpeech();
    setActiveSpeechId(messageId);
    stopSpeechRef.current = speakTeacherResponse(text, msgLanguage, () => {
      setActiveSpeechId((current) => (current === messageId ? null : current));
      stopSpeechRef.current = null;
    });
  };

  const handleAddMemory = (item: TeacherMemoryItem) => {
    setMemories((prev) => [item, ...prev].slice(0, 25));
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleRecordCoursePass = (
    courseKey: string,
    tier: CourseTier,
    score: number
  ) => {
    setCourseProgress((prev) => {
      const existing = prev[courseKey] || { passedTiers: {} };
      const bestForTier = Math.max(existing.passedTiers[tier] ?? 0, score);
      return {
        ...prev,
        [courseKey]: {
          ...existing,
          passedTiers: {
            ...existing.passedTiers,
            [tier]: bestForTier,
          },
          certificateEarnedAt:
            tier === "professional"
              ? existing.certificateEarnedAt || Date.now()
              : existing.certificateEarnedAt,
        },
      };
    });
  };

  const handleMarkChapterComplete = (
    courseKey: string,
    chapterNumber: number,
    completed = true
  ) => {
    setCourseProgress((prev) => {
      const existing = prev[courseKey] || { passedTiers: {} };
      const prevChapters = Array.isArray(existing.completedChapters)
        ? existing.completedChapters
        : [];
      const nextChapters = completed
        ? Array.from(new Set([...prevChapters, chapterNumber])).sort(
            (a, b) => a - b
          )
        : prevChapters.filter((n) => n !== chapterNumber);

      return {
        ...prev,
        [courseKey]: {
          ...existing,
          completedChapters: nextChapters,
        },
      };
    });
  };

  const handleAskTeacherFromCourse = (prompt: string) => {
    stopSpeech();
    setViewMode("teacher");
    setPrefillRequest({ id: Date.now(), text: prompt });
  };

  const handleOpenTour = () => {
    stopSpeech();
    setViewMode("teacher");
    setTourOpen(true);
  };

  const handleCompleteTour = () => {
    setTourOpen(false);
    try {
      window.localStorage.setItem("suju_tour_completed", "true");
    } catch {
      // Ignore storage access errors
    }
  };

  const sendConversation = async (
    historyToSend: ChatMessage[],
    teacherMessageId: string,
    activeLang: LanguageMode
  ) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsBusy(true);

    const strings = TEACHER_CONTENT[activeLang];

    try {
      const payloadMessages = historyToSend
        .filter((m) => !m.error)
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("model" as const),
          text: m.text,
          attachment: m.attachment
            ? {
                mimeType: m.attachment.mimeType,
                data: m.attachment.data,
                name: m.attachment.name,
              }
            : undefined,
        }));

      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: activeLang,
          messages: payloadMessages,
          memories: memories.map((m) => ({
            text: m.text,
            category: m.category,
          })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMsg = strings.serverBusyFallbackMessage;
        try {
          const errData = (await response.json()) as { error?: string };
          if (errData?.error && !errData.error.trim().startsWith("{")) {
            errorMsg = errData.error;
          }
        } catch {
          // keep friendly fallback message
        }
        throw new Error(errorMsg);
      }

      if (!response.body) {
        throw new Error(strings.serverBusyFallbackMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const eventChunk of events) {
          const lines = eventChunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            const parsed = JSON.parse(jsonStr) as {
              type: "chunk" | "done" | "error";
              text?: string;
              message?: string;
            };

            if (parsed.type === "chunk" && parsed.text) {
              const delta = parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === teacherMessageId
                    ? { ...m, text: m.text + delta }
                    : m
                )
              );
            } else if (parsed.type === "error") {
              throw new Error(
                parsed.message && !parsed.message.trim().startsWith("{")
                  ? parsed.message
                  : strings.serverBusyFallbackMessage
              );
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === teacherMessageId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === teacherMessageId ? { ...m, isStreaming: false } : m
          )
        );
      } else {
        const rawErr = err instanceof Error ? err.message : "";
        const errMessage =
          rawErr && !rawErr.trim().startsWith("{") && !rawErr.includes("503")
            ? rawErr
            : strings.serverBusyFallbackMessage;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === teacherMessageId
              ? { ...m, isStreaming: false, error: errMessage }
              : m
          )
        );
      }
    } finally {
      setIsBusy(false);
      abortControllerRef.current = null;
    }
  };

  const handleSend = (text: string, attachment?: Attachment) => {
    if (isBusy) return;
    stopSpeech();

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text,
      attachment,
      language,
    };

    const teacherMessageId = createId();
    const teacherPlaceholder: ChatMessage = {
      id: teacherMessageId,
      role: "teacher",
      text: "",
      language,
      isStreaming: true,
    };

    const nextHistory = [...messages, userMessage];
    setMessages([...nextHistory, teacherPlaceholder]);
    void sendConversation(nextHistory, teacherMessageId, language);
  };

  const handleSelectSample = (doubt: SampleDoubt) => {
    handleSend(doubt.prompt);
  };

  const handleFollowUpClick = (chip: FollowUpChip) => {
    handleSend(chip.prompt);
  };

  const handleRetry = (failedTeacherId: string) => {
    if (isBusy) return;
    const idx = messages.findIndex((m) => m.id === failedTeacherId);
    if (idx <= 0) return;

    const historyUpToUser = messages.slice(0, idx);
    const refreshedTeacher: ChatMessage = {
      id: failedTeacherId,
      role: "teacher",
      text: "",
      language,
      isStreaming: true,
    };
    setMessages([...historyUpToUser, refreshedTeacher]);
    void sendConversation(historyUpToUser, failedTeacherId, language);
  };

  const handleStopStreaming = () => {
    abortControllerRef.current?.abort();
  };

  const handleResetChat = () => {
    abortControllerRef.current?.abort();
    stopSpeech();
    setMessages([]);
    setIsBusy(false);
    setViewMode("teacher");
  };

  const hasMessages = messages.length > 0;
  const lastTeacherId = [...messages]
    .reverse()
    .find((m) => m.role === "teacher")?.id;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#F8FAFC] text-slate-900">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        viewMode={viewMode}
        onToggleCoursesView={() =>
          setViewMode((prev) => (prev === "courses" ? "teacher" : "courses"))
        }
        onGoToTeacher={() => setViewMode("teacher")}
        hasMessages={hasMessages}
        onResetChat={handleResetChat}
        memoryCount={memories.length}
        onOpenMemory={() => setMemoryModalOpen(true)}
        onOpenDonate={() => setDonateModalOpen(true)}
        onOpenTour={handleOpenTour}
      />

      {viewMode === "courses" ? (
        <CoursesDashboard
          language={language}
          progress={courseProgress}
          onRecordPass={handleRecordCoursePass}
          onMarkChapterComplete={handleMarkChapterComplete}
          onBackToTeacher={() => setViewMode("teacher")}
          onAskTeacherTopic={handleAskTeacherFromCourse}
        />
      ) : !hasMessages ? (
        <main className="flex flex-1 flex-col justify-between overflow-y-auto pb-4 sm:justify-center sm:pb-10">
          <div className="w-full">
            <TeacherWelcome
              language={language}
              onSelectSample={handleSelectSample}
            />
          </div>

          <div className="mt-6 w-full shrink-0 pb-14 sm:mt-8 sm:pb-6">
            <SmartDoubtBox
              language={language}
              isBusy={isBusy}
              prefillRequest={prefillRequest}
              onSend={handleSend}
              onStopStreaming={handleStopStreaming}
            />
          </div>
        </main>
      ) : (
        <>
          <main className="flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  uiLanguage={language}
                  isLatestTeacherMessage={msg.id === lastTeacherId}
                  isBusy={isBusy}
                  activeSpeechId={activeSpeechId}
                  onToggleSpeak={handleToggleSpeak}
                  onFollowUpClick={handleFollowUpClick}
                  onSelectSuggestedQuestion={(q) => handleSend(q)}
                  onRetry={
                    msg.error ? () => handleRetry(msg.id) : undefined
                  }
                />
              ))}
              <div ref={scrollAnchorRef} className="h-2" />
            </div>
          </main>

          <div className="shrink-0 border-t border-slate-200/80 bg-[#F8FAFC]/95 pt-2.5 pb-14 sm:pt-3 sm:pb-6">
            <SmartDoubtBox
              language={language}
              isBusy={isBusy}
              prefillRequest={prefillRequest}
              onSend={handleSend}
              onStopStreaming={handleStopStreaming}
            />
          </div>
        </>
      )}

      <TeacherMemoryModal
        isOpen={memoryModalOpen}
        language={language}
        memories={memories}
        onClose={() => setMemoryModalOpen(false)}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
      />

      <DonationModal
        isOpen={donateModalOpen}
        language={language}
        onClose={() => setDonateModalOpen(false)}
      />

      <GuidedTour
        isOpen={tourOpen}
        language={language}
        onComplete={handleCompleteTour}
      />
    </div>
  );
}
