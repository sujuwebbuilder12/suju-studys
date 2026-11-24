export type LanguageMode = "hindi" | "english" | "hinglish";

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // base64 without data URL prefix
  previewUrl?: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "teacher";
  text: string;
  attachment?: Attachment;
  language: LanguageMode;
  isStreaming?: boolean;
  error?: string;
}

export interface SampleDoubt {
  id: string;
  label: string;
  prompt: string;
  category: "math" | "science" | "hindi" | "coding";
}

export interface FollowUpChip {
  id: string;
  label: string;
  prompt: string;
}

export type MemoryCategory = "preference" | "study_note" | "educational_fact";

export interface TeacherMemoryItem {
  id: string;
  text: string;
  category: MemoryCategory;
  createdAt: number;
}
