export type CourseCategory =
  | "bihar_board"
  | "technology"
  | "college"
  | "defence_govt";

export type CourseTier = "beginner" | "advance" | "professional";

export type StreamId = "science" | "arts" | "commerce";

export type DegreeId = "ba" | "bsc" | "bcom";

export interface CourseSubject {
  id: string;
  nameHi: string;
  nameEn: string;
  nameHinglish: string;
  detailHi: string;
  detailEn: string;
  detailHinglish: string;
}

export interface BiharClassInfo {
  classNumber: number;
  stageHi: string;
  stageEn: string;
  stageHinglish: string;
  subjects?: CourseSubject[];
  streams?: Record<StreamId, CourseSubject[]>;
}

export interface TechCourse {
  id: string;
  titleEn: string;
  titleHi: string;
  titleHinglish: string;
  stack: string[];
  descriptionHi: string;
  descriptionEn: string;
  descriptionHinglish: string;
  iconKey:
    | "web"
    | "app"
    | "ai"
    | "game"
    | "data"
    | "security"
    | "cloud"
    | "dsa"
    | "design"
    | "languages"
    | "os";
}

export interface LabFile {
  id: string;
  name: string;
  content: string;
}

export interface CollegeProgram {
  id: DegreeId;
  shortTitle: string;
  titleHi: string;
  titleEn: string;
  titleHinglish: string;
  subjects: CourseSubject[];
}

export interface CbcsSemesterInfo {
  semester: number;
  labelHi: string;
  labelEn: string;
  focusHi: string;
  focusEn: string;
}

export interface DefenceGovtExam {
  id: string;
  group: "defence" | "govt";
  titleHi: string;
  titleEn: string;
  titleHinglish: string;
  subExams: string;
  topics: string[];
  descriptionHi: string;
  descriptionEn: string;
  descriptionHinglish: string;
  physicalSummaryHi: string;
  physicalSummaryEn: string;
}

export interface BookChapter {
  chapterNumber: number;
  tier: CourseTier;
  title: string;
  subtitle: string;
  keyTopics: string[];
}

export interface LessonSection {
  heading: string;
  contentMarkdown: string;
  keyTakeaway: string;
}

export interface LessonExercise {
  question: string;
  hint?: string;
  answer: string;
}

export interface TextbookMcq {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TextbookExercises {
  objectiveMcqs: TextbookMcq[];
  shortAnswers: LessonExercise[];
  longAnswers: LessonExercise[];
}

export interface GeneratedLesson {
  lessonTitle: string;
  estimatedMinutes: number;
  summary: string;
  zeroToHeroAnalogy?: string;
  sections: LessonSection[];
  examImportantPoints?: string[];
  textbookExercises?: TextbookExercises;
  practiceExercises?: LessonExercise[];
  askTeacherPrompt: string;
}

export interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CourseProgressEntry {
  passedTiers: Partial<Record<CourseTier, number>>; // best score out of 10
  completedChapters?: number[]; // 1-based chapter numbers completed
  certificateEarnedAt?: number;
}

export type CourseProgressMap = Record<string, CourseProgressEntry>;
