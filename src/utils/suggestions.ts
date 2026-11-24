import type { LanguageMode } from "../types/teacher";

export interface ParsedTeacherReply {
  displayText: string;
  suggestions: string[];
}

const OPEN_TAG = "[[SUGGESTIONS]]";
const CLOSE_TAG = "[[/SUGGESTIONS]]";

export function parseTeacherSuggestions(rawText: string): ParsedTeacherReply {
  if (!rawText) {
    return { displayText: "", suggestions: [] };
  }

  const openIdx = rawText.indexOf(OPEN_TAG);
  if (openIdx === -1) {
    // Hide partial opening tag while streaming (e.g. "[[SUGG")
    const partialBracketIdx = rawText.lastIndexOf("[[");
    if (partialBracketIdx !== -1 && OPEN_TAG.startsWith(rawText.slice(partialBracketIdx))) {
      return {
        displayText: rawText.slice(0, partialBracketIdx).trimEnd(),
        suggestions: [],
      };
    }
    return { displayText: rawText, suggestions: [] };
  }

  const beforeBlock = rawText.slice(0, openIdx).trimEnd();
  const afterOpen = rawText.slice(openIdx + OPEN_TAG.length);
  const closeIdx = afterOpen.indexOf(CLOSE_TAG);

  if (closeIdx === -1) {
    // Still streaming inside [[SUGGESTIONS]] block
    return { displayText: beforeBlock, suggestions: [] };
  }

  const blockContent = afterOpen.slice(0, closeIdx);
  const afterClose = afterOpen.slice(closeIdx + CLOSE_TAG.length).trim();

  const suggestions = blockContent
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 4)
    .slice(0, 4);

  const displayText = afterClose
    ? `${beforeBlock}\n\n${afterClose}`.trim()
    : beforeBlock;

  return { displayText, suggestions };
}

interface TopicRule {
  keywords: RegExp;
  suggestions: Record<LanguageMode, string[]>;
}

const TOPIC_RULES: TopicRule[] = [
  {
    keywords: /photosynth|प्रकाश\s*संश्लेषण/i,
    suggestions: {
      hindi: [
        "प्रकाश संश्लेषण (Photosynthesis) क्या है? (सरल भाषा में)",
        "प्रकाश संश्लेषण का रासायनिक सूत्र और समीकरण",
        "प्रकाश संश्लेषण के मुख्य चरण (Steps)",
      ],
      hinglish: [
        "Photosynthesis kya hai? (सरल भाषा में)",
        "Photosynthesis ka formula aur equation",
        "Photosynthesis ke चरण (Steps)",
      ],
      english: [
        "What is Photosynthesis? (in simple words)",
        "Chemical formula and equation of Photosynthesis",
        "Step-by-step process of Photosynthesis",
      ],
    },
  },
  {
    keywords: /newton|न्यूटन/i,
    suggestions: {
      hindi: [
        "न्यूटन के गति के तीनों नियम उदाहरण सहित समझाएं",
        "न्यूटन का तीसरा नियम (क्रिया-प्रतिक्रिया) क्या है?",
        "न्यूटन के दूसरे नियम (F = ma) पर एक सवाल हल करें",
      ],
      hinglish: [
        "Newton ke teeno laws of motion simple examples ke saath",
        "Newton ka teesra niyam (Action-Reaction) kya hai?",
        "Newton ke second law (F = ma) ka numerical solve karein",
      ],
      english: [
        "Explain Newton's three laws of motion with examples",
        "What is Newton's third law of motion?",
        "Solve a numerical using Newton's second law (F = ma)",
      ],
    },
  },
  {
    keywords: /परावर्तन|अपवर्तन|reflection|refraction|mirror|lens|दर्पण|लेंस/i,
    suggestions: {
      hindi: [
        "प्रकाश का परावर्तन क्या है और इसके दो नियम क्या हैं?",
        "परावर्तन और अपवर्तन में क्या अंतर है?",
        "अवतल और उत्तल दर्पण के उपयोग आसान भाषा में बताएं",
      ],
      hinglish: [
        "Prakash ka paravartan (Reflection) aur uske niyam samjhayein",
        "Reflection aur Refraction mein kya difference hai?",
        "Concave aur Convex mirror ke uses batayein",
      ],
      english: [
        "What is reflection of light and its two laws?",
        "Difference between reflection and refraction of light",
        "Uses of concave and convex mirrors with examples",
      ],
    },
  },
  {
    keywords: /python|loop|लूप|function|list|tuple|dict/i,
    suggestions: {
      hindi: [
        "Python में for loop और while loop में क्या अंतर है?",
        "Python में function (def) कैसे बनाते हैं? उदाहरण दें",
        "Python में List और Tuple के बीच अंतर समझाएं",
      ],
      hinglish: [
        "Python mein for loop aur while loop kaise kaam karte hain?",
        "Python mein function (def) banane ka easy example dein",
        "Python mein List aur Tuple mein kya difference hai?",
      ],
      english: [
        "How do for loops and while loops work in Python?",
        "How to write a function in Python with an example",
        "Difference between List and Tuple in Python",
      ],
    },
  },
  {
    keywords: /1857|क्रांति|revolt|freedom|स्वतंत्रता/i,
    suggestions: {
      hindi: [
        "1857 की क्रांति के मुख्य कारण क्या थे?",
        "1857 के विद्रोह के प्रमुख नेता और केंद्र कौन थे?",
        "1857 की क्रांति का भारतीय इतिहास पर क्या प्रभाव पड़ा?",
      ],
      hinglish: [
        "1857 ki kranti ke main reasons kya the?",
        "1857 revolt ke pramukh leaders aur places batayein",
        "1857 ki kranti ka result aur impact kya hua?",
      ],
      english: [
        "What were the main causes of the 1857 Revolt?",
        "Key leaders and centers of the 1857 uprising",
        "Consequences and impact of the Revolt of 1857",
      ],
    },
  },
  {
    keywords: /quadratic|द्विघात|trigonometry|त्रिकोणमिति|pythagoras|पाइथागोरस|equation|समीकरण/i,
    suggestions: {
      hindi: [
        "द्विघात समीकरण हल करने का सूत्र (Formula) और उदाहरण",
        "त्रिकोणमिति (sin, cos, tan) याद रखने की आसान ट्रिक",
        "पाइथागोरस प्रमेय क्या है और इसे कैसे हल करते हैं?",
      ],
      hinglish: [
        "Quadratic equation solve karne ka formula aur example",
        "Trigonometry table (sin, cos, tan) yaad karne ki easy trick",
        "Pythagoras theorem kya hai aur numerical kaise solve karein?",
      ],
      english: [
        "Quadratic formula with a step-by-step solved example",
        "Easy trick to remember Trigonometry ratios (sin, cos, tan)",
        "Explain Pythagoras theorem with a solved example",
      ],
    },
  },
  {
    keywords: /संधि|समास|व्याकरण|tense|grammar|voice|निबंध/i,
    suggestions: {
      hindi: [
        "संधि और उसके तीनों प्रकार उदाहरण सहित समझाएं",
        "समास किसे कहते हैं? इसके 6 भेद आसान भाषा में बताएं",
        "हिंदी में एक अच्छा निबंध लिखने का सही तरीका क्या है?",
      ],
      hinglish: [
        "English Tenses (Past, Present, Future) ki easy trick batayein",
        "Active aur Passive Voice change karne ke rules samjhayein",
        "Hindi vyakaran mein Sandhi aur Samas ka difference",
      ],
      english: [
        "Explain all 12 English Tenses with simple examples",
        "Rules for changing Active Voice to Passive Voice",
        "How to write a well-structured school essay",
      ],
    },
  },
  {
    keywords: /ohm|ओम|electricity|विद्युत|circuit|resistance|current/i,
    suggestions: {
      hindi: [
        "ओम का नियम (V = IR) आसान भाषा में समझाएं",
        "श्रेणीक्रम (Series) और समांतरक्रम (Parallel) प्रतिरोध में अंतर",
        "विद्युत धारा और वोल्टेज में क्या अंतर होता है?",
      ],
      hinglish: [
        "Ohm's Law (V = IR) simple example ke saath samjhayein",
        "Series aur Parallel circuit mein kya difference hai?",
        "Current, Voltage aur Resistance kya hote hain?",
      ],
      english: [
        "Explain Ohm's Law (V = IR) with a solved example",
        "Difference between Series and Parallel circuits",
        "What are electric current, voltage, and resistance?",
      ],
    },
  },
];

function cleanPartialTopic(input: string): string {
  return input
    .trim()
    .replace(/[.?!…]+$/g, "")
    .replace(/\b(kya|kaise|kyun|wala|wali|ka|ki|ke|mein|me|what|is|how|why|explain|वो|का|की|के|क्या|कैसे|वाला|वाली)\s*$/i, "")
    .trim();
}

export function getLocalTypingSuggestions(
  input: string,
  language: LanguageMode
): string[] {
  const trimmed = input.trim();
  if (trimmed.length < 3) return [];

  for (const rule of TOPIC_RULES) {
    if (rule.keywords.test(trimmed)) {
      return rule.suggestions[language];
    }
  }

  const baseTopic = cleanPartialTopic(trimmed) || trimmed;
  if (baseTopic.length < 2) return [];

  if (language === "english") {
    return [
      `What is ${baseTopic}? (in simple words)`,
      `Key formula or main points of ${baseTopic}`,
      `Explain ${baseTopic} step-by-step with an example`,
    ];
  }

  if (language === "hinglish") {
    return [
      `${baseTopic} kya hai? (सरल भाषा में)`,
      `${baseTopic} ka formula aur main points`,
      `${baseTopic} ko step-by-step example ke saath samjhayein`,
    ];
  }

  return [
    `${baseTopic} क्या है? (सरल भाषा में)`,
    `${baseTopic} के मुख्य बिंदु और सूत्र`,
    `${baseTopic} को उदाहरण सहित स्टेप-बाय-स्टेप समझाएं`,
  ];
}
