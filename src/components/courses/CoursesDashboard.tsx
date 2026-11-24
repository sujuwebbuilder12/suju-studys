import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Cloud,
  Code2,
  Cpu,
  Gamepad2,
  GitBranch,
  Globe,
  GraduationCap,
  HardDrive,
  Landmark,
  Palette,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Terminal,
  Timer,
  University,
} from "lucide-react";
import {
  BIHAR_BOARD_CLASSES,
  CBCS_SEMESTERS,
  COLLEGE_PROGRAMS,
  DEFENCE_GOVT_EXAMS,
  TECH_COURSES,
} from "../../data/coursesCatalog";
import type {
  BiharClassInfo,
  CourseCategory,
  CourseProgressMap,
  CourseSubject,
  CourseTier,
  DefenceGovtExam,
  DegreeId,
  StreamId,
  TechCourse,
} from "../../types/courses";
import type { LanguageMode } from "../../types/teacher";
import { CodeLabPanel } from "./CodeLabPanel";
import { CourseWorkspace } from "./CourseWorkspace";

interface CoursesDashboardProps {
  language: LanguageMode;
  progress: CourseProgressMap;
  onRecordPass: (courseKey: string, tier: CourseTier, score: number) => void;
  onMarkChapterComplete: (
    courseKey: string,
    chapterNumber: number,
    completed?: boolean
  ) => void;
  onBackToTeacher: () => void;
  onAskTeacherTopic: (prompt: string) => void;
}

interface SelectedCourseState {
  courseKey: string;
  courseCategory: CourseCategory;
  courseTitle: string;
  courseContext: string;
  stackTopics?: string[];
}

function getTechIcon(iconKey: TechCourse["iconKey"]) {
  switch (iconKey) {
    case "web":
      return <Globe className="h-5 w-5 text-blue-600" aria-hidden="true" />;
    case "app":
      return <Smartphone className="h-5 w-5 text-emerald-600" aria-hidden="true" />;
    case "ai":
      return <Cpu className="h-5 w-5 text-indigo-600" aria-hidden="true" />;
    case "game":
      return <Gamepad2 className="h-5 w-5 text-amber-600" aria-hidden="true" />;
    case "data":
      return <BarChart3 className="h-5 w-5 text-sky-600" aria-hidden="true" />;
    case "security":
      return <Shield className="h-5 w-5 text-rose-600" aria-hidden="true" />;
    case "cloud":
      return <Cloud className="h-5 w-5 text-cyan-600" aria-hidden="true" />;
    case "dsa":
      return <GitBranch className="h-5 w-5 text-violet-600" aria-hidden="true" />;
    case "design":
      return <Palette className="h-5 w-5 text-pink-600" aria-hidden="true" />;
    case "languages":
      return <Code2 className="h-5 w-5 text-slate-800" aria-hidden="true" />;
    case "os":
      return <HardDrive className="h-5 w-5 text-teal-600" aria-hidden="true" />;
  }
}

export function CoursesDashboard({
  language,
  progress,
  onRecordPass,
  onMarkChapterComplete,
  onBackToTeacher,
  onAskTeacherTopic,
}: CoursesDashboardProps) {
  const [category, setCategory] = useState<CourseCategory>("bihar_board");
  const [selectedClass, setSelectedClass] = useState<BiharClassInfo | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamId>("science");
  const [selectedDegree, setSelectedDegree] = useState<DegreeId>("ba");
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [activeCourse, setActiveCourse] = useState<SelectedCourseState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTechLab, setShowTechLab] = useState(false);
  const [techLabPreset, setTechLabPreset] = useState<string>("web");

  const pickLabel = (hi: string, en: string, hinglish: string) =>
    language === "english" ? en : language === "hinglish" ? hinglish : hi;

  const getProgressSummary = (courseKey: string) => {
    const entry = progress[courseKey];
    if (!entry) return null;
    const passedCount = Object.values(entry.passedTiers).filter(
      (s) => typeof s === "number" && s >= 6
    ).length;
    const chCount = Array.isArray(entry.completedChapters)
      ? entry.completedChapters.length
      : 0;
    if (passedCount === 3) {
      return pickLabel("सर्टिफाइड (3/3)", "Certified (3/3)", "Certified (3/3)");
    }
    if (passedCount > 0 && chCount > 0) {
      return `${chCount}/16 Ch · ${passedCount}/3 ${pickLabel("लेवल", "Lvl", "Lvl")}`;
    }
    if (passedCount > 0) {
      return `${passedCount}/3 ${pickLabel("लेवल पास", "Levels Passed", "Levels Passed")}`;
    }
    if (chCount > 0) {
      return `${chCount}/16 ${pickLabel("अध्याय पूरे", "Chapters", "Chapters")}`;
    }
    return null;
  };

  if (activeCourse) {
    return (
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <CourseWorkspace
          courseKey={activeCourse.courseKey}
          courseCategory={activeCourse.courseCategory}
          courseTitle={activeCourse.courseTitle}
          courseContext={activeCourse.courseContext}
          stackTopics={activeCourse.stackTopics}
          language={language}
          progress={progress}
          onBack={() => setActiveCourse(null)}
          onRecordPass={onRecordPass}
          onMarkChapterComplete={onMarkChapterComplete}
          onAskTeacher={onAskTeacherTopic}
        />
      </main>
    );
  }

  const openSubject = (cls: BiharClassInfo, subj: CourseSubject) => {
    const subjTitle = pickLabel(subj.nameHi, subj.nameEn, subj.nameHinglish);
    const subjDetail = pickLabel(subj.detailHi, subj.detailEn, subj.detailHinglish);
    const streamSuffix =
      cls.classNumber >= 11 ? ` (${selectedStream.toUpperCase()})` : "";

    setActiveCourse({
      courseKey: `bseb-${cls.classNumber}-${cls.classNumber >= 11 ? selectedStream + "-" : ""}${subj.id}`,
      courseCategory: "bihar_board",
      courseTitle: `Bihar Board Class ${cls.classNumber}${streamSuffix} — ${subjTitle}`,
      courseContext: `Bihar Board (SCERT / BSEB) Class ${cls.classNumber}: ${subjDetail}`,
    });
  };

  const openTechCourse = (course: TechCourse) => {
    const title = pickLabel(course.titleHi, course.titleEn, course.titleHinglish);
    const desc = pickLabel(
      course.descriptionHi,
      course.descriptionEn,
      course.descriptionHinglish
    );
    setActiveCourse({
      courseKey: `tech-${course.id}`,
      courseCategory: "technology",
      courseTitle: title,
      courseContext: `${desc} Topics: ${course.stack.join(", ")}`,
      stackTopics: course.stack,
    });
  };

  const openCollegeSubject = (degreeId: DegreeId, subj: CourseSubject) => {
    const degree = COLLEGE_PROGRAMS.find((d) => d.id === degreeId)!;
    const semInfo = CBCS_SEMESTERS.find((s) => s.semester === selectedSemester)!;
    const subjTitle = pickLabel(subj.nameHi, subj.nameEn, subj.nameHinglish);
    const subjDetail = pickLabel(subj.detailHi, subj.detailEn, subj.detailHinglish);
    const semLabel = pickLabel(semInfo.focusHi, semInfo.focusEn, semInfo.focusEn);

    setActiveCourse({
      courseKey: `cbcs-${degreeId}-sem${selectedSemester}-${subj.id}`,
      courseCategory: "college",
      courseTitle: `${degree.shortTitle} Semester ${selectedSemester} — ${subjTitle}`,
      courseContext: `Bihar Universities 4-Year CBCS Syllabus (${semLabel}): ${subjDetail}`,
    });
  };

  const openDefenceGovtExam = (exam: DefenceGovtExam) => {
    const title = pickLabel(exam.titleHi, exam.titleEn, exam.titleHinglish);
    const desc = pickLabel(
      exam.descriptionHi,
      exam.descriptionEn,
      exam.descriptionHinglish
    );
    const phys = pickLabel(
      exam.physicalSummaryHi,
      exam.physicalSummaryEn,
      exam.physicalSummaryEn
    );

    setActiveCourse({
      courseKey: `exam-${exam.id}`,
      courseCategory: "defence_govt",
      courseTitle: title,
      courseContext: `${desc} Physical/Exam Standard: ${phys}`,
      stackTopics: exam.topics,
    });
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredClasses = BIHAR_BOARD_CLASSES.filter((cls) => {
    if (!q) return true;
    const classStr = `class ${cls.classNumber} कक्षा ${cls.classNumber}`;
    if (classStr.includes(q)) return true;
    const allSubjects = cls.subjects
      ? cls.subjects
      : [
          ...(cls.streams?.science || []),
          ...(cls.streams?.arts || []),
          ...(cls.streams?.commerce || []),
        ];
    return allSubjects.some(
      (s) =>
        s.nameEn.toLowerCase().includes(q) ||
        s.nameHi.toLowerCase().includes(q) ||
        s.detailEn.toLowerCase().includes(q)
    );
  });

  const filteredTech = TECH_COURSES.filter((c) => {
    if (!q) return true;
    return (
      c.titleEn.toLowerCase().includes(q) ||
      c.titleHi.toLowerCase().includes(q) ||
      c.stack.some((s) => s.toLowerCase().includes(q))
    );
  });

  const activeDegreeProgram =
    COLLEGE_PROGRAMS.find((d) => d.id === selectedDegree) || COLLEGE_PROGRAMS[0];
  const filteredCollegeSubjects = activeDegreeProgram.subjects.filter((s) => {
    if (!q) return true;
    return (
      s.nameEn.toLowerCase().includes(q) ||
      s.nameHi.toLowerCase().includes(q) ||
      s.detailEn.toLowerCase().includes(q)
    );
  });

  const filteredExams = DEFENCE_GOVT_EXAMS.filter((exam) => {
    if (!q) return true;
    return (
      exam.titleEn.toLowerCase().includes(q) ||
      exam.titleHi.toLowerCase().includes(q) ||
      exam.subExams.toLowerCase().includes(q) ||
      exam.topics.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        {/* Top Courses Banner & Back to AI Guruji Button */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {pickLabel(
                "SuJu स्टडी Courses और लाइब्रेरी",
                "SuJu Study Courses & Library",
                "SuJu Study Courses & Library"
              )}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {pickLabel(
                "स्कूल (1–12), कॉलेज CBCS (B.A./B.Sc./B.Com.), डिफेंस/सरकारी नौकरी और टेक्नोलॉजी — Beginner से Professional तक।",
                "School (1–12), College CBCS (B.A./B.Sc./B.Com.), Defence/Govt Exams & Technology — Beginner to Professional.",
                "School (1–12), College CBCS (B.A./B.Sc./B.Com.), Defence/Govt Jobs aur Tech courses — Beginner se Professional tak."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToTeacher}
            className="inline-flex min-h-[42px] shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800 transition-colors hover:border-blue-400 hover:bg-blue-100 sm:self-center sm:text-sm"
          >
            <Bot className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <span>
              {pickLabel(
                "← AI गुरुजी पर वापस जाएं",
                "← Back to AI Guruji",
                "← AI Guruji par wapas jayein"
              )}
            </span>
          </button>
        </div>

        {/* 4 Category Switcher Tabs + Search */}
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={category === "bihar_board"}
              onClick={() => {
                setCategory("bihar_board");
                setSelectedClass(null);
              }}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:text-[13px] ${
                category === "bihar_board"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {pickLabel(
                  "बिहार बोर्ड (Class 1–12)",
                  "Bihar Board (1–12)",
                  "Bihar Board (1–12)"
                )}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={category === "technology"}
              onClick={() => {
                setCategory("technology");
                setSelectedClass(null);
              }}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:text-[13px] ${
                category === "technology"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Code2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {pickLabel(
                  "Programming व Tech",
                  "Programming & Tech",
                  "Programming & Tech"
                )}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={category === "college"}
              onClick={() => {
                setCategory("college");
                setSelectedClass(null);
              }}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:text-[13px] ${
                category === "college"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <University className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {pickLabel(
                  "कॉलेज (B.A. / B.Sc. / B.Com.)",
                  "College (B.A./B.Sc./B.Com.)",
                  "College (B.A./B.Sc./B.Com.)"
                )}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={category === "defence_govt"}
              onClick={() => {
                setCategory("defence_govt");
                setSelectedClass(null);
              }}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:text-[13px] ${
                category === "defence_govt"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {pickLabel(
                  "डिफेंस व सरकारी नौकरी",
                  "Defence & Govt Jobs",
                  "Defence & Govt Jobs"
                )}
              </span>
            </button>
          </div>

          <div className="relative w-full lg:w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={pickLabel(
                "विषय, कक्षा या परीक्षा खोजें...",
                "Search class, subject, or exam...",
                "Subject, class ya exam search karein..."
              )}
              className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Category 1: Bihar Board Class 1 to 12 */}
        {category === "bihar_board" && !selectedClass && (
          <section className="mt-6">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredClasses.map((cls) => {
                const stageText = pickLabel(
                  cls.stageHi,
                  cls.stageEn,
                  cls.stageHinglish
                );
                const previewSubjects = cls.subjects
                  ? cls.subjects.map((s) =>
                      pickLabel(s.nameHi, s.nameEn, s.nameHinglish)
                    )
                  : ["Science", "Arts", "Commerce"];

                return (
                  <button
                    key={cls.classNumber}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-150 hover:border-blue-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        {stageText}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <h2 className="text-lg font-bold text-slate-900 tabular-nums">
                          {pickLabel(
                            `कक्षा ${cls.classNumber} (Class ${cls.classNumber})`,
                            `Class ${cls.classNumber}`,
                            `Class ${cls.classNumber}`
                          )}
                        </h2>
                        <ArrowRight
                          className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                        {previewSubjects.join(" · ")}
                      </p>
                    </div>

                    <p className="mt-4 text-xs font-semibold text-blue-700">
                      {cls.classNumber >= 11
                        ? pickLabel(
                            "Science · Arts · Commerce चुनें →",
                            "Select Science · Arts · Commerce →",
                            "Science · Arts · Commerce chunein →"
                          )
                        : pickLabel(
                            `${cls.subjects?.length || 4} विषय देखें →`,
                            `Explore ${cls.subjects?.length || 4} Subjects →`,
                            `${cls.subjects?.length || 4} Subjects dekhein →`
                          )}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Selected Class Subjects View */}
        {category === "bihar_board" && selectedClass && (
          <section className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedClass(null)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {pickLabel("सभी कक्षाएं (1–12)", "All Classes (1–12)", "All Classes (1–12)")}
                  </span>
                </button>
                <h2 className="text-xl font-bold text-slate-900">
                  {pickLabel(
                    `बिहार बोर्ड — कक्षा ${selectedClass.classNumber}`,
                    `Bihar Board — Class ${selectedClass.classNumber}`,
                    `Bihar Board — Class ${selectedClass.classNumber}`
                  )}
                </h2>
              </div>

              {selectedClass.streams && (
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
                  {(["science", "arts", "commerce"] as StreamId[]).map((stream) => (
                    <button
                      key={stream}
                      type="button"
                      onClick={() => setSelectedStream(stream)}
                      className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                        selectedStream === stream
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {stream === "science"
                        ? pickLabel("Science (विज्ञान)", "Science", "Science")
                        : stream === "arts"
                          ? pickLabel("Arts (कला)", "Arts", "Arts")
                          : pickLabel("Commerce (वाणिज्य)", "Commerce", "Commerce")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {(selectedClass.streams
                ? selectedClass.streams[selectedStream]
                : selectedClass.subjects || []
              ).map((subj) => {
                const courseKey = `bseb-${selectedClass.classNumber}-${selectedClass.classNumber >= 11 ? selectedStream + "-" : ""}${subj.id}`;
                const summary = getProgressSummary(courseKey);
                const hasCert =
                  (progress[courseKey]?.passedTiers?.professional ?? 0) >= 6;

                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => openSubject(selectedClass, subj)}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-150 hover:border-blue-400 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <BookOpen className="h-4.5 w-4.5" aria-hidden="true" />
                        </span>
                        {hasCert ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <Award className="h-3.5 w-3.5" aria-hidden="true" />
                            {summary}
                          </span>
                        ) : summary ? (
                          <span className="text-xs font-semibold text-emerald-700">
                            {summary}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            3 Levels
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-base font-bold text-slate-900">
                        {pickLabel(subj.nameHi, subj.nameEn, subj.nameHinglish)}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        {pickLabel(subj.detailHi, subj.detailEn, subj.detailHinglish)}
                      </p>
                    </div>

                    <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                      <span>
                        {pickLabel(
                          "पढ़ाई शुरू करें (Beginner → Pro)",
                          "Start Learning (Beginner → Pro)",
                          "Padhai Shuru Karein (Beginner → Pro)"
                        )}
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Category 2: Programming & Technology Courses */}
        {category === "technology" && (
          <section className="mt-6 space-y-5">
            {/* Integrated Practice Terminal & VS Code Lab Launch Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Terminal className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                      {pickLabel(
                        "Practice Terminal व VS Code Lab (कोड लिखें और आउटपुट देखें)",
                        "Live Practice Terminal & VS Code Lab (Write & Run Code)",
                        "Live Practice Terminal & VS Code Lab (Code likhein aur output dekhein)"
                      )}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {pickLabel(
                        "HTML/CSS/JS लाइव प्रीव्यू, Python, Java, C, C++, Go, C#, Rust, PHP और SQL यहीं चलाएं।",
                        "Run HTML/CSS/JS live browser preview, Python, Java, C, C++, Go, C#, Rust, PHP & SQL with multi-file tabs.",
                        "HTML/CSS/JS live preview, Python, Java, C, C++, Go, C#, Rust, PHP aur SQL yahan run karein."
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTechLab(true)}
                  className="inline-flex min-h-[40px] shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 sm:self-center sm:text-sm"
                >
                  <Terminal className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {pickLabel(
                      "कोड लैब खोलें (Open Code Lab)",
                      "Open Code Lab",
                      "Open Code Lab (Code likhein)"
                    )}
                  </span>
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
                <span className="mr-1 text-[11px] font-semibold text-slate-500">
                  {pickLabel("त्वरित शुरुआत:", "Quick Launch:", "Quick Launch:")}
                </span>
                {[
                  { id: "web", label: "HTML / CSS / JS" },
                  { id: "python", label: "Python" },
                  { id: "java", label: "Java" },
                  { id: "cpp", label: "C++" },
                  { id: "c", label: "C" },
                  { id: "sql", label: "SQL" },
                  { id: "go", label: "Go / C# / Rust" },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setTechLabPreset(preset.id);
                      setShowTechLab(true);
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {showTechLab && (
              <CodeLabPanel
                language={language}
                initialPreset={techLabPreset}
                onClose={() => setShowTechLab(false)}
                onAskTeacher={onAskTeacherTopic}
              />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTech.map((course) => {
                const courseKey = `tech-${course.id}`;
                const summary = getProgressSummary(courseKey);
                const hasCert =
                  (progress[courseKey]?.passedTiers?.professional ?? 0) >= 6;

                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => openTechCourse(course)}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-150 hover:border-blue-400 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                          {getTechIcon(course.iconKey)}
                        </span>
                        {hasCert ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <Award className="h-3.5 w-3.5" aria-hidden="true" />
                            {summary}
                          </span>
                        ) : summary ? (
                          <span className="text-xs font-semibold text-emerald-700">
                            {summary}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            Beginner · Advance · Pro
                          </span>
                        )}
                      </div>

                      <h2 className="mt-3.5 text-lg font-bold text-slate-900">
                        {pickLabel(
                          course.titleHi,
                          course.titleEn,
                          course.titleHinglish
                        )}
                      </h2>

                      <p className="mt-1 text-xs font-semibold text-blue-700">
                        {course.stack.join(" · ")}
                      </p>

                      <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                        {pickLabel(
                          course.descriptionHi,
                          course.descriptionEn,
                          course.descriptionHinglish
                        )}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                      <span>
                        {pickLabel(
                          "कोर्स और सर्टिफिकेट शुरू करें",
                          "Start Course & Certificate",
                          "Course & Certificate Start Karein"
                        )}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Category 3: College & Graduation (Bihar Universities 4-Year CBCS B.A., B.Sc., B.Com.) */}
        {category === "college" && (
          <section className="mt-6 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                    {pickLabel(
                      "बिहार विश्वविद्यालय 4-वर्षीय CBCS स्नातक पाठ्यक्रम (Semester 1–8)",
                      "Bihar Universities 4-Year CBCS Graduation Syllabus (Semester 1–8)",
                      "Bihar Universities 4-Year CBCS Graduation (Semester 1–8)"
                    )}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {pickLabel(
                      "अपनी डिग्री और सेमेस्टर चुनें — आसान नोट्स, महत्वपूर्ण Long/Short Q&A व परीक्षा टेस्ट।",
                      "Select your degree & semester for structured notes, Long/Short Q&A, and exam prep.",
                      "Apni degree aur semester chunein — easy notes, Long/Short Q&A aur exam prep ke liye."
                    )}
                  </p>
                </div>

                {/* Degree Selector: B.A. | B.Sc. | B.Com. */}
                <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
                  {COLLEGE_PROGRAMS.map((prog) => (
                    <button
                      key={prog.id}
                      type="button"
                      onClick={() => setSelectedDegree(prog.id)}
                      className={`min-h-[36px] rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors sm:text-sm ${
                        selectedDegree === prog.id
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {prog.shortTitle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester 1 to 8 Selector */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-4">
                {CBCS_SEMESTERS.map((sem) => {
                  const active = selectedSemester === sem.semester;
                  return (
                    <button
                      key={sem.semester}
                      type="button"
                      onClick={() => setSelectedSemester(sem.semester)}
                      className={`min-h-[34px] rounded-lg border px-3 py-1 text-xs font-semibold tabular-nums transition-colors ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {pickLabel(`सेमेस्टर ${sem.semester}`, `Sem ${sem.semester}`, `Sem ${sem.semester}`)}
                    </button>
                  );
                })}
              </div>

              <p className="mt-2.5 text-xs font-medium text-blue-700">
                {pickLabel(
                  CBCS_SEMESTERS[selectedSemester - 1].focusHi,
                  CBCS_SEMESTERS[selectedSemester - 1].focusEn,
                  CBCS_SEMESTERS[selectedSemester - 1].focusEn
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCollegeSubjects.map((subj) => {
                const courseKey = `cbcs-${selectedDegree}-sem${selectedSemester}-${subj.id}`;
                const summary = getProgressSummary(courseKey);
                const hasCert =
                  (progress[courseKey]?.passedTiers?.professional ?? 0) >= 6;

                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => openCollegeSubject(selectedDegree, subj)}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-150 hover:border-blue-400 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                          <University className="h-4.5 w-4.5" aria-hidden="true" />
                        </span>
                        {hasCert ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <Award className="h-3.5 w-3.5" aria-hidden="true" />
                            {summary}
                          </span>
                        ) : summary ? (
                          <span className="text-xs font-semibold text-emerald-700">
                            {summary}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 tabular-nums">
                            {activeDegreeProgram.shortTitle} · Sem {selectedSemester}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-base font-bold text-slate-900">
                        {pickLabel(subj.nameHi, subj.nameEn, subj.nameHinglish)}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        {pickLabel(subj.detailHi, subj.detailEn, subj.detailHinglish)}
                      </p>
                    </div>

                    <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                      <span>
                        {pickLabel(
                          "CBCS नोट्स व Long/Short Q&A खोलें",
                          "Open CBCS Notes & Long/Short Q&A",
                          "CBCS Notes & Long/Short Q&A kholein"
                        )}
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Category 4: Defence & Govt Job Prep */}
        {category === "defence_govt" && (
          <section className="mt-6 space-y-5">
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/60 px-4 py-3.5 text-xs leading-relaxed text-slate-800 sm:text-sm">
              <span className="font-bold text-blue-900">
                {pickLabel(
                  "निःशुल्क परीक्षा तैयारी व मॉक टेस्ट: ",
                  "Free Exam Prep & Realistic Timed Mock Tests: ",
                  "Free Exam Prep & Timed Mock Tests: "
                )}
              </span>
              {pickLabel(
                "हर परीक्षा में Level 1 व 2 के विषयवार नोट्स, फिजिकल/मेडिकल गाइड और Level 3 में -0.25 नेगेटिव मार्किंग के साथ 20-प्रश्नों का फुल-लेंथ टाइमर मॉक टेस्ट शामिल है।",
                "Includes subject notes, physical/medical fitness guides, and a Level 3 Full-Length Timed Mock Test with -0.25 negative marking & instant score analysis.",
                "Har exam mein subject notes, physical/medical guide aur Level 3 mein -0.25 negative marking wala Full-Length Timed Mock Test shaamil hai."
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExams.map((exam) => {
                const courseKey = `exam-${exam.id}`;
                const summary = getProgressSummary(courseKey);
                const hasCert =
                  (progress[courseKey]?.passedTiers?.professional ?? 0) >= 6;
                const isDefence = exam.group === "defence";

                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => openDefenceGovtExam(exam)}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-150 hover:border-blue-400 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                            isDefence
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isDefence ? (
                            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <Landmark className="h-5 w-5" aria-hidden="true" />
                          )}
                        </span>

                        {hasCert ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <Award className="h-3.5 w-3.5" aria-hidden="true" />
                            {summary}
                          </span>
                        ) : summary ? (
                          <span className="text-xs font-semibold text-emerald-700">
                            {summary}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                            <Timer className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                            <span>Mock Test</span>
                          </span>
                        )}
                      </div>

                      <h2 className="mt-3.5 text-base font-bold text-slate-900 sm:text-lg">
                        {pickLabel(exam.titleHi, exam.titleEn, exam.titleHinglish)}
                      </h2>
                      <p className="mt-1 text-xs font-semibold text-blue-700">
                        {exam.subExams}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {pickLabel(
                          exam.descriptionHi,
                          exam.descriptionEn,
                          exam.descriptionHinglish
                        )}
                      </p>
                      <p className="mt-2.5 text-[11px] font-medium text-slate-500">
                        {pickLabel(
                          exam.physicalSummaryHi,
                          exam.physicalSummaryEn,
                          exam.physicalSummaryEn
                        )}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                      <span>
                        {pickLabel(
                          "तैयारी व मॉक टेस्ट शुरू करें",
                          "Start Prep & Timed Mock",
                          "Prep & Timed Mock Start Karein"
                        )}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
