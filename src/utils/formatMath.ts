const LATEX_SYMBOL_MAP: Array<[RegExp, string]> = [
  [/\\times/g, "×"],
  [/\\div/g, "÷"],
  [/\\cdot/g, "·"],
  [/\\pm/g, "±"],
  [/\\approx/g, "≈"],
  [/\\neq/g, "≠"],
  [/\\leq/g, "≤"],
  [/\\geq/g, "≥"],
  [/\\le(?![a-zA-Z])/g, "≤"],
  [/\\ge(?![a-zA-Z])/g, "≥"],
  [/\\rightarrow|\\to(?![a-zA-Z])/g, "→"],
  [/\\leftarrow/g, "←"],
  [/\\Rightarrow/g, "⇒"],
  [/\\degree|\^\\circ|\\circ/g, "°"],
  [/\\pi(?![a-zA-Z])/g, "π"],
  [/\\theta(?![a-zA-Z])/g, "θ"],
  [/\\alpha(?![a-zA-Z])/g, "α"],
  [/\\beta(?![a-zA-Z])/g, "β"],
  [/\\gamma(?![a-zA-Z])/g, "γ"],
  [/\\delta(?![a-zA-Z])/g, "Δ"],
  [/\\lambda(?![a-zA-Z])/g, "λ"],
  [/\\mu(?![a-zA-Z])/g, "μ"],
  [/\\sigma(?![a-zA-Z])/g, "σ"],
  [/\\omega(?![a-zA-Z])/g, "ω"],
  [/\\infty/g, "∞"],
  [/\\sqrt\{([^{}]+)\}/g, "√($1)"],
  [/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1/$2)"],
  [/\\text\{([^{}]+)\}/g, "$1"],
  [/\\mathrm\{([^{}]+)\}/g, "$1"],
  [/\\%/g, "%"],
];

function replaceSimpleDollarTokens(segment: string): string {
  // Unwrap trivial numbers, ratios ($3:2$), percentages ($25%$), or plain short tokens wrapped in $...$
  return segment.replace(
    /(?<!\\)\$([^$\n]+?)(?<!\\)\$/g,
    (fullMatch, inner: string) => {
      const trimmed = inner.trim();
      // Match simple numbers, ratios (3:2, 4:5:6), percentages, currency, or plain words without LaTeX commands
      if (
        /^[+-]?\d+(?:[.,]\d+)?(?:\s*[:/]\s*[+-]?\d+(?:[.,]\d+)?)+%?$/.test(
          trimmed
        ) ||
        /^[+-]?\d+(?:[.,]\d+)?%?$/.test(trimmed) ||
        /^[a-zA-Z0-9]+(?:\s*[:=]\s*[a-zA-Z0-9]+)+$/.test(trimmed)
      ) {
        return trimmed;
      }
      // If it contains non-ASCII Devanagari text inside $...$, unwrap to avoid KaTeX failure
      if (/[\u0900-\u097F]/.test(trimmed) && !trimmed.includes("\\")) {
        return trimmed;
      }
      return fullMatch;
    }
  );
}

/**
 * Cleans Markdown before passing to ReactMarkdown + remarkMath + rehypeKatex:
 * - Preserves fenced code blocks & inline code untouched.
 * - Unwraps simple ratios/numbers like `$3:2$` or `$25%$` so raw `$` never leaks.
 * - Ensures genuine inline math `$...$` touching adjacent non-ASCII text has clean spacing for remark-math.
 */
export function cleanDisplayMarkdown(markdown: string): string {
  if (!markdown) return "";

  const parts = markdown.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  return parts
    .map((part, idx) => {
      if (idx % 2 === 1) return part; // Code block or inline code
      let cleaned = replaceSimpleDollarTokens(part);
      // Ensure inline $...$ adjacent to Devanagari or word characters has a space so remark-math parses cleanly
      cleaned = cleaned.replace(
        /([\u0900-\u097Fa-zA-Z0-9])(\$[^$\n]+\$)/g,
        "$1 $2"
      );
      cleaned = cleaned.replace(
        /(\$[^$\n]+\$)([\u0900-\u097Fa-zA-Z0-9])/g,
        "$1 $2"
      );
      return cleaned;
    })
    .join("");
}

/**
 * Cleans plain non-Markdown UI strings (headings, summaries, quiz options, takeaways)
 * so raw `$3:2$`, `$x$`, or simple LaTeX symbols render neatly as human-readable text.
 */
export function cleanInlineText(text: string): string {
  if (!text) return "";
  let out = text
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .trim();
  out = replaceSimpleDollarTokens(out);

  // Convert remaining $...$ inline math expressions in plain text fields into readable Unicode math
  out = out.replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (_m, inner: string) => {
    let readable = inner.trim();
    for (const [pattern, replacement] of LATEX_SYMBOL_MAP) {
      readable = readable.replace(pattern, replacement);
    }
    readable = readable.replace(/\^2\b/g, "²").replace(/\^3\b/g, "³");
    return readable;
  });

  return out;
}
