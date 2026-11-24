import type { TeacherMemoryItem } from "../types/teacher";

const MEMORY_STORAGE_KEY = "suju_teacher_memory_v1";
const MAX_MEMORIES = 25;

// Fast client-side pre-filter for obvious abusive, adult, violent, or harmful terms
const UNSAFE_PATTERNS: RegExp[] = [
  /\b(fuck|shit|bitch|asshole|bastard|porn|xxx|nude|sex|dick|pussy|whore|slut|rape|suicide|kill yourself|bomb|terrorist|cocaine|heroin|meth)\b/i,
  /(मादरचोद|बहनचोद|भोसड़ी|चूतिया|हरामी|रंडी|गांड|लंड|चूत|कमीना|साला|गाली|अश्लील|पोर्न|नंगा|आत्महत्या|बम बनाना)/i,
  /\b(madarchod|behenchod|bhosdike|chutiya|harami|randi|gandu|kamina|kutti|kutta)\b/i,
];

export function isObviouslyUnsafeMemoryInput(text: string): boolean {
  const normalized = text.trim();
  if (!normalized || normalized.length < 2) return true;
  return UNSAFE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function loadTeacherMemories(): TeacherMemoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is TeacherMemoryItem =>
          Boolean(item) &&
          typeof item.id === "string" &&
          typeof item.text === "string" &&
          typeof item.category === "string" &&
          typeof item.createdAt === "number" &&
          !isObviouslyUnsafeMemoryInput(item.text)
      )
      .slice(0, MAX_MEMORIES);
  } catch {
    return [];
  }
}

export function saveTeacherMemories(items: TeacherMemoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const safeItems = items
      .filter((item) => !isObviouslyUnsafeMemoryInput(item.text))
      .slice(0, MAX_MEMORIES);
    window.localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(safeItems));
  } catch {
    // Ignore storage quota errors cleanly
  }
}
