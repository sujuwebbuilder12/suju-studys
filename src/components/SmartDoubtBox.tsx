import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Camera,
  CornerDownLeft,
  FileText,
  Image as ImageIcon,
  Mic,
  MicOff,
  Plus,
  Square,
  X,
} from "lucide-react";
import { TEACHER_CONTENT } from "../data/teacherContent";
import type { Attachment, LanguageMode } from "../types/teacher";
import { isObviouslyUnsafeMemoryInput } from "../utils/memory";
import { getLocalTypingSuggestions } from "../utils/suggestions";

interface SmartDoubtBoxProps {
  language: LanguageMode;
  isBusy: boolean;
  prefillRequest?: { id: number; text: string } | null;
  onSend: (text: string, attachment?: Attachment) => void;
  onStopStreaming: () => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SmartDoubtBox({
  language,
  isBusy,
  prefillRequest,
  onSend,
  onStopStreaming,
}: SmartDoubtBoxProps) {
  const strings = TEACHER_CONTENT[language];

  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<"hi-IN" | "en-IN">(
    language === "english" ? "en-IN" : "hi-IN"
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const [creatorAvatarError, setCreatorAvatarError] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseTextBeforeSpeechRef = useRef<string>("");

  // Populate input when jumping from a Course lesson's "Ask AI Teacher" button
  useEffect(() => {
    if (!prefillRequest?.text) return;
    setText(prefillRequest.text);
    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }, [prefillRequest]);

  // Keep speech recognition language synced when UI language changes (unless actively listening)
  useEffect(() => {
    if (!isListening) {
      setSpeechLang(language === "english" ? "en-IN" : "hi-IN");
    }
  }, [language, isListening]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  // Live typing auto-suggestions (0ms instant local chips + 420ms debounced AI completions)
  useEffect(() => {
    const trimmed = text.trim();
    if (
      trimmed.length < 3 ||
      trimmed.length > 90 ||
      isBusy ||
      isListening ||
      attachment ||
      isObviouslyUnsafeMemoryInput(trimmed)
    ) {
      setLiveSuggestions([]);
      return;
    }

    const instant = getLocalTypingSuggestions(trimmed, language);
    setLiveSuggestions(instant);

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed, language }),
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions?: string[] };
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setLiveSuggestions(data.suggestions.slice(0, 3));
        }
      } catch {
        // Ignore aborts/network errors silently; keep instant local chips
      }
    }, 420);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [text, language, isBusy, isListening, attachment]);

  // Close attachment menu on outside click
  useEffect(() => {
    if (!attachMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setAttachMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [attachMenuOpen]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const clearNoticeSoon = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => {
      setNotice((prev) => (prev === msg ? null : prev));
    }, 5000);
  };

  const handleFile = (file: File) => {
    setNotice(null);
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      clearNoticeSoon(strings.unsupportedFileError);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      clearNoticeSoon(strings.fileTooLargeError);
      return;
    }

    const mimeType = isPdf ? "application/pdf" : file.type || "image/jpeg";
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      setAttachment({
        name: file.name,
        mimeType,
        data: base64,
        previewUrl: isImage ? result : undefined,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = "";
    setAttachMenuOpen(false);
  };

  const toggleVoiceInput = () => {
    setNotice(null);

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const speechWindow = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognitionAPI =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      clearNoticeSoon(strings.speechUnsupportedError);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = speechLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      baseTextBeforeSpeechRef.current = text.trim();

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
        const spoken = `${finalTranscript}${interimTranscript}`.trim();
        const prefix = baseTextBeforeSpeechRef.current;
        setText(prefix ? `${prefix} ${spoken}` : spoken);
      };

      recognition.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          clearNoticeSoon(strings.speechPermissionError);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      clearNoticeSoon(strings.speechUnsupportedError);
      setIsListening(false);
    }
  };

  const handleSubmit = (overrideText?: string) => {
    if (isBusy) return;
    const trimmed = (overrideText ?? text).trim();
    if (!trimmed && !attachment) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    onSend(trimmed, overrideText ? undefined : attachment);
    setText("");
    setLiveSuggestions([]);
    if (!overrideText) {
      setAttachment(undefined);
    }
    setNotice(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleFile(file);
          return;
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const canSend = (text.trim().length > 0 || Boolean(attachment)) && !isBusy;

  return (
    <div className="mx-auto w-full max-w-3xl px-3 sm:px-6">
      {notice && (
        <div
          role="alert"
          className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-900"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="rounded p-0.5 text-amber-700 hover:bg-amber-100"
            aria-label="Dismiss message"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Subtle Horizontal Live Typing Auto-Suggestions Bar */}
      {liveSuggestions.length > 0 && (
        <div
          aria-label="Question completion suggestions"
          className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-0.5"
        >
          {liveSuggestions.map((suggestion, idx) => (
            <button
              key={`${idx}-${suggestion}`}
              type="button"
              onClick={() => handleSubmit(suggestion)}
              className="inline-flex min-h-[34px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <CornerDownLeft className="h-3 w-3 shrink-0 text-blue-600" aria-hidden="true" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      <div
        data-tour="ask-box"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border bg-white p-2.5 shadow-sm transition-colors sm:p-3 ${
          isDragging
            ? "border-blue-500 bg-blue-50/40"
            : isListening
              ? "border-blue-400 ring-2 ring-blue-100"
              : "border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
        }`}
      >
        {/* Preview Thumbnail for Uploaded Image or PDF */}
        {attachment && (
          <div className="mb-2.5 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
            <div className="flex min-w-0 items-center gap-3">
              {attachment.previewUrl ? (
                <img
                  src={attachment.previewUrl}
                  alt={attachment.name}
                  className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 bg-white object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600">
                  <FileText className="h-6 w-6" aria-hidden="true" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
                  {attachment.name}
                </p>
                <p className="text-[11px] text-slate-500 tabular-nums">
                  {attachment.mimeType === "application/pdf" ? "PDF Document" : "Image"} ·{" "}
                  {formatFileSize(attachment.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(undefined)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
              aria-label="Remove attachment"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Active Mic Banner */}
        {isListening && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800">
            <span>{strings.micListeningHint}</span>
            <button
              type="button"
              onClick={() => {
                const nextLang = speechLang === "hi-IN" ? "en-IN" : "hi-IN";
                setSpeechLang(nextLang);
                if (recognitionRef.current) {
                  recognitionRef.current.stop();
                }
              }}
              className="rounded border border-blue-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
            >
              {speechLang === "hi-IN" ? "हिंदी (hi-IN)" : "English (en-IN)"}
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={strings.inputPlaceholder}
          aria-label={strings.inputPlaceholder}
          className="max-h-40 min-h-[42px] w-full resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        {/* Hidden File Inputs */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Bottom Controls Bar */}
        <div className="mt-1.5 flex items-end justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5" ref={menuContainerRef}>
            {/* + Attachment Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAttachMenuOpen((prev) => !prev)}
                title={strings.attachTooltip}
                aria-label={strings.attachTooltip}
                aria-expanded={attachMenuOpen}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-slate-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  attachMenuOpen
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <Plus
                  className={`h-5 w-5 transition-transform duration-150 ${
                    attachMenuOpen ? "rotate-45" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {attachMenuOpen && (
                <div className="absolute bottom-12 left-0 z-40 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex min-h-[42px] w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 sm:text-[13px]"
                  >
                    <ImageIcon className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                    <span>{strings.uploadPhotoLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex min-h-[42px] w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 sm:text-[13px]"
                  >
                    <Camera className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>{strings.takePhotoLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="flex min-h-[42px] w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 sm:text-[13px]"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                    <span>{strings.uploadPdfLabel}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={strings.micTooltip}
              aria-label={strings.micTooltip}
              aria-pressed={isListening}
              className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                isListening
                  ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{strings.stopListenLabel}</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span className="hidden whitespace-nowrap sm:inline">
                    {speechLang === "hi-IN" ? "बोलें (HI)" : "Speak (EN)"}
                  </span>
                </>
              )}
            </button>

            {!isListening && (
              <button
                type="button"
                onClick={() =>
                  setSpeechLang((prev) => (prev === "hi-IN" ? "en-IN" : "hi-IN"))
                }
                className="hidden h-8 items-center rounded-lg px-2 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:inline-flex"
                title="Switch voice input language"
              >
                {speechLang === "hi-IN" ? "Mic: हिंदी" : "Mic: EN"}
              </button>
            )}
          </div>

          {/* Right Side: Creator Profile Badge Directly Above Send Arrow */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              {creatorAvatarError ? (
                <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                  SK
                </span>
              ) : (
                <img
                  src="/assets/aistudio/16415-removebg-preview_6441a7b3.png"
                  alt="Founder: Sumit Kumar"
                  referrerPolicy="no-referrer"
                  onError={() => setCreatorAvatarError(true)}
                  className="h-5.5 w-5.5 shrink-0 rounded-full border border-slate-200 bg-blue-50 object-cover object-top"
                />
              )}
              <span className="whitespace-nowrap text-[11px] font-medium text-slate-500">
                Founder:{" "}
                <span className="font-semibold text-slate-700">Sumit Kumar</span>
              </span>
            </div>

            {/* Send or Stop Button */}
            {isBusy ? (
              <button
                type="button"
                onClick={onStopStreaming}
                aria-label="Stop generating"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <Square className="h-4 w-4 fill-current" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canSend}
                onClick={() => handleSubmit()}
                title={strings.sendTooltip}
                aria-label={strings.sendTooltip}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <ArrowUp className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
