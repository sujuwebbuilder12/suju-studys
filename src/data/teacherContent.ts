import type { FollowUpChip, LanguageMode, SampleDoubt } from "../types/teacher";

export interface LanguageStrings {
  greetingTitle: string;
  greetingBody: string;
  inputPlaceholder: string;
  newDoubtLabel: string;
  memoryButtonLabel: string;
  memoryModalTitle: string;
  memoryModalSubtitle: string;
  memoryInputPlaceholder: string;
  memorySaveLabel: string;
  memoryValidatingLabel: string;
  memoryEmptyState: string;
  memorySavedToast: string;
  memoryRefusalMessage: string;
  memoryCategoryLabels: {
    preference: string;
    study_note: string;
    educational_fact: string;
  };
  serverBusyFallbackMessage: string;
  listenLabel: string;
  stopListenLabel: string;
  micIdleHint: string;
  micListeningHint: string;
  uploadPhotoLabel: string;
  takePhotoLabel: string;
  uploadPdfLabel: string;
  attachTooltip: string;
  micTooltip: string;
  sendTooltip: string;
  thinkingLabel: string;
  teacherName: string;
  sampleSectionLabel: string;
  speechUnsupportedError: string;
  speechPermissionError: string;
  fileTooLargeError: string;
  unsupportedFileError: string;
  sampleDoubts: SampleDoubt[];
  followUpChips: FollowUpChip[];
}

export const LANGUAGE_OPTIONS: { id: LanguageMode; label: string }[] = [
  { id: "hindi", label: "हिंदी" },
  { id: "english", label: "English" },
  { id: "hinglish", label: "Hinglish" },
];

export const TEACHER_CONTENT: Record<LanguageMode, LanguageStrings> = {
  hindi: {
    greetingTitle: "नमस्ते! मैं हूँ आपका SuJu AI गुरुजी।",
    greetingBody:
      "कोई भी सवाल लिखें, बोलें, या फोटो/PDF भेजें—मैं आपको बिल्कुल आसान भाषा में स्टेप-बाय-स्टेप समझाऊँगा।",
    inputPlaceholder: "अपना सवाल यहाँ लिखें, माइक से बोलें, या किताब की फोटो/PDF भेजें...",
    newDoubtLabel: "नया सवाल",
    memoryButtonLabel: "सीखी हुई बातें",
    memoryModalTitle: "सीखी हुई अच्छी बातें (Teacher Memory)",
    memoryModalSubtitle:
      "अपनी कक्षा, विषय या कोई उपयोगी स्टडी नोट यहाँ लिखें ताकि गुरुजी उसी के अनुसार समझाएं। गुरुजी केवल ज्ञानवर्धक, सही और अच्छी बातें ही सीखते हैं।",
    memoryInputPlaceholder:
      "जैसे: मैं कक्षा 10 में हूँ और मुझे विज्ञान उदाहरण के साथ समझना अच्छा लगता है...",
    memorySaveLabel: "सेव करें",
    memoryValidatingLabel: "जांच हो रही है...",
    memoryEmptyState:
      "अभी कोई नोट सेव नहीं है। ऊपर अपनी कक्षा, लक्ष्य या कोई अच्छा स्टडी नोट जोड़ें।",
    memorySavedToast: "अच्छी बात सफलतापूर्वक याद कर ली गई!",
    memoryRefusalMessage:
      "मैं एक आदर्श शिक्षक हूँ, मैं केवल ज्ञानवर्धक, सही और अच्छी बातें ही सीखता हूँ।",
    memoryCategoryLabels: {
      preference: "पसंद / कक्षा",
      study_note: "स्टडी नोट",
      educational_fact: "सही तथ्य",
    },
    serverBusyFallbackMessage:
      "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।",
    listenLabel: "सुनें (Listen)",
    stopListenLabel: "रोकें (Stop)",
    micIdleHint: "माइक दबाकर हिंदी या English में बोलें",
    micListeningHint: "सुन रहा हूँ... बोलिए",
    uploadPhotoLabel: "फोटो चुनें (Gallery)",
    takePhotoLabel: "कैमरा से फोटो लें",
    uploadPdfLabel: "PDF डॉक्यूमेंट भेजें",
    attachTooltip: "फोटो या PDF जोड़ें",
    micTooltip: "बोलकर पूछें",
    sendTooltip: "गुरुजी को भेजें",
    thinkingLabel: "गुरुजी हल लिख रहे हैं...",
    teacherName: "SuJu AI गुरुजी",
    sampleSectionLabel: "शुरू करने के लिए किसी सवाल पर क्लिक करें",
    speechUnsupportedError:
      "आपके ब्राउज़र में वॉइस टाइपिंग उपलब्ध नहीं है। कृपया सवाल लिखें या Chrome/Edge का उपयोग करें।",
    speechPermissionError:
      "माइक की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग से माइक्रोफ़ोन की अनुमति दें।",
    fileTooLargeError: "फ़ाइल का आकार 12 MB से कम होना चाहिए।",
    unsupportedFileError: "कृपया केवल फोटो (JPG, PNG, WebP) या PDF फ़ाइल चुनें।",
    sampleDoubts: [
      {
        id: "math",
        category: "math",
        label: "गणित का सवाल हल करें",
        prompt: "द्विघात समीकरण $x^2 - 5x + 6 = 0$ को गुणनखंड विधि से स्टेप-बाय-स्टेप हल करना सिखाइए।",
      },
      {
        id: "science",
        category: "science",
        label: "विज्ञान का टॉपिक समझाएं",
        prompt: "प्रकाश संश्लेषण (Photosynthesis) क्या होता है? इसे आसान भाषा और समीकरण के साथ समझाइए।",
      },
      {
        id: "hindi",
        category: "hindi",
        label: "हिंदी निबंध या व्याकरण",
        prompt: "हिंदी व्याकरण में 'संधि' और उसके तीन मुख्य प्रकारों को आसान उदाहरणों के साथ समझाइए।",
      },
      {
        id: "coding",
        category: "coding",
        label: "Python कोड समझाएं",
        prompt: "Python में `for` loop क्या होता है? एक सरल उदाहरण और लाइन-बाय-लाइन व्याख्या के साथ समझाइए।",
      },
    ],
    followUpChips: [
      {
        id: "simpler",
        label: "और आसान भाषा में समझाएं",
        prompt: "कृपया इसी उत्तर को और भी आसान भाषा में एक छोटे बच्चे की तरह स्टेप-बाय-स्टेप समझाएं।",
      },
      {
        id: "example",
        label: "एक और उदाहरण दें",
        prompt: "कृपया इसी टॉपिक पर एक नया और व्यावहारिक उदाहरण देकर समझाएं।",
      },
      {
        id: "practice",
        label: "इससे जुड़ा एक प्रैक्टिस सवाल पूछें",
        prompt: "अब इसी टॉपिक से जुड़ा मुझे एक प्रैक्टिस सवाल हल करने के लिए दीजिए (उत्तर अभी मत बताइए, पहले मुझे प्रयास करने दीजिए)।",
      },
    ],
  },
  english: {
    greetingTitle: "Namaste! I am your SuJu AI Teacher.",
    greetingBody:
      "Type any question, speak into the mic, or upload a textbook photo or PDF—I will explain every step in simple, clear language.",
    inputPlaceholder: "Type your doubt here, speak with the mic, or attach a photo/PDF...",
    newDoubtLabel: "New Doubt",
    memoryButtonLabel: "Teacher Notes",
    memoryModalTitle: "Teacher Memory (Good Knowledge Only)",
    memoryModalSubtitle:
      "Save your class level, weak topics, or helpful study notes so Guruji adapts explanations for you. Guruji only learns accurate, respectful, and educational knowledge.",
    memoryInputPlaceholder:
      "Example: I am in Class 10 and need extra step-by-step help in Trigonometry...",
    memorySaveLabel: "Save Note",
    memoryValidatingLabel: "Checking...",
    memoryEmptyState:
      "No study notes saved yet. Add your class, learning preference, or a helpful formula note above.",
    memorySavedToast: "Saved to Teacher Memory!",
    memoryRefusalMessage:
      "मैं एक आदर्श शिक्षक हूँ, मैं केवल ज्ञानवर्धक, सही और अच्छी बातें ही सीखता हूँ। (As a dedicated teacher, I only learn accurate, respectful, and educational things.)",
    memoryCategoryLabels: {
      preference: "Preference",
      study_note: "Study Note",
      educational_fact: "Verified Fact",
    },
    serverBusyFallbackMessage:
      "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें। (The server is busy right now—please try again in 2 seconds.)",
    listenLabel: "Listen",
    stopListenLabel: "Stop",
    micIdleHint: "Tap mic to speak in English or Hindi",
    micListeningHint: "Listening... speak clearly",
    uploadPhotoLabel: "Upload Photo / Image",
    takePhotoLabel: "Take Photo (Camera)",
    uploadPdfLabel: "Upload PDF Document",
    attachTooltip: "Attach image or PDF",
    micTooltip: "Ask by voice",
    sendTooltip: "Ask Teacher",
    thinkingLabel: "Guruji is writing your explanation...",
    teacherName: "SuJu AI Guruji",
    sampleSectionLabel: "Try a sample doubt to begin",
    speechUnsupportedError:
      "Voice input is not supported in this browser. Please type your question or use Chrome/Edge.",
    speechPermissionError:
      "Microphone permission was denied. Please allow mic access in your browser settings.",
    fileTooLargeError: "Please choose a file smaller than 12 MB.",
    unsupportedFileError: "Only image files (JPG, PNG, WebP) and PDF documents are supported.",
    sampleDoubts: [
      {
        id: "math",
        category: "math",
        label: "Solve a Math Problem",
        prompt: "Solve the quadratic equation $x^2 - 5x + 6 = 0$ by factorization, explaining every step clearly.",
      },
      {
        id: "science",
        category: "science",
        label: "Explain a Science Topic",
        prompt: "What is Photosynthesis? Explain how plants make food with a simple diagram-like breakdown and equation.",
      },
      {
        id: "hindi",
        category: "hindi",
        label: "Essay or Grammar Help",
        prompt: "Explain Active Voice vs Passive Voice in grammar with 3 simple everyday examples.",
      },
      {
        id: "coding",
        category: "coding",
        label: "Explain Python Code",
        prompt: "Explain how a Python `for` loop works with a beginner-friendly example and line-by-line explanation.",
      },
    ],
    followUpChips: [
      {
        id: "simpler",
        label: "Explain even more simply",
        prompt: "Could you explain this again in even simpler words with an everyday analogy?",
      },
      {
        id: "example",
        label: "Give one more example",
        prompt: "Please give me one more fresh example on this same topic.",
      },
      {
        id: "practice",
        label: "Ask a practice question",
        prompt: "Give me one practice question on this topic so I can try solving it myself first (hold the answer until I reply).",
      },
    ],
  },
  hinglish: {
    greetingTitle: "Namaste! Main hoon aapka SuJu AI Guruji.",
    greetingBody:
      "Koi bhi doubt likhein, mic se bolein, ya book ki photo/PDF bhejein—main aapko bilkul simple Hinglish mein step-by-step samjhaunga.",
    inputPlaceholder: "Apna doubt yahan likhein, mic se bolein, ya photo/PDF upload karein...",
    newDoubtLabel: "New Doubt",
    memoryButtonLabel: "Teacher Notes",
    memoryModalTitle: "Seekhi Hui Achhi Baatein (Teacher Memory)",
    memoryModalSubtitle:
      "Apni class, weak subjects ya sahi study notes yahan save karein taaki Guruji aapke level ke hisaab se samjha sakein. Guruji sirf gyanvardhak, sahi aur achhi baatein hi seekhte hain.",
    memoryInputPlaceholder:
      "Jaise: Main Class 10 mein hoon aur mujhe Maths step-by-step pasand hai...",
    memorySaveLabel: "Save Karein",
    memoryValidatingLabel: "Check ho raha hai...",
    memoryEmptyState:
      "Abhi koi note save nahi hai. Upar apni class, preference ya koi achha study note add karein.",
    memorySavedToast: "Achhi baat Guruji ki memory mein save ho gayi!",
    memoryRefusalMessage:
      "मैं एक आदर्श शिक्षक हूँ, मैं केवल ज्ञानवर्धक, सही और अच्छी बातें ही सीखता हूँ।",
    memoryCategoryLabels: {
      preference: "Class / Preference",
      study_note: "Study Note",
      educational_fact: "Verified Fact",
    },
    serverBusyFallbackMessage:
      "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।",
    listenLabel: "Sunen (Listen)",
    stopListenLabel: "Rokein (Stop)",
    micIdleHint: "Mic dabakar Hindi ya English mein bolein",
    micListeningHint: "Sun raha hoon... boliye",
    uploadPhotoLabel: "Photo Upload Karein",
    takePhotoLabel: "Camera se Photo Lein",
    uploadPdfLabel: "PDF Document Bhejein",
    attachTooltip: "Photo ya PDF attach karein",
    micTooltip: "Bolkar poochein",
    sendTooltip: "Guruji ko bhejein",
    thinkingLabel: "Guruji step-by-step likh rahe hain...",
    teacherName: "SuJu AI Guruji",
    sampleSectionLabel: "Start karne ke liye ek sample question chunein",
    speechUnsupportedError:
      "Is browser mein voice input support nahi hai. Please question type karein ya Chrome/Edge use karein.",
    speechPermissionError:
      "Mic permission nahi mili. Please browser settings mein microphone allow karein.",
    fileTooLargeError: "File size 12 MB se kam hona chahiye.",
    unsupportedFileError: "Sirf image files (JPG, PNG, WebP) ya PDF documents hi upload karein.",
    sampleDoubts: [
      {
        id: "math",
        category: "math",
        label: "Math ka sawal solve karein",
        prompt: "Quadratic equation $x^2 - 5x + 6 = 0$ ko factorization method se step-by-step solve karke samjhaiye.",
      },
      {
        id: "science",
        category: "science",
        label: "Science topic samjhayein",
        prompt: "Photosynthesis kya hota hai? Simple Hinglish mein formula aur steps ke saath samjhaiye.",
      },
      {
        id: "hindi",
        category: "hindi",
        label: "Grammar ya Essay help",
        prompt: "English grammar mein Tenses (Past, Present, Future) ko aasan trick aur examples ke saath samjhaiye.",
      },
      {
        id: "coding",
        category: "coding",
        label: "Python code samjhayein",
        prompt: "Python mein `for` loop kaise kaam karta hai? Ek easy example aur line-by-line explanation ke saath batayein.",
      },
    ],
    followUpChips: [
      {
        id: "simpler",
        label: "Aur easy language mein samjhayein",
        prompt: "Please isi answer ko aur bhi simple language aur daily life example ke saath samjhaiye.",
      },
      {
        id: "example",
        label: "Ek aur example dein",
        prompt: "Please isi topic par ek naya example dekar samjhaiye.",
      },
      {
        id: "practice",
        label: "Ek practice question poochein",
        prompt: "Ab mujhe isi topic se ek practice question solve karne ke liye dijiye (pehle mujhe try karne dijiyega).",
      },
    ],
  },
};
