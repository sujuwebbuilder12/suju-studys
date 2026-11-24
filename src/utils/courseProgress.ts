import type {
  BookChapter,
  CourseProgressMap,
  CourseTier,
  GeneratedLesson,
} from "../types/courses";
import type { LanguageMode } from "../types/teacher";

const PROGRESS_STORAGE_KEY = "suju_courses_progress_v1";
const SYLLABUS_CACHE_PREFIX = "suju_book_syllabus_v2:";
const CHAPTER_LESSON_CACHE_PREFIX = "suju_chapter_lesson_v2:";

export function loadCourseProgress(): CourseProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as CourseProgressMap;
  } catch {
    return {};
  }
}

export function saveCourseProgress(progress: CourseProgressMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function isTierUnlocked(
  progress: CourseProgressMap,
  courseKey: string,
  tier: CourseTier
): boolean {
  if (tier === "beginner") return true;
  const entry = progress[courseKey];
  if (!entry) return false;
  if (tier === "advance") {
    return (entry.passedTiers.beginner ?? 0) >= 6;
  }
  if (tier === "professional") {
    return (entry.passedTiers.advance ?? 0) >= 6;
  }
  return false;
}

export function hasPassedTier(
  progress: CourseProgressMap,
  courseKey: string,
  tier: CourseTier
): boolean {
  const score = progress[courseKey]?.passedTiers?.[tier];
  return typeof score === "number" && score >= 6;
}

export function getCompletedChapters(
  progress: CourseProgressMap,
  courseKey: string
): number[] {
  const arr = progress[courseKey]?.completedChapters;
  return Array.isArray(arr) ? arr : [];
}

export function loadCachedSyllabus(
  courseKey: string,
  language: LanguageMode
): BookChapter[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      `${SYLLABUS_CACHE_PREFIX}${courseKey}:${language}`
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length < 14) return null;
    return parsed as BookChapter[];
  } catch {
    return null;
  }
}

export function saveCachedSyllabus(
  courseKey: string,
  language: LanguageMode,
  chapters: BookChapter[]
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${SYLLABUS_CACHE_PREFIX}${courseKey}:${language}`,
      JSON.stringify(chapters)
    );
  } catch {
    // Ignore quota errors
  }
}

export function loadCachedChapterLesson(
  courseKey: string,
  chapterNumber: number,
  language: LanguageMode,
  topicFocus = ""
): GeneratedLesson | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `${CHAPTER_LESSON_CACHE_PREFIX}${courseKey}:ch${chapterNumber}:${topicFocus}:${language}`;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeneratedLesson;
    if (!parsed || !Array.isArray(parsed.sections)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCachedChapterLesson(
  courseKey: string,
  chapterNumber: number,
  language: LanguageMode,
  lesson: GeneratedLesson,
  topicFocus = ""
): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${CHAPTER_LESSON_CACHE_PREFIX}${courseKey}:ch${chapterNumber}:${topicFocus}:${language}`;
    window.localStorage.setItem(key, JSON.stringify(lesson));
  } catch {
    // Prune oldest lesson caches if quota exceeded, then retry once
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(CHAPTER_LESSON_CACHE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      for (const k of keysToRemove.slice(0, 6)) {
        window.localStorage.removeItem(k);
      }
      const key = `${CHAPTER_LESSON_CACHE_PREFIX}${courseKey}:ch${chapterNumber}:${topicFocus}:${language}`;
      window.localStorage.setItem(key, JSON.stringify(lesson));
    } catch {
      // Ignore
    }
  }
}
