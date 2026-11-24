import type {
  BiharClassInfo,
  BookChapter,
  CbcsSemesterInfo,
  CollegeProgram,
  CourseSubject,
  CourseTier,
  DefenceGovtExam,
  StreamId,
  TechCourse,
} from "../types/courses";
import type { LanguageMode } from "../types/teacher";

const PRIMARY_SUBJECTS: CourseSubject[] = [
  {
    id: "hindi",
    nameHi: "हिंदी",
    nameEn: "Hindi",
    nameHinglish: "Hindi",
    detailHi: "वर्णमाला, मात्रा, कहानियाँ और सरल व्याकरण",
    detailEn: "Letters, reading stories, and basic Hindi grammar",
    detailHinglish: "Varnamala, kahaniyan aur basic Hindi vyakaran",
  },
  {
    id: "maths",
    nameHi: "गणित (Maths)",
    nameEn: "Mathematics",
    nameHinglish: "Maths (Ganit)",
    detailHi: "गिनती, जोड़-घटाव, गुणा-भाग, भिन्न और मापन",
    detailEn: "Numbers, arithmetic operations, fractions, and measurements",
    detailHinglish: "Ginti, jod-ghatav, guna-bhag, fractions aur measurement",
  },
  {
    id: "english",
    nameHi: "अंग्रेज़ी (English)",
    nameEn: "English",
    nameHinglish: "English",
    detailHi: "शब्द ज्ञान, वाक्य निर्माण, पाठ और बेसिक ग्रामर",
    detailEn: "Vocabulary, sentence building, stories, and foundational grammar",
    detailHinglish: "Word meaning, sentence making, stories aur basic grammar",
  },
  {
    id: "evs",
    nameHi: "पर्यावरण और हम (EVS)",
    nameEn: "Environmental Studies (EVS)",
    nameHinglish: "Paryavaran aur Hum (EVS)",
    detailHi: "हमारा परिवार, पेड़-पौधे, जल, स्वास्थ्य और आसपास की दुनिया",
    detailEn: "Family, plants, water, health, and our surroundings",
    detailHinglish: "Hamara parivar, ped-paudhe, paani, health aur surroundings",
  },
];

const MIDDLE_SUBJECTS: CourseSubject[] = [
  {
    id: "hindi-kislay",
    nameHi: "हिंदी (किसलय)",
    nameEn: "Hindi (Kislay)",
    nameHinglish: "Hindi (Kislay)",
    detailHi: "SCERT किसलय गद्य-पद्य पाठ और हिंदी व्याकरण",
    detailEn: "Bihar SCERT Kislay prose, poetry, and Hindi grammar",
    detailHinglish: "SCERT Kislay chapters, poems aur Hindi vyakaran",
  },
  {
    id: "maths",
    nameHi: "गणित",
    nameEn: "Mathematics",
    nameHinglish: "Maths (Ganit)",
    detailHi: "पूर्णांक, बीजगणित, अनुपात, ज्यामिति और क्षेत्रमिति",
    detailEn: "Integers, algebra, ratio, geometry, and mensuration",
    detailHinglish: "Integers, algebra, ratio, geometry aur mensuration",
  },
  {
    id: "science",
    nameHi: "विज्ञान",
    nameEn: "Science",
    nameHinglish: "Science (Vigyan)",
    detailHi: "भौतिक, रसायन और जीव विज्ञान के बुनियादी सिद्धांत",
    detailEn: "Foundational Physics, Chemistry, and Biology concepts",
    detailHinglish: "Physics, Chemistry aur Biology ke core concepts",
  },
  {
    id: "social-science",
    nameHi: "सामाजिक विज्ञान",
    nameEn: "Social Science",
    nameHinglish: "Social Science (SST)",
    detailHi: "इतिहास (अतीत से वर्तमान), भूगोल (हमारी दुनिया), नागरिक जीवन",
    detailEn: "History, Geography (Hamari Duniya), and Civics",
    detailHinglish: "Itihas, Bhugol (Hamari Duniya) aur Nagrik Shastra",
  },
  {
    id: "english",
    nameHi: "अंग्रेज़ी (English)",
    nameEn: "English (Radiance)",
    nameHinglish: "English (Radiance)",
    detailHi: "SCERT Radiance पाठ, टेंस, ट्रांसलेशन और पैराग्राफ लेखन",
    detailEn: "SCERT Radiance chapters, tenses, translation, and writing",
    detailHinglish: "SCERT Radiance lessons, tenses, translation aur writing",
  },
  {
    id: "sanskrit",
    nameHi: "संस्कृत",
    nameEn: "Sanskrit (Amrita)",
    nameHinglish: "Sanskrit (Amrita)",
    detailHi: "संस्कृत श्लोक, शब्द रूप, धातु रूप और सरल अनुवाद",
    detailEn: "Sanskrit shlokas, word forms, verb roots, and translation",
    detailHinglish: "Sanskrit shlok, shabd roop, dhatu roop aur anuvad",
  },
];

const MATRIC_SUBJECTS: CourseSubject[] = [
  {
    id: "maths",
    nameHi: "गणित",
    nameEn: "Mathematics",
    nameHinglish: "Mathematics (BSEB)",
    detailHi: "वास्तविक संख्याएँ, द्विघात समीकरण, त्रिकोणमिति, ज्यामिति व सांख्यिकी",
    detailEn: "Real numbers, quadratics, trigonometry, geometry, and statistics",
    detailHinglish: "Real numbers, quadratic equations, trigonometry aur geometry",
  },
  {
    id: "science",
    nameHi: "विज्ञान (Physics, Chemistry, Biology)",
    nameEn: "Science (Physics, Chemistry, Biology)",
    nameHinglish: "Science (Physics, Chemistry, Biology)",
    detailHi: "प्रकाश, विद्युत, रासायनिक अभिक्रियाएँ, धातु-अधातु और जैव प्रक्रम",
    detailEn: "Light, electricity, chemical reactions, metals, and life processes",
    detailHinglish: "Light, electricity, chemical reactions, metals aur life processes",
  },
  {
    id: "social-science",
    nameHi: "सामाजिक विज्ञान",
    nameEn: "Social Science",
    nameHinglish: "Social Science (SST)",
    detailHi: "इतिहास, भूगोल, लोकतांत्रिक राजनीति, अर्थशास्त्र और आपदा प्रबंधन",
    detailEn: "History, Geography, Political Science, Economics, Disaster Mgmt",
    detailHinglish: "History, Geography, Civics, Economics aur Disaster Management",
  },
  {
    id: "hindi-godhuli",
    nameHi: "हिंदी (गोधूलि व वर्णिका)",
    nameEn: "Hindi (Godhuli & Varnika)",
    nameHinglish: "Hindi (Godhuli & Varnika)",
    detailHi: "गोधूलि काव्य-गद्य खंड, वर्णिका कहानियाँ, संधि-समास व निबंध",
    detailEn: "Godhuli prose/poetry, Varnika stories, grammar, and essays",
    detailHinglish: "Godhuli, Varnika chapters, sandhi-samas aur nibandh",
  },
  {
    id: "english",
    nameHi: "अंग्रेज़ी (Panorama)",
    nameEn: "English (Panorama)",
    nameHinglish: "English (Panorama)",
    detailHi: "Panorama पाठ, Unseen Passage, Letter, Voice और Narration",
    detailEn: "Panorama textbook, comprehension, letters, voice, and narration",
    detailHinglish: "Panorama chapters, passage, letter, voice aur narration",
  },
  {
    id: "sanskrit",
    nameHi: "संस्कृत (पीयूषम्)",
    nameEn: "Sanskrit (Piyusham)",
    nameHinglish: "Sanskrit (Piyusham)",
    detailHi: "पीयूषम् पाठ, संस्कृत व्याकरण, प्रत्यय, समास और अनुच्छेद लेखन",
    detailEn: "Piyusham chapters, Sanskrit grammar, compounds, and composition",
    detailHinglish: "Piyusham lessons, Sanskrit vyakaran, pratyay aur anuchhed",
  },
];

const INTERMEDIATE_STREAMS: Record<StreamId, CourseSubject[]> = {
  science: [
    {
      id: "physics",
      nameHi: "भौतिक विज्ञान (Physics)",
      nameEn: "Physics",
      nameHinglish: "Physics",
      detailHi: "गति के नियम, वैद्युत आवेश, चुंबकत्व, प्रकाशिकी व आधुनिक भौतिकी",
      detailEn: "Mechanics, electrostatics, magnetism, optics, and modern physics",
      detailHinglish: "Mechanics, electrostatics, magnetism, optics aur modern physics",
    },
    {
      id: "chemistry",
      nameHi: "रसायन विज्ञान (Chemistry)",
      nameEn: "Chemistry",
      nameHinglish: "Chemistry",
      detailHi: "परमाणु संरचना, विलयन, विद्युत रसायन और कार्बनिक रसायन",
      detailEn: "Atomic structure, solutions, electrochemistry, and organic chemistry",
      detailHinglish: "Atomic structure, solutions, electrochemistry aur organic chemistry",
    },
    {
      id: "maths",
      nameHi: "गणित (Mathematics)",
      nameEn: "Mathematics",
      nameHinglish: "Mathematics",
      detailHi: "संबंध एवं फलन, आव्यूह, अवकलन, समाकलन और सदिश बीजगणित",
      detailEn: "Relations & functions, matrices, calculus, vectors, and 3D geometry",
      detailHinglish: "Functions, matrices, differentiation, integration aur vectors",
    },
    {
      id: "biology",
      nameHi: "जीव विज्ञान (Biology)",
      nameEn: "Biology",
      nameHinglish: "Biology",
      detailHi: "कोशिका, आनुवंशिकी (DNA), मानव शरीर क्रिया और जैव प्रौद्योगिकी",
      detailEn: "Cell biology, genetics, human physiology, and biotechnology",
      detailHinglish: "Cell biology, genetics (DNA), human physiology aur biotech",
    },
  ],
  arts: [
    {
      id: "history",
      nameHi: "इतिहास (History)",
      nameEn: "History",
      nameHinglish: "History (Itihas)",
      detailHi: "हड़प्पा सभ्यता, मौर्य-गुप्त काल, मध्यकालीन भारत व स्वतंत्रता संग्राम",
      detailEn: "Indus Valley, ancient & medieval India, and freedom movement",
      detailHinglish: "Harappa civilization, ancient-medieval India aur 1857-1947",
    },
    {
      id: "political-science",
      nameHi: "राजनीति विज्ञान (Political Science)",
      nameEn: "Political Science",
      nameHinglish: "Political Science",
      detailHi: "भारतीय संविधान, मौलिक अधिकार, संसद और समकालीन विश्व राजनीति",
      detailEn: "Indian Constitution, fundamental rights, parliament, world politics",
      detailHinglish: "Indian Constitution, fundamental rights, parliament aur world politics",
    },
    {
      id: "geography",
      nameHi: "भूगोल (Geography)",
      nameEn: "Geography",
      nameHinglish: "Geography (Bhugol)",
      detailHi: "मानव भूगोल, भारत के संसाधन, कृषि, उद्योग और मानचित्र कार्य",
      detailEn: "Human geography, Indian resources, agriculture, and map skills",
      detailHinglish: "Human geography, Indian resources, agriculture aur map work",
    },
    {
      id: "economics",
      nameHi: "अर्थशास्त्र (Economics)",
      nameEn: "Economics",
      nameHinglish: "Economics",
      detailHi: "व्यष्टि एवं समष्टि अर्थशास्त्र, माँग-पूर्ति, राष्ट्रीय आय और बैंकिंग",
      detailEn: "Microeconomics, macroeconomics, demand-supply, national income",
      detailHinglish: "Micro & Macro economics, demand-supply, GDP aur banking",
    },
    {
      id: "hindi",
      nameHi: "हिंदी (दिगंत)",
      nameEn: "Hindi (Digant)",
      nameHinglish: "Hindi (Digant)",
      detailHi: "दिगंत गद्य-पद्य व्याख्या, व्याकरण, संक्षेपण और निबंध लेखन",
      detailEn: "Digant textbook analysis, grammar, precis, and essay writing",
      detailHinglish: "Digant textbook chapters, vyakaran, sankshepan aur nibandh",
    },
    {
      id: "english",
      nameHi: "अंग्रेज़ी (Rainbow)",
      nameEn: "English (Rainbow)",
      nameHinglish: "English (Rainbow)",
      detailHi: "Rainbow prose & poetry, Grammar, Translation, Essay and Letters",
      detailEn: "Rainbow textbook, grammar, translation, essays, and letters",
      detailHinglish: "Rainbow chapters, grammar, translation, essay aur letter writing",
    },
  ],
  commerce: [
    {
      id: "accountancy",
      nameHi: "लेखाशास्त्र (Accountancy)",
      nameEn: "Accountancy",
      nameHinglish: "Accountancy",
      detailHi: "जर्नल एंट्री, बही-खाता, साझेदारी (Partnership) और कंपनी खाते",
      detailEn: "Journal entries, ledgers, partnership accounts, and company sheets",
      detailHinglish: "Journal entries, ledger, partnership aur company accounts",
    },
    {
      id: "business-studies",
      nameHi: "व्यावसायिक अध्ययन (Business Studies)",
      nameEn: "Business Studies",
      nameHinglish: "Business Studies",
      detailHi: "प्रबंधन के सिद्धांत, नियोजन, संगठन, विपणन और उपभोक्ता संरक्षण",
      detailEn: "Principles of management, planning, marketing, and finance",
      detailHinglish: "Management principles, planning, marketing aur consumer rights",
    },
    {
      id: "economics",
      nameHi: "अर्थशास्त्र (Economics)",
      nameEn: "Economics",
      nameHinglish: "Economics",
      detailHi: "बाज़ार संतुलन, राष्ट्रीय आय, मुद्रा-बैंकिंग और भारतीय अर्थव्यवस्था",
      detailEn: "Market equilibrium, national income, money, banking, Indian economy",
      detailHinglish: "Market equilibrium, national income, banking aur Indian economy",
    },
  ],
};

export const BIHAR_BOARD_CLASSES: BiharClassInfo[] = Array.from(
  { length: 12 },
  (_, index) => {
    const classNumber = index + 1;
    if (classNumber <= 5) {
      return {
        classNumber,
        stageHi: "प्राथमिक स्तर (SCERT)",
        stageEn: "Primary Stage (SCERT)",
        stageHinglish: "Primary Level (SCERT)",
        subjects: PRIMARY_SUBJECTS,
      };
    }
    if (classNumber <= 8) {
      return {
        classNumber,
        stageHi: "मध्य स्तर (SCERT)",
        stageEn: "Middle Stage (SCERT)",
        stageHinglish: "Middle Level (SCERT)",
        subjects: MIDDLE_SUBJECTS,
      };
    }
    if (classNumber <= 10) {
      return {
        classNumber,
        stageHi: classNumber === 10 ? "मैट्रिक बोर्ड (BSEB)" : "माध्यमिक स्तर (BSEB)",
        stageEn: classNumber === 10 ? "Matric Board (BSEB)" : "Secondary Stage (BSEB)",
        stageHinglish: classNumber === 10 ? "Matric Board (BSEB)" : "Secondary Level (BSEB)",
        subjects: MATRIC_SUBJECTS,
      };
    }
    return {
      classNumber,
      stageHi: classNumber === 12 ? "इंटरमीडिएट बोर्ड (BSEB)" : "इंटरमीडिएट (BSEB)",
      stageEn: classNumber === 12 ? "Intermediate Board (BSEB)" : "Intermediate (BSEB)",
      stageHinglish: classNumber === 12 ? "Inter Board (BSEB)" : "Intermediate (BSEB)",
      streams: INTERMEDIATE_STREAMS,
    };
  }
);

export const TECH_COURSES: TechCourse[] = [
  {
    id: "website-development",
    titleEn: "Website Development (Full-Stack Web)",
    titleHi: "वेबसाइट डेवलपमेंट (Full-Stack Web)",
    titleHinglish: "Website Development (Full-Stack Web)",
    stack: ["HTML", "CSS", "JS", "React", "Node.js", "PHP", "SQL"],
    descriptionHi:
      "आधुनिक रेस्पॉन्सिव वेबसाइट से लेकर React, Node.js, PHP और SQL आधारित फुल-स्टैक वेब ऐप्स बनाना सीखें।",
    descriptionEn:
      "Master modern responsive frontends with HTML, CSS, JS & React, plus backends using Node.js, PHP, and SQL.",
    descriptionHinglish:
      "HTML, CSS, JS, React se modern websites aur Node.js, PHP, SQL ke saath complete full-stack web apps banayein.",
    iconKey: "web",
  },
  {
    id: "app-development",
    titleEn: "App Development",
    titleHi: "मोबाइल ऐप डेवलपमेंट",
    titleHinglish: "Mobile App Development",
    stack: ["Android", "Java", "Kotlin", "Flutter", "React Native"],
    descriptionHi:
      "Android, Java, Kotlin, Flutter और React Native के साथ तेज़ और सुंदर मोबाइल ऐप्स बनाना सीखें।",
    descriptionEn:
      "Build native and cross-platform mobile apps using Android, Java, Kotlin, Flutter, and React Native.",
    descriptionHinglish:
      "Android, Java, Kotlin, Flutter aur React Native ki madad se real-world mobile apps build karna seekhein.",
    iconKey: "app",
  },
  {
    id: "ai-machine-learning",
    titleEn: "AI & Machine Learning",
    titleHi: "AI और मशीन लर्निंग",
    titleHinglish: "AI & Machine Learning",
    stack: ["Python", "ML", "Deep Learning", "Gemini AI", "Prompt Engineering"],
    descriptionHi:
      "Python, Machine Learning व Deep Learning की नींव से लेकर Gemini AI और Prompt Engineering सीखें।",
    descriptionEn:
      "Learn Python ML, Deep Learning fundamentals, Gemini AI integration, and practical Prompt Engineering.",
    descriptionHinglish:
      "Python, ML, Deep Learning ke basics se lekar Gemini AI integration aur Prompt Engineering master karein.",
    iconKey: "ai",
  },
  {
    id: "data-science",
    titleEn: "Data Science & Analytics",
    titleHi: "डेटा साइंस और एनालिटिक्स",
    titleHinglish: "Data Science & Analytics",
    stack: ["Python", "Pandas", "NumPy", "SQL", "PowerBI", "Data Visualization"],
    descriptionHi:
      "Python, Pandas, NumPy, SQL, PowerBI और चार्ट्स के साथ डेटा एनालिसिस और डैशबोर्ड बनाना सीखें।",
    descriptionEn:
      "Analyze real datasets using Python, Pandas, NumPy, SQL queries, PowerBI dashboards, and visual storytelling.",
    descriptionHinglish:
      "Python, Pandas, NumPy, SQL, PowerBI aur Data Visualization ke through real datasets analyze karna seekhein.",
    iconKey: "data",
  },
  {
    id: "game-development",
    titleEn: "Game Development",
    titleHi: "गेम डेवलपमेंट",
    titleHinglish: "Game Development",
    stack: ["C#", "C++", "Unity Basics", "JavaScript 2D/3D Games"],
    descriptionHi:
      "गेम लूप, फिजिक्स, C#, C++, Unity की बुनियाद और JavaScript 2D/3D ब्राउज़र गेम्स बनाना सीखें।",
    descriptionEn:
      "Learn game loops, 2D/3D physics, C#, C++, Unity basics, and interactive JavaScript 2D/3D games.",
    descriptionHinglish:
      "Game loop, physics, C#, C++, Unity Basics aur JavaScript 2D/3D games banana step-by-step seekhein.",
    iconKey: "game",
  },
  {
    id: "ethical-hacking",
    titleEn: "Ethical Hacking & Cybersecurity",
    titleHi: "एथिकल हैकिंग व साइबर सुरक्षा",
    titleHinglish: "Ethical Hacking & Cybersecurity",
    stack: ["Networking", "Linux Terminal", "Web Security", "Cryptography"],
    descriptionHi:
      "नेटवर्किंग, Linux Terminal, Web Security और Cryptography के ज़रिए सिस्टम को सुरक्षित रखना सीखें (पूर्णतः शैक्षिक व एथिकल)।",
    descriptionEn:
      "Strictly educational & ethical cybersecurity training covering Networking, Linux Terminal, Web Security, and Cryptography.",
    descriptionHinglish:
      "Networking, Linux Terminal, Web Security aur Cryptography (strictly educational & ethical) seekhkar systems secure karein.",
    iconKey: "security",
  },
  {
    id: "cloud-devops",
    titleEn: "Cloud Computing & DevOps",
    titleHi: "क्लाउड कंप्यूटिंग और DevOps",
    titleHinglish: "Cloud Computing & DevOps",
    stack: ["AWS", "Docker", "Git & GitHub", "Linux Server", "CI/CD"],
    descriptionHi:
      "AWS क्लाउड, Docker कंटेनर, Git & GitHub, Linux Server प्रबंधन और CI/CD ऑटोमेशन पाइपलाइन सीखें।",
    descriptionEn:
      "Deploy scalable apps using AWS cloud services, Docker containers, Git & GitHub, Linux servers, and CI/CD pipelines.",
    descriptionHinglish:
      "AWS cloud, Docker, Git & GitHub, Linux Server aur CI/CD pipelines ke saath modern deployment seekhein.",
    iconKey: "cloud",
  },
  {
    id: "dsa-interview",
    titleEn: "DSA & Coding Interview Prep",
    titleHi: "DSA और कोडिंग इंटरव्यू तैयारी",
    titleHinglish: "DSA & Coding Interview Prep",
    stack: ["Data Structures", "Algorithms", "Logic Building", "Problem Solving"],
    descriptionHi:
      "Array, Linked List, Stack, Queue, Tree, Graph, Recursion और Dynamic Programming के साथ टेक जॉब इंटरव्यू की तैयारी करें।",
    descriptionEn:
      "Master Arrays, Trees, Graphs, Dynamic Programming, and logic building to crack technical coding interviews.",
    descriptionHinglish:
      "Data Structures, Algorithms aur Logic Building master karke top tech job interviews crack karein.",
    iconKey: "dsa",
  },
  {
    id: "ui-ux-design",
    titleEn: "UI/UX & Graphic Design",
    titleHi: "UI/UX और ग्राफिक डिज़ाइन",
    titleHinglish: "UI/UX & Graphic Design",
    stack: ["Figma", "Wireframing", "Web/App Design Principles"],
    descriptionHi:
      "Figma टूल्स, Wireframing, कलर थ्योरी, टाइपोग्राफी और आधुनिक Web/App UI/UX डिज़ाइन के सिद्धांत सीखें।",
    descriptionEn:
      "Design intuitive web & mobile interfaces with Figma, wireframing, prototyping, typography, and layout principles.",
    descriptionHinglish:
      "Figma, Wireframing aur modern Web/App UI/UX Design principles seekhkar sundar interfaces banayein.",
    iconKey: "design",
  },
  {
    id: "core-programming",
    titleEn: "Core Programming Languages",
    titleHi: "कोर प्रोग्रामिंग लैंग्वेजेज़",
    titleHinglish: "Core Programming Languages",
    stack: ["Python", "Java", "C", "C++", "Go", "C#", "Rust", "SQL"],
    descriptionHi:
      "लॉजिक बिल्डिंग से लेकर Python, Java, C, C++, Go, C#, Rust और SQL में मजबूत प्रोग्रामिंग नींव बनाएं।",
    descriptionEn:
      "Build rock-solid logic and syntax mastery across Python, Java, C, C++, Go, C#, Rust, and SQL.",
    descriptionHinglish:
      "Logic building se lekar Python, Java, C, C++, Go, C#, Rust aur SQL ki solid programming foundation banayein.",
    iconKey: "languages",
  },
  {
    id: "computer-science-os",
    titleEn: "Computer Science & Operating System",
    titleHi: "कंप्यूटर साइंस और ऑपरेटिंग सिस्टम (Computer Science & Operating System)",
    titleHinglish: "Computer Science & Operating System",
    stack: [
      "Computer Fundamentals",
      "Number System",
      "OS Kernel",
      "CPU Scheduling",
      "Memory & Deadlock",
      "Linux & Shell",
    ],
    descriptionHi:
      "कंप्यूटर की पीढ़ियाँ, Hardware-Software व Number System से लेकर OS Kernel, CPU Scheduling, Deadlock, Virtual Memory और Linux Shell Scripting तक पूरा 16-अध्याय कोर्स।",
    descriptionEn:
      "Master Computer Fundamentals, Number Systems, OS Kernel, CPU Scheduling, Deadlock, Paging/Virtual Memory, Linux Shell Scripting, and Interview VVI prep across 16 chapters.",
    descriptionHinglish:
      "Computer Generations, Number System se lekar OS Kernel, CPU Scheduling, Deadlock, Virtual Memory aur Linux Shell Scripting tak complete 16-chapter course.",
    iconKey: "os",
  },
];

export const TIER_ORDER: CourseTier[] = ["beginner", "advance", "professional"];

export const TIER_METADATA: Record<
  CourseTier,
  {
    levelNum: number;
    titleEn: string;
    titleHi: string;
    titleHinglish: string;
    descHi: string;
    descEn: string;
    descHinglish: string;
  }
> = {
  beginner: {
    levelNum: 1,
    titleEn: "Level 1: Beginner",
    titleHi: "लेवल 1: Beginner (शुरुआती)",
    titleHinglish: "Level 1: Beginner",
    descHi: "बुनियादी सिद्धांत, सरल परिभाषाएँ और आसान उदाहरण",
    descEn: "Core foundations, simple definitions, and guided examples",
    descHinglish: "Basic concepts, simple definitions aur easy examples",
  },
  advance: {
    levelNum: 2,
    titleEn: "Level 2: Advance",
    titleHi: "लेवल 2: Advance (मध्यम-उच्च)",
    titleHinglish: "Level 2: Advance",
    descHi: "गहराई से समझ, न्यूमेरिकल्स, प्रैक्टिकल उपयोग और पैटर्न",
    descEn: "Deeper applications, problem-solving, and practical patterns",
    descHinglish: "Deep concepts, numericals, practical use-cases aur patterns",
  },
  professional: {
    levelNum: 3,
    titleEn: "Level 3: Professional",
    titleHi: "लेवल 3: Professional (प्रोफेशनल)",
    titleHinglish: "Level 3: Professional",
    descHi: "बोर्ड/प्रोजेक्ट स्तर की महारत, जटिल प्रश्न व सर्टिफिकेट टेस्ट",
    descEn: "Mastery-level problems, real-world architecture, and final certification",
    descHinglish: "Board/Industry mastery, tough questions aur Certificate test",
  },
};

export const CBCS_SEMESTERS: CbcsSemesterInfo[] = [
  {
    semester: 1,
    labelHi: "सेमेस्टर 1 (Major + Minor)",
    labelEn: "Semester 1 (Foundation)",
    focusHi: "CBCS सेमेस्टर 1 कोर पेपर (MJC-1, MIC-1) व आधारभूत सिद्धांत",
    focusEn: "CBCS Sem 1 Major (MJC-1) & Minor Core Foundations",
  },
  {
    semester: 2,
    labelHi: "सेमेस्टर 2 (Major + AEC)",
    labelEn: "Semester 2 (Core II)",
    focusHi: "CBCS सेमेस्टर 2 कोर पेपर (MJC-2) व विश्लेषणात्मक प्रश्न",
    focusEn: "CBCS Sem 2 Major (MJC-2) & Analytical Concepts",
  },
  {
    semester: 3,
    labelHi: "सेमेस्टर 3 (MJC-3 & 4)",
    labelEn: "Semester 3 (Intermediate I)",
    focusHi: "CBCS सेमेस्टर 3 मध्यवर्ती कोर पेपर्स व महत्वपूर्ण दीर्घ-उत्तरीय प्रश्न",
    focusEn: "CBCS Sem 3 Intermediate Core & Long/Short Exam Q&A",
  },
  {
    semester: 4,
    labelHi: "सेमेस्टर 4 (MJC-5 to 7)",
    labelEn: "Semester 4 (Intermediate II)",
    focusHi: "CBCS सेमेस्टर 4 एडवांस सिद्धांत व विश्वविद्यालय परीक्षा तैयारी",
    focusEn: "CBCS Sem 4 Advanced Theory & University Exam Prep",
  },
  {
    semester: 5,
    labelHi: "सेमेस्टर 5 (Honours Core)",
    labelEn: "Semester 5 (Honours I)",
    focusHi: "CBCS सेमेस्टर 5 गहन ऑनर्स अध्ययन व प्रैक्टिकल केस स्टडी",
    focusEn: "CBCS Sem 5 Honours Depth & Applied Case Studies",
  },
  {
    semester: 6,
    labelHi: "सेमेस्टर 6 (Honours Core)",
    labelEn: "Semester 6 (Degree Exit)",
    focusHi: "CBCS सेमेस्टर 6 विशेष पेपर व संभावित लॉन्ग-शॉर्ट प्रश्नोत्तर",
    focusEn: "CBCS Sem 6 Specialized Papers & Exam-Ready Q&A",
  },
  {
    semester: 7,
    labelHi: "सेमेस्टर 7 (4th Year Honours)",
    labelEn: "Semester 7 (Honours Yr 4)",
    focusHi: "CBCS चतुर्थ वर्ष रिसर्च मेथोडोलॉजी व उच्च स्तरीय विषय विश्लेषण",
    focusEn: "CBCS 4th Year Honours Research & High-Level Analysis",
  },
  {
    semester: 8,
    labelHi: "सेमेस्टर 8 (Research / Honours)",
    labelEn: "Semester 8 (Research Capstone)",
    focusHi: "CBCS सेमेस्टर 8 शोध परियोजना, समेकित सिद्धांत व इंटरव्यू तैयारी",
    focusEn: "CBCS Sem 8 Honours with Research & Capstone Synthesis",
  },
];

export const COLLEGE_PROGRAMS: CollegeProgram[] = [
  {
    id: "ba",
    shortTitle: "B.A.",
    titleHi: "B.A. (कला स्नातक - Bachelor of Arts)",
    titleEn: "B.A. (Bachelor of Arts)",
    titleHinglish: "B.A. (Bachelor of Arts)",
    subjects: [
      {
        id: "history",
        nameHi: "इतिहास (History)",
        nameEn: "History",
        nameHinglish: "History (Itihas)",
        detailHi: "प्राचीन भारत, मध्यकालीन इतिहास, आधुनिक भारत व विश्व इतिहास (CBCS)",
        detailEn: "Ancient India, Medieval History, Modern India, and World History",
        detailHinglish: "Ancient, Medieval, Modern India & World History (CBCS)",
      },
      {
        id: "political-science",
        nameHi: "राजनीति विज्ञान (Political Science)",
        nameEn: "Political Science",
        nameHinglish: "Political Science",
        detailHi: "राजनीतिक सिद्धांत, भारतीय संविधान, लोक प्रशासन व अंतर्राष्ट्रीय संबंध",
        detailEn: "Political theory, Indian Constitution, Public Admin, International Relations",
        detailHinglish: "Political theory, Indian Constitution & International Relations",
      },
      {
        id: "geography",
        nameHi: "भूगोल (Geography)",
        nameEn: "Geography",
        nameHinglish: "Geography (Bhugol)",
        detailHi: "भौतिक भूगोल, जलवायु विज्ञान, मानव भूगोल व भारत का भूगोल",
        detailEn: "Geomorphology, Climatology, Human Geography, Geography of India",
        detailHinglish: "Physical, Climatology, Human & Indian Geography (CBCS)",
      },
      {
        id: "economics",
        nameHi: "अर्थशास्त्र (Economics)",
        nameEn: "Economics",
        nameHinglish: "Economics",
        detailHi: "व्यष्टि/समष्टि अर्थशास्त्र, भारतीय अर्थव्यवस्था, मुद्रा व विकास अर्थशास्त्र",
        detailEn: "Micro & Macro Economics, Indian Economy, Monetary & Growth Economics",
        detailHinglish: "Micro, Macro, Monetary & Indian Economy (CBCS)",
      },
      {
        id: "hindi",
        nameHi: "हिंदी साहित्य (Hindi)",
        nameEn: "Hindi Literature",
        nameHinglish: "Hindi Literature",
        detailHi: "हिंदी साहित्य का इतिहास, आदिकाल-भक्तिकाल-आधुनिक काव्य व आलोचना",
        detailEn: "History of Hindi Literature, classical & modern poetry, criticism",
        detailHinglish: "Hindi Sahitya ka itihas, Bhaktikal, Adhunik kavya & alochana",
      },
      {
        id: "english",
        nameHi: "अंग्रेज़ी साहित्य (English)",
        nameEn: "English Literature",
        nameHinglish: "English Literature",
        detailHi: "British Poetry & Drama, Indian Writing in English, Literary Criticism",
        detailEn: "British Poetry & Drama, Indian English Writing, Literary Theory",
        detailHinglish: "Poetry, Drama, Indian Writing in English & Literary Theory",
      },
      {
        id: "psychology",
        nameHi: "मनोविज्ञान (Psychology)",
        nameEn: "Psychology",
        nameHinglish: "Psychology",
        detailHi: "सामान्य मनोविज्ञान, मानव व्यवहार, व्यक्तित्व, सामाजिक व असामान्य मनोविज्ञान",
        detailEn: "General, Cognitive, Social, Developmental & Abnormal Psychology",
        detailHinglish: "Cognitive, Social, Developmental & Abnormal Psychology",
      },
      {
        id: "sociology",
        nameHi: "समाजशास्त्र (Sociology)",
        nameEn: "Sociology",
        nameHinglish: "Sociology",
        detailHi: "भारतीय समाज की संरचना, सामाजिक परिवर्तन, विचारक व अनुसंधान पद्धति",
        detailEn: "Indian Society, Social Stratification, Thinkers & Research Methods",
        detailHinglish: "Indian Society, Social Change, Classical Thinkers & Research",
      },
    ],
  },
  {
    id: "bsc",
    shortTitle: "B.Sc.",
    titleHi: "B.Sc. (विज्ञान स्नातक - Bachelor of Science)",
    titleEn: "B.Sc. (Bachelor of Science)",
    titleHinglish: "B.Sc. (Bachelor of Science)",
    subjects: [
      {
        id: "physics",
        nameHi: "भौतिक विज्ञान (Physics)",
        nameEn: "Physics",
        nameHinglish: "Physics",
        detailHi: "यांत्रिकी, ऊष्मागतिकी, विद्युत-चुंबकत्व, प्रकाशिकी व क्वांटम भौतिकी",
        detailEn: "Mechanics, Thermodynamics, Electromagnetism, Optics, Quantum Mechanics",
        detailHinglish: "Mechanics, Thermodynamics, EMT, Optics & Quantum Physics",
      },
      {
        id: "chemistry",
        nameHi: "रसायन विज्ञान (Chemistry)",
        nameEn: "Chemistry",
        nameHinglish: "Chemistry",
        detailHi: "अकार्बनिक, कार्बनिक व भौतिक रसायन, रासायनिक बलगतिकी व स्पेक्ट्रोस्कोपी",
        detailEn: "Inorganic, Organic & Physical Chemistry, Kinetics & Spectroscopy",
        detailHinglish: "Inorganic, Organic, Physical Chemistry & Spectroscopy",
      },
      {
        id: "mathematics",
        nameHi: "गणित (Mathematics)",
        nameEn: "Mathematics",
        nameHinglish: "Mathematics",
        detailHi: "Calculus, Real Analysis, Differential Equations, Linear & Abstract Algebra",
        detailEn: "Calculus, Real & Complex Analysis, Differential Equations, Linear Algebra",
        detailHinglish: "Calculus, Real Analysis, Differential Equations & Algebra",
      },
      {
        id: "botany",
        nameHi: "वनस्पति विज्ञान (Botany)",
        nameEn: "Botany",
        nameHinglish: "Botany",
        detailHi: "शैवाल, कवक, ब्रायोफाइटा, पादप शरीर क्रिया, आनुवंशिकी व पारिस्थितिकी",
        detailEn: "Algae, Fungi, Plant Anatomy, Physiology, Genetics & Ecology",
        detailHinglish: "Plant Kingdom, Anatomy, Plant Physiology, Genetics & Ecology",
      },
      {
        id: "zoology",
        nameHi: "प्राणि विज्ञान (Zoology)",
        nameEn: "Zoology",
        nameHinglish: "Zoology",
        detailHi: "Non-Chordata & Chordata, कोशिका विज्ञान, भ्रूणिकी व मानव शरीर क्रिया",
        detailEn: "Non-Chordata, Chordata, Cell Biology, Developmental Biology & Physiology",
        detailHinglish: "Chordata, Non-Chordata, Cell Biology, Embryology & Physiology",
      },
    ],
  },
  {
    id: "bcom",
    shortTitle: "B.Com.",
    titleHi: "B.Com. (वाणिज्य स्नातक - Bachelor of Commerce)",
    titleEn: "B.Com. (Bachelor of Commerce)",
    titleHinglish: "B.Com. (Bachelor of Commerce)",
    subjects: [
      {
        id: "financial-accounting",
        nameHi: "वित्तीय लेखांकन (Financial Accounting)",
        nameEn: "Financial Accounting",
        nameHinglish: "Financial Accounting",
        detailHi: "लेखांकन मानक, मूल्यह्रास, रॉयल्टी, किराया-क्रय व शाखा खाते",
        detailEn: "Accounting Standards, Depreciation, Royalty, Hire Purchase & Branch Accounts",
        detailHinglish: "Accounting Standards, Depreciation, Royalty, Hire Purchase & Branch",
      },
      {
        id: "business-law",
        nameHi: "व्यावसायिक विधि (Business Law)",
        nameEn: "Business Law",
        nameHinglish: "Business Law",
        detailHi: "भारतीय अनुबंध अधिनियम 1872, माल विक्रय अधिनियम व कंपनी कानून",
        detailEn: "Indian Contract Act 1872, Sale of Goods Act, Negotiable Instruments",
        detailHinglish: "Indian Contract Act 1872, Sale of Goods Act & Company Law",
      },
      {
        id: "economics",
        nameHi: "व्यावसायिक अर्थशास्त्र (Economics)",
        nameEn: "Business Economics",
        nameHinglish: "Business Economics",
        detailHi: "माँग विश्लेषण, लागत-उत्पादन, बाज़ार संरचना व भारतीय वित्तीय प्रणाली",
        detailEn: "Demand Analysis, Cost & Production, Market Forms & Indian Economy",
        detailHinglish: "Demand, Production, Market Structure & Indian Economy",
      },
      {
        id: "corporate-accounting",
        nameHi: "निगम लेखांकन (Corporate Accounting)",
        nameEn: "Corporate Accounting",
        nameHinglish: "Corporate Accounting",
        detailHi: "शेयर एवं डिबेंचर निर्गमन, कंपनियों का एकीकरण व होल्डिंग कंपनी खाते",
        detailEn: "Issue of Shares & Debentures, Amalgamation, Valuation & Holding Companies",
        detailHinglish: "Shares, Debentures, Amalgamation, Valuation & Balance Sheet",
      },
      {
        id: "taxation",
        nameHi: "कराधान (Taxation & GST)",
        nameEn: "Income Tax & GST",
        nameHinglish: "Taxation (Income Tax & GST)",
        detailHi: "आयकर अधिनियम के 5 शीर्षक, कटौतियाँ (80C-80U) और GST की गणना",
        detailEn: "Five Heads of Income, Deductions (80C-80U), Tax Computation & GST",
        detailHinglish: "Income Tax 5 Heads, Deductions (80C-80U) aur GST calculation",
      },
    ],
  },
];

export const DEFENCE_GOVT_EXAMS: DefenceGovtExam[] = [
  {
    id: "indian-army-agniveer",
    group: "defence",
    titleHi: "Indian Army (Agniveer GD, Clerk, Technical, Tradesman)",
    titleEn: "Indian Army (Agniveer GD / Clerk / Tech / Tradesman)",
    titleHinglish: "Indian Army (Agniveer GD, Clerk, Tech, Tradesman)",
    subExams: "GD · Clerk/SKT · Technical · Tradesman",
    topics: [
      "General Knowledge",
      "General Science",
      "Maths",
      "Reasoning",
      "Physical & Medical Standard Guide",
    ],
    descriptionHi:
      "आर्मी अग्निवीर लिखित परीक्षा (GK, GS, Maths, Reasoning) के साथ 1.6 km दौड़, पुश-अप्स और मेडिकल स्टैंडर्ड की पूरी गाइड।",
    descriptionEn:
      "Complete Agniveer CEE prep (GK, Science, Maths, Reasoning) plus 1.6 km run & physical/medical fitness standards.",
    descriptionHinglish:
      "Army Agniveer written exam (GK, GS, Maths, Reasoning) + 1.6 km running aur physical/medical guide.",
    physicalSummaryHi: "1.6 km दौड़ (5:30 min ग्रुप-1), 10 बीम (Pull-ups), 9 ft डिच व मेडिकल मानक",
    physicalSummaryEn: "1.6 km run (5m 30s Group-I), 10 pull-ups, 9 ft ditch & medical checklist",
  },
  {
    id: "indian-airforce-vayu",
    group: "defence",
    titleHi: "Indian Airforce (Agniveer Vayu - Science & Non-Science)",
    titleEn: "Indian Airforce (Agniveer Vayu - Science & Other than Science)",
    titleHinglish: "Indian Airforce (Agniveer Vayu - Science & Non-Science)",
    subExams: "Group X (Science) · Group Y (RAGA)",
    topics: [
      "English",
      "Physics",
      "Maths",
      "RAGA (Reasoning & General Awareness)",
      "Physical Fitness Test (PFT) & Medical",
    ],
    descriptionHi:
      "अग्निवीर वायु (Science व Non-Science) के लिए English, Physics, Maths और RAGA के टॉपिक-वाइज़ नोट्स व मॉक टेस्ट।",
    descriptionEn:
      "Targeted prep for Agniveer Vayu (Science & Non-Science) covering English, Physics, Maths, RAGA, and PFT tips.",
    descriptionHinglish:
      "Agniveer Vayu (Science & Other than Science) ke liye English, Physics, Maths, RAGA aur PFT guide.",
    physicalSummaryHi: "1.6 km दौड़ (7 min), 10 पुश-अप्स, 10 सिट-अप्स, 20 स्क्वैट्स व आई-विज़न मानक",
    physicalSummaryEn: "1.6 km run (7 min), 10 push-ups, 10 sit-ups, 20 squats & vision standards",
  },
  {
    id: "indian-navy-ssr-mr",
    group: "defence",
    titleHi: "Indian Navy (Agniveer SSR / MR)",
    titleEn: "Indian Navy (Agniveer SSR / MR)",
    titleHinglish: "Indian Navy (Agniveer SSR / MR)",
    subExams: "SSR (10+2) · MR (10th Matric)",
    topics: [
      "Science",
      "Maths",
      "General Awareness",
      "English",
      "PFT & Swimming / Medical Tips",
    ],
    descriptionHi:
      "नेवी अग्निवीर SSR व MR के लिए Science, Maths, English और General Awareness के सटीक नोट्स, शॉर्ट ट्रिक्स व मॉक टेस्ट।",
    descriptionEn:
      "Navy Agniveer SSR & MR syllabus mastery across Science, Maths, General Awareness, English, and PFT guidelines.",
    descriptionHinglish:
      "Navy Agniveer SSR aur MR ke liye Science, Maths, GK, English aur PFT / medical preparation.",
    physicalSummaryHi: "1.6 km दौड़ (6:30 min), 20 उठक-बैठक (Squats), 12 पुश-अप्स व छाती विस्तार",
    physicalSummaryEn: "1.6 km run (6m 30s), 20 squats (Uthak Baithak), 12 push-ups & chest standard",
  },
  {
    id: "bihar-police",
    group: "govt",
    titleHi: "बिहार पुलिस (Constable / Daroga SI)",
    titleEn: "Bihar Police (Constable & Daroga SI)",
    titleHinglish: "Bihar Police (Constable / Daroga SI)",
    subExams: "CSBC Constable · BPSSC Daroga (SI)",
    topics: [
      "General Knowledge & Bihar Special",
      "General Science",
      "Hindi & English",
      "Maths & Reasoning",
      "PET (Running, High Jump, Shot Put)",
    ],
    descriptionHi:
      "बिहार पुलिस सिपाही और दरोगा (SI) परीक्षा के लिए बिहार स्पेशल GK, सामान्य विज्ञान, हिंदी व PET फिजिकल अंक-गणित गाइड।",
    descriptionEn:
      "Bihar Police Constable & Sub-Inspector prep covering Bihar GK, Science, Hindi, and PET scoring tips.",
    descriptionHinglish:
      "Bihar Police Constable aur Daroga SI ke liye Bihar GK, Science, Hindi aur PET scoring guide.",
    physicalSummaryHi: "1.6 km / 1 km दौड़, ऊँची कूद (High Jump) व गोला फेंक (Shot Put) स्कोरिंग",
    physicalSummaryEn: "1.6 km / 1 km sprint, High Jump & Shot Put PET merit tips",
  },
  {
    id: "bpsc-basics",
    group: "govt",
    titleHi: "BPSC Basics (बिहार लोक सेवा आयोग)",
    titleEn: "BPSC Basics (Prelims Foundation)",
    titleHinglish: "BPSC Basics (Prelims Foundation)",
    subExams: "BPSC CCE Prelims · TRE Basics",
    topics: [
      "History & Bihar Freedom Movement",
      "Indian Polity & Constitution",
      "Geography & Bihar Economy",
      "General Science & Current Static GK",
    ],
    descriptionHi:
      "BPSC प्रारंभिक परीक्षा की मजबूत नींव: बिहार का इतिहास, भारतीय राजव्यवस्था, भूगोल, विज्ञान और सटीक प्रश्न अभ्यास।",
    descriptionEn:
      "Build a strong BPSC foundation across History, Bihar Special, Indian Polity, Geography, and General Science.",
    descriptionHinglish:
      "BPSC Prelims foundation: Bihar History, Polity, Geography, General Science aur exam strategy.",
    physicalSummaryHi: "परीक्षा रणनीति: 150 प्रश्न, 1/3 नेगेटिव मार्किंग व समय प्रबंधन गाइड",
    physicalSummaryEn: "Exam Strategy: 150-question paper pacing & 1/3 negative marking discipline",
  },
  {
    id: "ssc-exams",
    group: "govt",
    titleHi: "SSC (GD Constable, CHSL, MTS)",
    titleEn: "SSC (GD, CHSL, MTS)",
    titleHinglish: "SSC (GD, CHSL, MTS)",
    subExams: "SSC GD · SSC CHSL · SSC MTS",
    topics: [
      "Quantitative Aptitude (Maths)",
      "General Intelligence & Reasoning",
      "English / Hindi Grammar",
      "General Awareness & Static GK",
    ],
    descriptionHi:
      "SSC GD, CHSL और MTS के लिए तेज़ गणित शॉर्टकट्स, रीजनिंग पैटर्न, English/हिंदी और Static GK मॉक टेस्ट।",
    descriptionEn:
      "Speed Maths shortcuts, Reasoning patterns, English/Hindi, and Static GK for SSC GD, CHSL, and MTS.",
    descriptionHinglish:
      "SSC GD, CHSL aur MTS ke liye Maths shortcuts, Reasoning, English/Hindi aur GK mock tests.",
    physicalSummaryHi: "SSC GD PST/PET: 5 km दौड़ (24 min) व ऊँचाई/छाती मानक गाइड",
    physicalSummaryEn: "SSC GD PST/PET: 5 km run (24 min) & height/chest standards",
  },
  {
    id: "indian-railways",
    group: "govt",
    titleHi: "Indian Railways (RRB Group D, NTPC)",
    titleEn: "Indian Railways (RRB Group D & NTPC)",
    titleHinglish: "Indian Railways (RRB Group D, NTPC)",
    subExams: "RRB NTPC · RRB Group D",
    topics: [
      "Mathematics (Arithmetic & Adv.)",
      "General Intelligence & Reasoning",
      "General Science (NCERT 9–10)",
      "General Awareness & Railway GK",
    ],
    descriptionHi:
      "रेलवे Group D व NTPC CBT के लिए NCERT आधारित विज्ञान, तेज़ गणित, रीजनिंग और रेलवे GK के फुल मॉक टेस्ट।",
    descriptionEn:
      "RRB NTPC & Group D CBT prep focusing on NCERT Science, Arithmetic speed, Reasoning, and Railway GK.",
    descriptionHinglish:
      "RRB Group D aur NTPC ke liye NCERT Science, Maths, Reasoning aur Railway GK full mock tests.",
    physicalSummaryHi: "Group D PET: 35 kg भार के साथ 100 m दौड़ व 1000 m दौड़ अभ्यास गाइड",
    physicalSummaryEn: "Group D PET: 100 m weight carry & 1000 m timed run conditioning",
  },
];

interface LocalizedChapterTemplate {
  chapterNumber: number;
  tier: CourseTier;
  titleHi: string;
  titleEn: string;
  titleHinglish: string;
  subtitleHi: string;
  subtitleEn: string;
  subtitleHinglish: string;
  topicsHi: string[];
  topicsEn: string[];
  topicsHinglish: string[];
}

const COMPUTER_SCIENCE_OS_CHAPTERS: LocalizedChapterTemplate[] = [
  {
    chapterNumber: 1,
    tier: "beginner",
    titleHi: "कंप्यूटर का परिचय और पीढ़ियाँ (Generations)",
    titleEn: "Introduction to Computers & Generations",
    titleHinglish: "Computer ka Parichay aur Generations",
    subtitleHi: "कंप्यूटर की परिभाषा, इतिहास, 1st से 5th पीढ़ी और आधुनिक कंप्यूटर के प्रकार।",
    subtitleEn: "History of computing, 1st to 5th generations, characteristics, and computer types.",
    subtitleHinglish: "Computer ki definition, history, 1st se 5th generation aur computer ke types.",
    topicsHi: ["1st से 5th पीढ़ी (Vacuum Tube से AI)", "IPO चक्र (Input-Process-Output)", "Super, Mainframe, Micro Computer"],
    topicsEn: ["1st to 5th Generations", "IPO Cycle", "Types of Computers"],
    topicsHinglish: ["1st se 5th Generations", "IPO Cycle", "Types of Computers"],
  },
  {
    chapterNumber: 2,
    tier: "beginner",
    titleHi: "हार्डवेयर व सॉफ्टवेयर (Hardware & Software)",
    titleEn: "Computer Hardware & Software",
    titleHinglish: "Hardware aur Software Basics",
    subtitleHi: "CPU (ALU, CU, Registers), RAM/ROM मेमोरी, Input/Output डिवाइस और सॉफ्टवेयर के प्रकार।",
    subtitleEn: "CPU architecture, RAM/ROM memory hierarchy, I/O devices, System & Application software.",
    subtitleHinglish: "CPU (ALU, CU), RAM/ROM memory, I/O devices aur System vs Application Software.",
    topicsHi: ["CPU, ALU, CU और Bus", "Primary बनाम Secondary मेमोरी", "System, Application व Utility Software"],
    topicsEn: ["CPU & Registers", "Primary vs Secondary Memory", "System vs Application Software"],
    topicsHinglish: ["CPU aur Registers", "Primary vs Secondary Memory", "System vs Application Software"],
  },
  {
    chapterNumber: 3,
    tier: "beginner",
    titleHi: "नंबर सिस्टम (Binary, Decimal, Hexadecimal)",
    titleEn: "Number System (Binary, Octal, Decimal, Hex)",
    titleHinglish: "Number System (Binary, Decimal, Hexadecimal)",
    subtitleHi: "कंप्यूटर डेटा कैसे समझता है—Binary, Octal, Decimal, Hexadecimal व रूपांतरण नियम।",
    subtitleEn: "Number bases, base conversions, binary arithmetic, and 1's/2's complement representation.",
    subtitleHinglish: "Binary, Octal, Decimal, Hexadecimal conversions aur binary addition/2's complement.",
    topicsHi: ["Binary, Decimal, Octal, Hexadecimal", "आपसी रूपांतरण (Conversion)", "ASCII, Unicode और 2's Complement"],
    topicsEn: ["Base Systems", "Number Conversions", "Binary Arithmetic & ASCII/Unicode"],
    topicsHinglish: ["Base Systems", "Number Conversions", "Binary Arithmetic aur ASCII/Unicode"],
  },
  {
    chapterNumber: 4,
    tier: "beginner",
    titleHi: "ऑपरेटिंग सिस्टम क्या है और इसके प्रकार",
    titleEn: "What is an Operating System & Its Types",
    titleHinglish: "Operating System Kya Hai aur Iske Types",
    subtitleHi: "Windows, Linux, Android और macOS कैसे काम करते हैं तथा Batch, Time-Sharing व RTOS की समझ।",
    subtitleEn: "Role of OS as resource manager plus Batch, Time-Sharing, Distributed, RTOS, Windows, Linux, Android & macOS.",
    subtitleHinglish: "OS ka role aur Batch, Time-Sharing, RTOS, Windows, Linux, Android, macOS ke types.",
    topicsHi: ["OS के मुख्य कार्य व बूटिंग", "Batch, Multiprogramming, Time-Sharing, RTOS", "Windows, Linux, Android, macOS तुलना"],
    topicsEn: ["Core OS Functions & Booting", "Batch, Time-Sharing & RTOS", "Windows, Linux, Android & macOS"],
    topicsHinglish: ["OS Functions & Booting", "Batch, Time-Sharing & RTOS", "Windows, Linux, Android, macOS"],
  },
  {
    chapterNumber: 5,
    tier: "beginner",
    titleHi: "बेसिक फाइल मैनेजमेंट और यूज़र इंटरफेस",
    titleEn: "Basic File Management & User Interfaces",
    titleHinglish: "Basic File Management aur GUI vs CLI",
    subtitleHi: "फाइल, फोल्डर, पाथ (Absolute/Relative), फाइल एक्सटेंशन व GUI बनाम CLI का अभ्यास।",
    subtitleEn: "Files, directories, paths, extensions, permissions basics, and comparing GUI with Command Line.",
    subtitleHinglish: "Files, folders, paths, file extensions aur GUI vs CLI ka practical use.",
    topicsHi: ["फाइल एक्सटेंशन व मेटाडेटा", "डायरेक्टरी ट्री व फाइल पाथ", "GUI बनाम CLI उपयोग"],
    topicsEn: ["File Extensions & Metadata", "Directory Tree & Paths", "GUI vs CLI"],
    topicsHinglish: ["File Extensions & Metadata", "Directory Tree & Paths", "GUI vs CLI"],
  },
  {
    chapterNumber: 6,
    tier: "advance",
    titleHi: "OS आर्किटेक्चर, सिस्टम कॉल्स और कर्नेल",
    titleEn: "OS Architecture, System Calls & Kernel",
    titleHinglish: "OS Architecture, System Calls aur Kernel",
    subtitleHi: "User Mode बनाम Kernel Mode, System Calls और Monolithic, Layered व Microkernel डिज़ाइन।",
    subtitleEn: "Dual-mode operation, system call execution, Monolithic, Microkernel, and Hybrid architectures.",
    subtitleHinglish: "User vs Kernel mode, System Calls, Monolithic aur Microkernel architecture.",
    topicsHi: ["User Mode बनाम Kernel Mode", "System Calls (fork, exec, read, write)", "Monolithic, Microkernel और Hybrid Kernel"],
    topicsEn: ["Dual-Mode Operation", "System Calls", "Kernel Architectures"],
    topicsHinglish: ["User vs Kernel Mode", "System Calls", "Monolithic vs Microkernel"],
  },
  {
    chapterNumber: 7,
    tier: "advance",
    titleHi: "प्रोसेस मैनेजमेंट और CPU शेड्यूलिंग",
    titleEn: "Process Management & CPU Scheduling",
    titleHinglish: "Process Management aur CPU Scheduling",
    subtitleHi: "Process States, PCB और FCFS, SJF, Priority व Round Robin शेड्यूलिंग के न्यूमेरिकल्स।",
    subtitleEn: "Process lifecycle, PCB, Turnaround & Waiting time numericals for FCFS, SJF, SRTF, Priority & Round Robin.",
    subtitleHinglish: "Process States, PCB aur FCFS, SJF, Priority, Round Robin numericals.",
    topicsHi: ["Process States और PCB", "FCFS और SJF / SRTF एल्गोरिदम", "Priority व Round Robin (Time Quantum)"],
    topicsEn: ["Process States & PCB", "FCFS & SJF Scheduling", "Priority & Round Robin"],
    topicsHinglish: ["Process States & PCB", "FCFS & SJF Scheduling", "Priority & Round Robin"],
  },
  {
    chapterNumber: 8,
    tier: "advance",
    titleHi: "थ्रेड्स, मल्टीटास्किंग और सिंक्रनाइज़ेशन",
    titleEn: "Threads, Multitasking & Synchronization",
    titleHinglish: "Threads, Multitasking aur Synchronization",
    subtitleHi: "User व Kernel Threads, Context Switching, Race Condition, Mutex और Semaphore।",
    subtitleEn: "Threads vs Processes, multithreading models, Critical Section problem, Mutex, and Semaphores.",
    subtitleHinglish: "User vs Kernel Threads, Context Switching, Race Condition, Mutex aur Semaphore.",
    topicsHi: ["Process बनाम Thread व Context Switch", "User-Level बनाम Kernel-Level Threads", "Critical Section, Mutex व Semaphore"],
    topicsEn: ["Threads vs Processes", "Multithreading Models", "Mutex & Semaphores"],
    topicsHinglish: ["Threads vs Processes", "Multithreading Models", "Mutex aur Semaphores"],
  },
  {
    chapterNumber: 9,
    tier: "advance",
    titleHi: "डेडलॉक: कारण, पहचान और बचाव (Deadlock)",
    titleEn: "Deadlock: Causes, Prevention & Avoidance",
    titleHinglish: "Deadlock: Karan, Pehchan aur Bachav",
    subtitleHi: "Coffman की 4 शर्तें, Resource Allocation Graph और Banker's Algorithm से बचाव।",
    subtitleEn: "4 necessary conditions, Deadlock Prevention, Banker's Safety Algorithm, and Recovery strategies.",
    subtitleHinglish: "Coffman ki 4 conditions, Prevention, Banker's Algorithm aur Deadlock Recovery.",
    topicsHi: ["Deadlock की 4 आवश्यक शर्तें", "Prevention व Resource Allocation Graph", "Banker's Algorithm और Recovery"],
    topicsEn: ["4 Coffman Conditions", "Deadlock Prevention & RAG", "Banker's Algorithm & Recovery"],
    topicsHinglish: ["4 Coffman Conditions", "Prevention & RAG", "Banker's Algorithm & Recovery"],
  },
  {
    chapterNumber: 10,
    tier: "advance",
    titleHi: "मेमोरी मैनेजमेंट, पेजिंग और वर्चुअल मेमोरी",
    titleEn: "Memory Management, Paging & Virtual Memory",
    titleHinglish: "Memory Management, Paging aur Virtual Memory",
    subtitleHi: "Fragmentation, Paging, Segmentation, Demand Paging, Page Fault (FIFO, LRU) और Thrashing।",
    subtitleEn: "Contiguous allocation, Paging & TLB, Segmentation, Virtual Memory, FIFO/LRU/Optimal replacement & Thrashing.",
    subtitleHinglish: "Fragmentation, Paging, Segmentation, Virtual Memory aur FIFO/LRU Page Replacement.",
    topicsHi: ["Internal व External Fragmentation", "Paging, Page Table और Segmentation", "Virtual Memory, FIFO/LRU व Thrashing"],
    topicsEn: ["Allocation & Fragmentation", "Paging & Segmentation", "Virtual Memory & Page Replacement"],
    topicsHinglish: ["Allocation & Fragmentation", "Paging & Segmentation", "Virtual Memory & Page Replacement"],
  },
  {
    chapterNumber: 11,
    tier: "advance",
    titleHi: "फाइल सिस्टम और डिस्क स्ट्रक्चर",
    titleEn: "File Systems & Storage Internals",
    titleHinglish: "File Systems aur Disk Structure",
    subtitleHi: "File Operations, Access Methods, Contiguous/Linked/Indexed Allocation, FAT, NTFS और ext4।",
    subtitleEn: "File attributes, sequential/direct access, directory implementation, inodes, FAT32, NTFS, and ext4.",
    subtitleHinglish: "File Allocation methods, Inodes, FAT32, NTFS aur ext4 file systems.",
    topicsHi: ["File Operations और Access Methods", "Contiguous, Linked व Indexed Allocation", "Inodes, FAT32, NTFS व ext4"],
    topicsEn: ["File Operations & Access", "Disk Allocation Methods", "Inodes, FAT, NTFS & ext4"],
    topicsHinglish: ["File Operations & Access", "Allocation Methods", "Inodes, FAT, NTFS & ext4"],
  },
  {
    chapterNumber: 12,
    tier: "professional",
    titleHi: "लिनक्स कमांड्स और शेल स्क्रिप्टिंग",
    titleEn: "Linux Commands & Shell Scripting",
    titleHinglish: "Linux Commands aur Shell Scripting",
    subtitleHi: "जरूरी Linux CLI कमांड्स, `chmod` अनुमतियाँ, Pipes, `grep` व Bash Shell Script लिखना।",
    subtitleEn: "Essential Linux CLI commands, file permissions (chmod/chown), pipes/redirection, and Bash scripting.",
    subtitleHinglish: "Essential Linux commands, chmod permissions, pipes aur Bash Shell Scripting.",
    topicsHi: ["ls, cd, cp, mv, ps, kill, grep कमांड्स", "फाइल परमिशन (chmod 755/644) व Pipes", "Bash Variables, Loops और Conditions"],
    topicsEn: ["Core Linux Commands", "Permissions (chmod) & Pipes", "Bash Shell Scripting"],
    topicsHinglish: ["Core Linux Commands", "Permissions (chmod) & Pipes", "Bash Shell Scripting"],
  },
  {
    chapterNumber: 13,
    tier: "professional",
    titleHi: "डिस्क शेड्यूलिंग एल्गोरिदम और RAID",
    titleEn: "Disk Scheduling Algorithms & Storage RAID",
    titleHinglish: "Disk Scheduling Algorithms aur RAID",
    subtitleHi: "Seek Time गणना के साथ FCFS, SSTF, SCAN, C-SCAN, LOOK व RAID स्तरों का विश्लेषण।",
    subtitleEn: "Disk geometry, seek time numericals for FCFS, SSTF, SCAN, C-SCAN, LOOK, and RAID 0/1/5/10.",
    subtitleHinglish: "FCFS, SSTF, SCAN, C-SCAN, LOOK seek time numericals aur RAID levels.",
    topicsHi: ["Track, Sector, Seek व Rotational Latency", "FCFS, SSTF, SCAN, C-SCAN, LOOK न्यूमेरिकल्स", "RAID 0, RAID 1, RAID 5 और SSD बनाम HDD"],
    topicsEn: ["Disk Performance Metrics", "FCFS, SSTF, SCAN & LOOK Numericals", "RAID Levels & SSD vs HDD"],
    topicsHinglish: ["Disk Metrics", "FCFS, SSTF, SCAN & LOOK Numericals", "RAID & SSD vs HDD"],
  },
  {
    chapterNumber: 14,
    tier: "professional",
    titleHi: "I/O मैनेजमेंट और डिवाइस ड्राइवर्स",
    titleEn: "I/O Management, Interrupts & Device Drivers",
    titleHinglish: "I/O Management, DMA aur Device Drivers",
    subtitleHi: "Polling बनाम Interrupts, DMA (Direct Memory Access), Buffering, Caching व Spooling।",
    subtitleEn: "I/O hardware buses, Polling vs Interrupt-driven I/O, DMA controller, Spooling, and Device Drivers.",
    subtitleHinglish: "Polling vs Interrupts, DMA, Spooling, Buffering aur Device Drivers.",
    topicsHi: ["Polling बनाम Interrupt-Driven I/O", "DMA (Direct Memory Access) कार्यप्रणाली", "Buffering, Spooling व Device Drivers"],
    topicsEn: ["Polling vs Interrupts", "Direct Memory Access (DMA)", "Spooling & Device Drivers"],
    topicsHinglish: ["Polling vs Interrupts", "DMA Working", "Spooling & Device Drivers"],
  },
  {
    chapterNumber: 15,
    tier: "professional",
    titleHi: "कंप्यूटर नेटवर्क्स और OS सिक्योरिटी बेसिक्स",
    titleEn: "Computer Networks & OS Security Basics",
    titleHinglish: "Computer Networks aur OS Security Basics",
    subtitleHi: "OSI व TCP/IP मॉडल, Sockets, Authentication, Access Control Matrix व Malware सुरक्षा।",
    subtitleEn: "OSI & TCP/IP basics, OS sockets/IPC, Authentication, ACLs, Virtualization, and Malware protection.",
    subtitleHinglish: "OSI/TCP-IP basics, Sockets, Authentication, Access Control aur OS Security.",
    topicsHi: ["OSI बनाम TCP/IP व Network Sockets", "Authentication, Encryption व Access Control", "Malware, Firewall व Virtualization"],
    topicsEn: ["OSI/TCP-IP & Sockets", "Authentication & Access Control", "Threats, Firewalls & Virtual Machines"],
    topicsHinglish: ["OSI/TCP-IP & Sockets", "Authentication & ACL", "Malware & Virtualization"],
  },
  {
    chapterNumber: 16,
    tier: "professional",
    titleHi: "यूनिवर्सिटी, GATE और टेक इंटरव्यू VVI प्रश्न",
    titleEn: "University, GATE & Tech Interview VVI Prep",
    titleHinglish: "University, GATE aur Tech Interview VVI Prep",
    subtitleHi: "पूरे सिलेबस का महा-रिवीजन, GATE/यूनिवर्सिटी न्यूमेरिकल्स और टॉप टेक इंटरव्यू प्रश्न-उत्तर।",
    subtitleEn: "Complete OS formula sheet, tricky GATE/University numericals, and top software engineering interview Q&A.",
    subtitleHinglish: "Full syllabus revision, GATE/University numericals aur top tech interview Q&A.",
    topicsHi: ["CPU, Page व Disk के सभी महत्वपूर्ण सूत्र", "GATE व यूनिवर्सिटी परीक्षा के VVI प्रश्न", "प्रोडक्ट कंपनियों के OS इंटरव्यू प्रश्न"],
    topicsEn: ["Complete OS Formula Sheet", "University & GATE Numericals", "Top Tech Interview Questions"],
    topicsHinglish: ["OS Formula Sheet", "University & GATE Numericals", "Tech Interview Q&A"],
  },
];

export function getPredefinedCourseSyllabus(
  courseKey: string,
  language: LanguageMode
): BookChapter[] | null {
  if (courseKey !== "tech-computer-science-os") {
    return null;
  }

  return COMPUTER_SCIENCE_OS_CHAPTERS.map((ch) => ({
    chapterNumber: ch.chapterNumber,
    tier: ch.tier,
    title:
      language === "english"
        ? ch.titleEn
        : language === "hinglish"
          ? ch.titleHinglish
          : ch.titleHi,
    subtitle:
      language === "english"
        ? ch.subtitleEn
        : language === "hinglish"
          ? ch.subtitleHinglish
          : ch.subtitleHi,
    keyTopics:
      language === "english"
        ? ch.topicsEn
        : language === "hinglish"
          ? ch.topicsHinglish
          : ch.topicsHi,
  }));
}

