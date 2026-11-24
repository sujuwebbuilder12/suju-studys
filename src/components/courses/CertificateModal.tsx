import { useEffect, useState } from "react";
import { Award, Download, X } from "lucide-react";
import type { LanguageMode } from "../../types/teacher";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  score: number;
  language: LanguageMode;
}

export function CertificateModal({
  isOpen,
  onClose,
  courseTitle,
  score,
  language,
}: CertificateModalProps) {
  const [studentName, setStudentName] = useState("SuJu Scholar");
  const dateString = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownloadPng = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1120;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer & Inner Borders
    ctx.strokeStyle = "#1D4ED8";
    ctx.lineWidth = 14;
    ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

    ctx.strokeStyle = "#D97706";
    ctx.lineWidth = 4;
    ctx.strokeRect(64, 64, canvas.width - 128, canvas.height - 128);

    // Top Header
    ctx.fillStyle = "#1D4ED8";
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SuJu स्टडी  ·  SuJu Study Academy", canvas.width / 2, 170);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 66px sans-serif";
    ctx.fillText("CERTIFICATE OF ACHIEVEMENT", canvas.width / 2, 275);

    ctx.fillStyle = "#475569";
    ctx.font = "30px sans-serif";
    ctx.fillText("This certificate is proudly awarded to", canvas.width / 2, 375);

    // Student Name
    const displayName = studentName.trim() || "SuJu Scholar";
    ctx.fillStyle = "#1E3A8A";
    ctx.font = "bold 74px sans-serif";
    ctx.fillText(displayName, canvas.width / 2, 475);

    // Divider line under name
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(420, 505);
    ctx.lineTo(1180, 505);
    ctx.stroke();

    // Completion Statement
    ctx.fillStyle = "#334155";
    ctx.font = "30px sans-serif";
    ctx.fillText(
      "for successfully completing Beginner, Advance, and Professional levels of",
      canvas.width / 2,
      580
    );

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 46px sans-serif";
    ctx.fillText(courseTitle, canvas.width / 2, 660);

    ctx.fillStyle = "#059669";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(
      `Professional Exam Score: ${score}/10 (${score * 10}%) · PASSED`,
      canvas.width / 2,
      740
    );

    // Footer Signature & Date
    ctx.fillStyle = "#475569";
    ctx.font = "26px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Date: ${dateString}`, 160, 930);

    ctx.textAlign = "right";
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText("SuJu AI गुरुजी", canvas.width - 160, 915);
    ctx.fillStyle = "#64748B";
    ctx.font = "22px sans-serif";
    ctx.fillText("Verified Digital Mentor · SuJu स्टडी", canvas.width - 160, 952);

    const link = document.createElement("a");
    link.download = `SuJu-Study-Certificate-${courseTitle.replace(/[^a-zA-Z0-9]+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <h3 className="text-base font-bold text-slate-900">
              {language === "english"
                ? "SuJu Study Certificate"
                : "SuJu स्टडी प्रमाणपत्र (Certificate)"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor="cert-student-name"
              className="text-xs font-semibold text-slate-700"
            >
              {language === "english"
                ? "Your Name on Certificate:"
                : "सर्टिफिकेट पर आपका नाम:"}
            </label>
            <input
              id="cert-student-name"
              type="text"
              maxLength={45}
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none sm:w-64"
            />
          </div>

          {/* Certificate Preview */}
          <div className="rounded-xl border-4 border-blue-700 bg-white p-1.5">
            <div className="rounded-lg border-2 border-amber-500/80 bg-slate-50/40 px-6 py-7 text-center">
              <p className="text-sm font-bold tracking-wide text-blue-700">
                SuJu स्टडी · SuJu Study Academy
              </p>
              <h4 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                CERTIFICATE OF ACHIEVEMENT
              </h4>
              <p className="mt-3 text-xs text-slate-500">
                This certificate is proudly awarded to
              </p>
              <p className="mt-1.5 border-b border-slate-300 pb-2 text-2xl font-bold text-blue-900 sm:text-3xl">
                {studentName.trim() || "SuJu Scholar"}
              </p>
              <p className="mt-3 text-xs text-slate-600 sm:text-sm">
                For mastering Beginner, Advance & Professional levels of
              </p>
              <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
                {courseTitle}
              </p>
              <p className="mt-2 text-xs font-semibold text-emerald-700 tabular-nums">
                Score: {score}/10 ({score * 10}%) · Passed
              </p>
              <div className="mt-6 flex items-end justify-between text-left text-xs text-slate-500">
                <span>Date: {dateString}</span>
                <div className="text-right">
                  <p className="font-bold text-slate-900">SuJu AI गुरुजी</p>
                  <p className="text-[11px]">SuJu स्टडी Mentor</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>
                {language === "english"
                  ? "Download Certificate (PNG)"
                  : "सर्टिफिकेट डाउनलोड करें (PNG)"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
