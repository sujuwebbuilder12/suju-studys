import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Check,
  Copy,
  Heart,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import type { LanguageMode } from "../types/teacher";

interface DonationModalProps {
  isOpen: boolean;
  language: LanguageMode;
  onClose: () => void;
}

const PRESET_AMOUNTS = [10, 21, 51, 101];
const UPI_ID = "6299214017-3@ibl";
const PAYEE_NAME = "SUMIT KUMAR";
const CREATOR_AVATAR_URL =
  "/assets/aistudio/16415-removebg-preview_6441a7b3.png";

export function DonationModal({
  isOpen,
  language,
  onClose,
}: DonationModalProps) {
  const [amountInput, setAmountInput] = useState<string>("21");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const numericAmount = Number(amountInput);
  const isAmountValid =
    amountInput.trim() !== "" &&
    Number.isFinite(numericAmount) &&
    numericAmount >= 10;

  const effectiveAmount = isAmountValid ? Math.round(numericAmount) : 10;

  const upiUri = useMemo(() => {
    return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
      PAYEE_NAME
    )}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(
      "Support SuJu Study Free Education"
    )}`;
  }, [effectiveAmount]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    QRCode.toDataURL(upiUri, {
      width: 240,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [upiUri, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pickLabel = (hi: string, en: string, hinglish: string) =>
    language === "english" ? en : language === "hinglish" ? hinglish : hi;

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback copy if clipboard permission blocked
      const input = document.createElement("input");
      input.value = UPI_ID;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-xs sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-modal-title"
        className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            {avatarError ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                SK
              </div>
            ) : (
              <img
                src={CREATOR_AVATAR_URL}
                alt="Sumit Kumar — Founder of SuJu Study"
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="h-11 w-11 shrink-0 rounded-full border border-slate-200 bg-blue-50 object-cover object-top"
              />
            )}
            <div>
              <h2
                id="donation-modal-title"
                className="text-base font-bold text-slate-900 sm:text-lg"
              >
                {pickLabel(
                  "SuJu स्टडी को सपोर्ट करें",
                  "Support SuJu Study (Free Education)",
                  "SuJu Study ko Support karein"
                )}
              </h2>
              <p className="text-xs text-slate-600">
                {pickLabel(
                  "Support Free Education · Founder: Sumit Kumar",
                  "Keep free education alive · Founder: Sumit Kumar",
                  "Support Free Education · Founder: Sumit Kumar"
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close donation dialog"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-xs leading-relaxed text-slate-600 sm:text-[13px]">
            {pickLabel(
              "आपका ₹10 का छोटा सा सहयोग भी बिहार बोर्ड, कॉलेज, डिफेंस और कोडिंग के लाखों छात्रों के लिए SuJu स्टडी को हमेशा मुफ़्त रखने में मदद करता है।",
              "Even a small contribution starting at ₹10 helps keep SuJu Study 100% free for Bihar Board, College, Defence, and Coding students.",
              "Aapka ₹10 ka chhota sa support bhi laakhon students ke liye SuJu Study ko hamesha free rakhne mein madad karta hai."
            )}
          </p>

          {/* Quick Amount Selector (Min ₹10) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {pickLabel(
                "सहयोग राशि चुनें (न्यूनतम ₹10):",
                "Select Support Amount (Minimum ₹10):",
                "Support Amount chunein (Minimum ₹10):"
              )}
            </label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((amt) => {
                const active = isAmountValid && Number(amountInput) === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountInput(String(amt))}
                    className={`min-h-[40px] rounded-xl border text-sm font-bold tabular-nums transition-colors ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    ₹{amt}
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5">
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-bold text-slate-500">
                  ₹
                </span>
                <input
                  type="number"
                  min={10}
                  step={1}
                  inputMode="numeric"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="10"
                  aria-label="Custom donation amount in rupees"
                  className={`min-h-[42px] w-full rounded-xl border bg-white py-2 pr-3.5 pl-8 text-sm font-semibold tabular-nums text-slate-900 focus:outline-none focus:ring-2 ${
                    isAmountValid
                      ? "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      : "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  }`}
                />
              </div>

              {!isAmountValid && (
                <p
                  role="alert"
                  className="mt-1.5 text-xs font-semibold text-rose-600"
                >
                  {language === "english"
                    ? "Minimum donation amount is ₹10."
                    : "न्यूनतम डोनेशन ₹10 है"}
                </p>
              )}
            </div>
          </div>

          {/* PhonePe QR Code & UPI Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5F259F] text-xs font-extrabold text-white">
                पे
              </span>
              <span className="text-sm font-bold text-[#5F259F]">PhonePe</span>
              <span className="text-xs font-medium text-slate-500">
                · UPI Accepted Here
              </span>
            </div>

            <div className="mx-auto mt-3 flex w-fit flex-col items-center rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`PhonePe UPI QR Code for ${PAYEE_NAME} ₹${effectiveAmount}`}
                  className="h-44 w-44 object-contain sm:h-48 sm:w-48"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center bg-slate-100 text-xs text-slate-500">
                  Generating QR...
                </div>
              )}
              <p className="mt-2 text-xs font-bold tracking-wide text-slate-900">
                {PAYEE_NAME}
              </p>
              <p className="text-[11px] font-medium text-slate-500 tabular-nums">
                {isAmountValid ? `Paying ₹${effectiveAmount}` : "Min ₹10"}
              </p>
            </div>

            {/* UPI ID + One-Tap Copy */}
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span className="truncate font-mono text-xs font-semibold text-slate-800 select-all sm:text-[13px]">
                {UPI_ID}
              </span>
              <button
                type="button"
                onClick={() => void handleCopyUpi()}
                className="inline-flex min-h-[34px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    <span className="text-emerald-700">
                      {language === "english" ? "Copied" : "कॉपी हो गया"}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                    <span>
                      {language === "english" ? "Copy UPI ID" : "Copy UPI ID"}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* One-Tap UPI Deep Link */}
            {isAmountValid ? (
              <a
                href={upiUri}
                className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#5F259F] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#4c1d80] sm:text-sm"
              >
                <Smartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {pickLabel(
                    `Pay ₹${effectiveAmount} via UPI App (PhonePe / GPay / Paytm)`,
                    `Pay ₹${effectiveAmount} via UPI App (PhonePe / GPay / Paytm)`,
                    `Pay ₹${effectiveAmount} via UPI App (PhonePe / GPay / Paytm)`
                  )}
                </span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mt-3 inline-flex min-h-[44px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 sm:text-sm"
              >
                <Smartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {language === "english"
                    ? "Enter at least ₹10 to pay"
                    : "भुगतान के लिए कम से कम ₹10 दर्ज करें"}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            <span>
              {pickLabel(
                "100% सुरक्षित डायरेक्ट UPI पेमेंट · कोई अतिरिक्त शुल्क नहीं",
                "100% secure direct UPI payment · Zero platform fee",
                "100% safe direct UPI payment · No extra charges"
              )}
            </span>
            <Heart className="h-3 w-3 fill-rose-500 text-rose-500" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
