import { useEffect, useMemo, useRef, useState } from "react";
import {
  Code2,
  Eye,
  FileCode2,
  FolderPlus,
  Loader2,
  MessageSquarePlus,
  Play,
  RotateCcw,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import type { LabFile } from "../../types/courses";
import type { LanguageMode } from "../../types/teacher";

interface CodeLabPanelProps {
  language: LanguageMode;
  initialPreset?: string;
  onClose?: () => void;
  onAskTeacher?: (prompt: string) => void;
}

interface PresetTemplate {
  id: string;
  label: string;
  files: LabFile[];
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "web",
    label: "HTML / CSS / JS",
    files: [
      {
        id: "f-html",
        name: "index.html",
        content: `<!DOCTYPE html>
<html>
<head>
  <title>SuJu Web Lab</title>
</head>
<body>
  <div class="card">
    <h1>Namaste, SuJu Study!</h1>
    <p id="msg">Click the button to test JavaScript.</p>
    <button onclick="greet()">Click Me</button>
  </div>
</body>
</html>`,
      },
      {
        id: "f-css",
        name: "style.css",
        content: `body {
  font-family: system-ui, sans-serif;
  background: #f1f5f9;
  display: flex;
  justify-content: center;
  padding: 24px;
}
.card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 20px 24px;
  text-align: center;
}
button {
  margin-top: 10px;
  background: #2563eb;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}`,
      },
      {
        id: "f-js",
        name: "script.js",
        content: `function greet() {
  const el = document.getElementById("msg");
  el.textContent = "Awesome! Your HTML + CSS + JS works!";
  console.log("Button clicked in SuJu Web Lab!");
}`,
      },
    ],
  },
  {
    id: "python",
    label: "Python",
    files: [
      {
        id: "f-py",
        name: "main.py",
        content: `# Welcome to SuJu Python Lab
def greet(name):
    return f"Namaste {name}! Welcome to Python."

print(greet("Student"))

for i in range(1, 6):
    print(f"Square of {i} = {i * i}")`,
      },
    ],
  },
  {
    id: "javascript",
    label: "JavaScript",
    files: [
      {
        id: "f-js-only",
        name: "script.js",
        content: `// JavaScript Console Lab
const marks = [78, 85, 92, 66, 88];
const total = marks.reduce((sum, m) => sum + m, 0);
const avg = total / marks.length;

console.log("Marks:", marks);
console.log("Average:", avg);`,
      },
    ],
  },
  {
    id: "java",
    label: "Java",
    files: [
      {
        id: "f-java",
        name: "Main.java",
        content: `public class Main {
    public static void main(String[] args) {
        System.out.println("Namaste from SuJu Java Lab!");
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum += i;
        }
        System.out.println("Sum of 1..5 = " + sum);
    }
}`,
      },
    ],
  },
  {
    id: "cpp",
    label: "C++",
    files: [
      {
        id: "f-cpp",
        name: "main.cpp",
        content: `#include <iostream>
using namespace std;

int main() {
    cout << "Namaste from SuJu C++ Lab!" << endl;
    for (int i = 1; i <= 4; i++) {
        cout << i << " * 10 = " << i * 10 << endl;
    }
    return 0;
}`,
      },
    ],
  },
  {
    id: "c",
    label: "C",
    files: [
      {
        id: "f-c",
        name: "main.c",
        content: `#include <stdio.h>

int main() {
    printf("Namaste from SuJu C Lab!\\n");
    int a = 12, b = 8;
    printf("Sum = %d\\n", a + b);
    return 0;
}`,
      },
    ],
  },
  {
    id: "sql",
    label: "SQL",
    files: [
      {
        id: "f-sql",
        name: "queries.sql",
        content: `CREATE TABLE students (
  id INT,
  name VARCHAR(50),
  marks INT
);

INSERT INTO students VALUES (1, 'Aarav', 88);
INSERT INTO students VALUES (2, 'Priya', 94);
INSERT INTO students VALUES (3, 'Rohan', 76);

SELECT name, marks FROM students WHERE marks >= 80 ORDER BY marks DESC;`,
      },
    ],
  },
  {
    id: "go",
    label: "Go / C# / Rust / PHP",
    files: [
      {
        id: "f-go",
        name: "main.go",
        content: `package main
import "fmt"

func main() {
    fmt.Println("Namaste from SuJu Go Lab!")
    for i := 1; i <= 3; i++ {
        fmt.Println("Step:", i)
    }
}`,
      },
    ],
  },
];

function getSuggestionsForFile(filename: string, prefix: string): string[] {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const p = prefix.toLowerCase();
  if (!p) return [];

  let pool: string[] = [];
  if (ext === "html" || ext === "htm") {
    pool = [
      "<html>",
      "<!DOCTYPE html>",
      "<head>",
      "<body>",
      "<h1></h1>",
      "<h2></h2>",
      "<p></p>",
      "<div></div>",
      '<button onclick=""></button>',
      '<input type="text" />',
      '<a href=""></a>',
      '<img src="" alt="" />',
      "<ul><li></li></ul>",
      "<style></style>",
      "<script></script>",
    ];
  } else if (ext === "css") {
    pool = [
      "display: flex;",
      "justify-content: center;",
      "align-items: center;",
      "background-color: #ffffff;",
      "color: #0f172a;",
      "padding: 16px;",
      "margin: 12px;",
      "border-radius: 10px;",
      "font-size: 16px;",
      "font-weight: 600;",
      "border: 1px solid #cbd5e1;",
    ];
  } else if (ext === "js" || ext === "ts") {
    pool = [
      "console.log()",
      "function ",
      "const ",
      "let ",
      'document.getElementById("")',
      'document.querySelector("")',
      'addEventListener("click", () => {})',
      "for (let i = 0; i < 5; i++) {}",
      "if () {}",
      "return ",
      "async function ",
      'fetch("")',
    ];
  } else if (ext === "py") {
    pool = [
      "print()",
      "def ",
      "for i in range():",
      "while ",
      'if __name__ == "__main__":',
      "elif ",
      "else:",
      "import ",
      "input()",
      "return ",
      "len()",
      "class ",
    ];
  } else if (ext === "java") {
    pool = [
      "System.out.println();",
      "public static void main(String[] args) {}",
      "public class Main {}",
      "Scanner sc = new Scanner(System.in);",
      "for (int i = 0; i < n; i++) {}",
      "import java.util.*;",
      "String ",
      "return ",
    ];
  } else if (ext === "cpp" || ext === "c") {
    pool = [
      "#include <iostream>",
      "#include <stdio.h>",
      "using namespace std;",
      "int main() {}",
      "cout << ",
      "cin >> ",
      'printf("\\n");',
      'scanf("%d", &n);',
      "for (int i = 0; i < n; i++) {}",
      "return 0;",
    ];
  } else if (ext === "sql") {
    pool = [
      "SELECT * FROM ",
      "WHERE ",
      "ORDER BY ",
      "GROUP BY ",
      "INSERT INTO ",
      "CREATE TABLE ",
      "UPDATE ",
      "DELETE FROM ",
      "INNER JOIN ",
    ];
  } else {
    pool = [
      "fmt.Println()",
      "func main() {}",
      "Console.WriteLine();",
      'println!("");',
      "fn main() {}",
      "<?php",
      "echo ",
      "return ",
    ];
  }

  return pool.filter((item) => item.toLowerCase().includes(p)).slice(0, 6);
}

export function resolvePresetForTopic(topicOrCourseId?: string): string {
  const s = (topicOrCourseId || "").toLowerCase();
  if (
    s.includes("dsa") ||
    s.includes("data structures") ||
    s.includes("algorithms") ||
    s.includes("logic")
  )
    return "python";
  if (
    s.includes("sql") ||
    s.includes("pandas") ||
    s.includes("numpy") ||
    s.includes("powerbi")
  )
    return "sql";
  if (s.includes("java") && !s.includes("javascript")) return "java";
  if (s.includes("c++") || s.includes("cpp")) return "cpp";
  if (s === "c" || s.includes(" c,")) return "c";
  if (
    s.includes("python") ||
    s.includes("ml") ||
    s.includes("deep learning") ||
    s.includes("gemini")
  )
    return "python";
  if (
    s === "go" ||
    s.includes("c#") ||
    s.includes("rust") ||
    s.includes("php")
  )
    return "go";
  if (s === "js" || s.includes("javascript") || s.includes("node.js"))
    return "javascript";
  return "web";
}

export function CodeLabPanel({
  language,
  initialPreset = "web",
  onClose,
  onAskTeacher,
}: CodeLabPanelProps) {
  const initialTemplate =
    PRESET_TEMPLATES.find((t) => t.id === initialPreset) || PRESET_TEMPLATES[0];

  const [selectedPreset, setSelectedPreset] = useState<string>(
    initialTemplate.id
  );
  const [files, setFiles] = useState<LabFile[]>(() =>
    initialTemplate.files.map((f) => ({ ...f }))
  );
  const [activeFileId, setActiveFileId] = useState<string>(
    initialTemplate.files[0].id
  );
  const [activePane, setActivePane] = useState<"editor" | "output">("editor");
  const [newFileMode, setNewFileMode] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [stdinText, setStdinText] = useState("");
  const [showStdin, setShowStdin] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [previewSrcDoc, setPreviewSrcDoc] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string>("");
  const [currentWordPrefix, setCurrentWordPrefix] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeFileId) || files[0],
    [files, activeFileId]
  );

  // Sync preset when opened with a new initialPreset
  useEffect(() => {
    const template =
      PRESET_TEMPLATES.find((t) => t.id === initialPreset) ||
      PRESET_TEMPLATES[0];
    setSelectedPreset(template.id);
    setFiles(template.files.map((f) => ({ ...f })));
    setActiveFileId(template.files[0].id);
    setActivePane("editor");
    setStdout("");
    setStderr("");
    setExitCode(null);
    setPreviewSrcDoc(null);
  }, [initialPreset]);

  // Listen to sandboxed iframe console messages
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as {
        source?: string;
        runId?: string;
        level?: "log" | "error";
        text?: string;
      };
      if (
        !data ||
        data.source !== "suju-code-lab" ||
        data.runId !== activeRunId
      ) {
        return;
      }
      if (data.level === "error") {
        setStderr((prev) =>
          prev ? `${prev}\n${data.text}` : data.text || ""
        );
      } else if (data.text !== undefined) {
        setStdout((prev) =>
          prev ? `${prev}\n${data.text}` : data.text || ""
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [activeRunId]);

  const updateCurrentPrefix = (el: HTMLTextAreaElement) => {
    const pos = el.selectionStart || 0;
    const before = el.value.slice(0, pos);
    const match = before.match(/[a-zA-Z0-9_<#$.]+$/);
    setCurrentWordPrefix(match ? match[0] : "");
  };

  const autocompleteItems = useMemo(
    () =>
      activeFile
        ? getSuggestionsForFile(activeFile.name, currentWordPrefix)
        : [],
    [activeFile, currentWordPrefix]
  );

  const handleInsertAutocomplete = (snippet: string) => {
    const el = textareaRef.current;
    if (!el || !activeFile) return;

    const pos = el.selectionStart || 0;
    const before = activeFile.content.slice(0, pos);
    const after = activeFile.content.slice(pos);
    const match = before.match(/[a-zA-Z0-9_<#$.]+$/);
    const startReplace = match ? pos - match[0].length : pos;
    const updated =
      activeFile.content.slice(0, startReplace) + snippet + after;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFile.id ? { ...f, content: updated } : f
      )
    );
    setCurrentWordPrefix("");

    window.requestAnimationFrame(() => {
      if (textareaRef.current) {
        const nextPos = startReplace + snippet.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(nextPos, nextPos);
      }
    });
  };

  const handleLoadPreset = (presetId: string) => {
    const template = PRESET_TEMPLATES.find((t) => t.id === presetId);
    if (!template) return;
    setSelectedPreset(template.id);
    setFiles(template.files.map((f) => ({ ...f })));
    setActiveFileId(template.files[0].id);
    setActivePane("editor");
    setStdout("");
    setStderr("");
    setExitCode(null);
    setPreviewSrcDoc(null);
  };

  const handleAddFile = () => {
    const clean = newFileName.trim().replace(/[^a-zA-Z0-9._-]/g, "");
    if (!clean) return;
    if (files.some((f) => f.name.toLowerCase() === clean.toLowerCase())) {
      setNewFileMode(false);
      setNewFileName("");
      return;
    }
    const newId = `f-${Date.now()}`;
    setFiles((prev) => [...prev, { id: newId, name: clean, content: "" }]);
    setActiveFileId(newId);
    setActivePane("editor");
    setNewFileName("");
    setNewFileMode(false);
  };

  const handleDeleteFile = (id: string) => {
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
  };

  const handleRunCode = async () => {
    if (!activeFile || isRunning) return;
    const ext = activeFile.name.split(".").pop()?.toLowerCase() || "";
    const hasHtmlFile = files.some((f) => /\.(html|htm)$/i.test(f.name));

    setStdout("");
    setStderr("");
    setExitCode(null);
    setActivePane("output");

    const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setActiveRunId(runId);

    // 1. HTML / CSS / JS Live Browser Preview
    if (
      ext === "html" ||
      ext === "htm" ||
      ext === "css" ||
      (ext === "js" && hasHtmlFile)
    ) {
      const htmlFile =
        files.find((f) => /\.(html|htm)$/i.test(f.name)) || activeFile;
      const cssContent = files
        .filter((f) => /\.css$/i.test(f.name))
        .map((f) => f.content)
        .join("\n");
      const jsContent = files
        .filter((f) => /\.js$/i.test(f.name))
        .map((f) => f.content)
        .join("\n");

      const consoleBridge = `<script>
(function(){
  const runId = ${JSON.stringify(runId)};
  const send = (level, args) => {
    try {
      const msg = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      window.parent.postMessage({ source: 'suju-code-lab', runId, level, text: msg }, '*');
    } catch {}
  };
  const origLog = console.log;
  console.log = (...args) => { send('log', args); origLog.apply(console, args); };
  const origErr = console.error;
  console.error = (...args) => { send('error', args); origErr.apply(console, args); };
  window.addEventListener('error', (e) => send('error', [e.message]));
})();
</script>`;

      const assembledHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>${cssContent}</style>
${consoleBridge}
</head>
<body>
${htmlFile.content}
<script>${jsContent}</script>
</body>
</html>`;

      setPreviewSrcDoc(assembledHtml);
      setExitCode(0);
      return;
    }

    // 2. Standalone JavaScript Sandboxed Console Execution
    if (ext === "js") {
      setPreviewSrcDoc(null);
      const jsRunnerHtml = `<!DOCTYPE html>
<html><head><script>
(function(){
  const runId = ${JSON.stringify(runId)};
  const send = (level, args) => {
    try {
      const msg = Array.from(args).map(a => {
        if (typeof a === 'object') { try { return JSON.stringify(a); } catch { return String(a); } }
        return String(a);
      }).join(' ');
      window.parent.postMessage({ source: 'suju-code-lab', runId, level, text: msg }, '*');
    } catch {}
  };
  console.log = (...args) => send('log', args);
  console.warn = (...args) => send('log', args);
  console.error = (...args) => send('error', args);
  window.addEventListener('error', (e) => send('error', [e.message]));
  try {
    ${activeFile.content}
  } catch (err) {
    send('error', [err && err.message ? err.message : String(err)]);
  }
})();
</script></head><body></body></html>`;
      setPreviewSrcDoc(jsRunnerHtml);
      setExitCode(0);
      return;
    }

    // 3. Python, C, C++, Java, Go, C#, Rust, PHP, SQL via Server Execution Engine
    setPreviewSrcDoc(null);
    setIsRunning(true);
    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: activeFile.name,
          code: activeFile.content,
          stdin: stdinText,
          files: files.map((f) => ({ name: f.name, content: f.content })),
          language,
        }),
      });

      const data = (await res.json()) as {
        stdout?: string;
        stderr?: string;
        exitCode?: number;
        error?: string;
      };

      if (!res.ok || data.error) {
        setStderr(
          data.error ||
            "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।"
        );
        setExitCode(1);
      } else {
        setStdout(data.stdout || "");
        setStderr(data.stderr || "");
        setExitCode(typeof data.exitCode === "number" ? data.exitCode : 0);
      }
    } catch {
      setStderr(
        "सर्वर पर अभी थोड़ी भीड़ है, कृपया 2 सेकंड में दोबारा कोशिश करें।"
      );
      setExitCode(1);
    } finally {
      setIsRunning(false);
    }
  };

  const isHtmlMode =
    activeFile &&
    (/\.(html|htm|css)$/i.test(activeFile.name) ||
      (/\.(js)$/i.test(activeFile.name) &&
        files.some((f) => /\.(html|htm)$/i.test(f.name))));

  const lineCount = activeFile ? activeFile.content.split("\n").length : 1;

  const handleAskAiHelp = () => {
    if (!onAskTeacher || !activeFile) return;
    const errContext = stderr
      ? `\n\nError Output:\n\`\`\`\n${stderr}\n\`\`\``
      : "";
    onClose?.();
    onAskTeacher(
      language === "english"
        ? `Please review, debug, and explain this ${activeFile.name} code step-by-step:\n\`\`\`\n${activeFile.content}\n\`\`\`${errContext}`
        : `कृपया मेरे इस ${activeFile.name} कोड को स्टेप-बाय-स्टेप समझाइए और अगर कोई गलती हो तो सुधार बताइए:\n\`\`\`\n${activeFile.content}\n\`\`\`${errContext}`
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SuJu Code Lab"
      className="fixed inset-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden bg-slate-950 text-slate-100"
    >
      {/* 1. Slim 48px Top Toolbar */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <label htmlFor="codelab-lang-select" className="sr-only">
            Select programming language
          </label>
          <select
            id="codelab-lang-select"
            value={selectedPreset}
            onChange={(e) => handleLoadPreset(e.target.value)}
            className="h-8 min-w-0 max-w-[125px] truncate rounded-lg border border-slate-700 bg-slate-800 px-2 text-xs font-semibold text-slate-100 focus:border-blue-500 focus:outline-none sm:max-w-[190px] sm:px-2.5"
          >
            {PRESET_TEMPLATES.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => void handleRunCode()}
            disabled={isRunning}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-2.5 text-[11px] font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60 sm:px-3.5 sm:text-xs"
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="h-3 w-3 fill-current" aria-hidden="true" />
            )}
            <span>
              {isRunning
                ? language === "english"
                  ? "Running"
                  : "चल रहा है"
                : "Run Code"}
            </span>
          </button>

          {onAskTeacher && activeFile && (
            <button
              type="button"
              onClick={handleAskAiHelp}
              className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-blue-500/40 bg-blue-500/15 px-2.5 text-[11px] font-semibold text-blue-200 transition-colors hover:bg-blue-500/25 sm:px-3 sm:text-xs"
            >
              <MessageSquarePlus className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
              <span>{language === "english" ? "AI Help" : "AI मदद"}</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-rose-500/35 bg-rose-500/15 px-2.5 text-[11px] font-semibold text-rose-200 transition-colors hover:bg-rose-600 hover:text-white sm:px-3 sm:text-xs"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{language === "english" ? "Close" : "बंद करें"}</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Compact Horizontal Multi-File Tabs */}
      <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-slate-800 bg-slate-900/70 px-2.5 py-1.5 sm:px-4">
        {files.map((file) => {
          const isActive = file.id === activeFile?.id;
          return (
            <div
              key={file.id}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors ${
                isActive
                  ? "border-blue-500 bg-slate-800 text-white"
                  : "border-slate-700/80 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveFileId(file.id);
                  setActivePane("editor");
                }}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <FileCode2
                  className="h-3.5 w-3.5 text-blue-400"
                  aria-hidden="true"
                />
                <span>{file.name}</span>
              </button>
              {files.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteFile(file.id)}
                  className="rounded p-0.5 text-slate-500 hover:bg-slate-700 hover:text-rose-400"
                  aria-label={`Delete ${file.name}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}

        {newFileMode ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddFile();
            }}
            className="flex shrink-0 items-center gap-1"
          >
            <input
              type="text"
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="app.py"
              className="w-24 rounded-md border border-blue-400 bg-slate-800 px-2 py-1 font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setNewFileMode(false);
                setNewFileName("");
              }}
              className="rounded-md px-1.5 py-1 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setNewFileMode(true)}
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-dashed border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 transition-colors hover:border-blue-400 hover:text-white"
          >
            <FolderPlus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>+ New File</span>
          </button>
        )}
      </div>

      {/* 3. Mobile/Tablet Clean Segmented Switch: Editor vs Output */}
      <div className="grid shrink-0 grid-cols-2 border-b border-slate-800 bg-slate-900 lg:hidden">
        <button
          type="button"
          onClick={() => setActivePane("editor")}
          className={`flex h-10 items-center justify-center gap-1.5 border-b-2 text-xs font-bold transition-colors ${
            activePane === "editor"
              ? "border-blue-500 bg-slate-950 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {language === "english" ? "Code (Editor)" : "कोड (Editor)"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActivePane("output")}
          className={`flex h-10 items-center justify-center gap-1.5 border-b-2 text-xs font-bold transition-colors ${
            activePane === "output"
              ? "border-emerald-500 bg-[#0B1120] text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          {isHtmlMode ? (
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>
            {language === "english"
              ? "Output / Preview"
              : "आउटपुट / प्रीव्यू (Output)"}
          </span>
          {exitCode !== null && (
            <span
              className={`font-mono text-[10px] tabular-nums ${
                exitCode === 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              · {exitCode === 0 ? "OK" : `Err ${exitCode}`}
            </span>
          )}
        </button>
      </div>

      {/* 4. Mobile-Safe Keyword Autocomplete Bar (Directly Above Editor, Never Hidden by Keyboard) */}
      {autocompleteItems.length > 0 && (
        <div
          className={`${
            activePane === "editor" ? "flex" : "hidden lg:flex"
          } shrink-0 items-center gap-1.5 overflow-x-auto border-b border-slate-800 bg-slate-900 px-3 py-1.5`}
        >
          <span className="shrink-0 text-[10px] font-semibold text-slate-400">
            Autocomplete:
          </span>
          {autocompleteItems.map((item) => (
            <button
              key={item}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleInsertAutocomplete(item);
              }}
              className="shrink-0 whitespace-nowrap rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-xs text-blue-300 hover:border-blue-400 hover:bg-slate-700"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* 5. Main Workspace: 100% Remaining Screen Height */}
      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-2">
        {/* Code Editor Pane */}
        <div
          className={`${
            activePane === "editor" ? "flex" : "hidden lg:flex"
          } min-h-0 flex-1 overflow-hidden bg-slate-950 lg:border-r lg:border-slate-800`}
        >
          <div
            ref={gutterRef}
            aria-hidden="true"
            className="h-full select-none overflow-hidden border-r border-slate-800 bg-slate-950 px-2.5 py-3 text-right font-mono text-[13px] leading-[1.6] text-slate-600 tabular-nums"
          >
            {Array.from({ length: Math.max(lineCount, 24) }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={activeFile?.content || ""}
            wrap="off"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            onScroll={(e) => {
              if (gutterRef.current) {
                gutterRef.current.scrollTop = e.currentTarget.scrollTop;
              }
            }}
            onFocus={(e) => {
              e.currentTarget.scrollIntoView({ block: "nearest" });
              updateCurrentPrefix(e.currentTarget);
            }}
            onClick={(e) => updateCurrentPrefix(e.currentTarget)}
            onKeyUp={(e) => {
              e.currentTarget.scrollIntoView({ block: "nearest" });
              updateCurrentPrefix(e.currentTarget);
            }}
            onChange={(e) => {
              const val = e.target.value;
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === activeFile?.id ? { ...f, content: val } : f
                )
              );
              updateCurrentPrefix(e.currentTarget);
            }}
            aria-label={`Code editor for ${activeFile?.name || "file"}`}
            className="h-full w-full flex-1 resize-none overflow-auto whitespace-pre bg-slate-950 p-3 font-mono text-[13px] leading-[1.6] text-slate-100 placeholder:text-slate-600 focus:outline-none"
          />
        </div>

        {/* Output / Live Preview Pane */}
        <div
          className={`${
            activePane === "output" ? "flex" : "hidden lg:flex"
          } min-h-0 flex-1 flex-col overflow-hidden bg-[#0B1120]`}
        >
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              {isHtmlMode ? (
                <>
                  <Eye className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
                  <span>
                    {language === "english"
                      ? "Live Browser Preview & Console"
                      : "लाइव ब्राउज़र प्रीव्यू और कंसोल"}
                  </span>
                </>
              ) : (
                <>
                  <Terminal
                    className="h-3.5 w-3.5 text-emerald-400"
                    aria-hidden="true"
                  />
                  <span>
                    {language === "english"
                      ? "Terminal Output"
                      : "टर्मिनल आउटपुट (Terminal)"}
                  </span>
                </>
              )}
              {exitCode !== null && (
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    exitCode === 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  · Exit {exitCode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isHtmlMode && (
                <button
                  type="button"
                  onClick={() => setShowStdin((prev) => !prev)}
                  className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
                >
                  {showStdin ? "Hide Input" : "+ Input (stdin)"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setStdout("");
                  setStderr("");
                  setExitCode(null);
                  setPreviewSrcDoc(null);
                }}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                title="Clear output"
                aria-label="Clear output"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {showStdin && !isHtmlMode && (
            <div className="shrink-0 border-b border-slate-800 bg-slate-900/90 px-3 py-2">
              <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                Standard Input (stdin — line by line for input()/Scanner/cin):
              </label>
              <textarea
                rows={2}
                value={stdinText}
                onChange={(e) => setStdinText(e.target.value)}
                placeholder="e.g. 25"
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Live HTML Preview Iframe (Hidden frame when running standalone JS) */}
          {previewSrcDoc && isHtmlMode && (
            <iframe
              title="SuJu Web Live Preview"
              sandbox="allow-scripts"
              srcDoc={previewSrcDoc}
              className="h-[55%] min-h-[200px] w-full shrink-0 border-b border-slate-800 bg-white"
            />
          )}
          {previewSrcDoc && !isHtmlMode && (
            <iframe
              title="SuJu JS Sandbox Runner"
              sandbox="allow-scripts"
              srcDoc={previewSrcDoc}
              className="hidden"
            />
          )}

          {/* Terminal Text Output */}
          <div className="min-h-0 flex-1 overflow-auto p-3.5 font-mono text-xs leading-relaxed text-slate-100">
            {isRunning ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                <span>
                  {language === "english"
                    ? "Executing your code..."
                    : "आपका कोड चल रहा है..."}
                </span>
              </div>
            ) : !stdout && !stderr && !previewSrcDoc ? (
              <p className="text-slate-500">
                {language === "english"
                  ? 'Click "Run Code" at the top to execute your program and see live output here.'
                  : 'कोड चलाने और आउटपुट देखने के लिए ऊपर "Run Code" बटन दबाएँ।'}
              </p>
            ) : (
              <>
                {stdout && (
                  <pre className="whitespace-pre-wrap text-emerald-300">
                    {stdout}
                  </pre>
                )}
                {stderr && (
                  <pre className="mt-1 whitespace-pre-wrap text-rose-400">
                    {stderr}
                  </pre>
                )}
                {!stdout && !stderr && isHtmlMode && (
                  <p className="text-slate-400">
                    Rendered live in the browser preview above.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
