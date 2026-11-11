import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  content: string;
  className?: string;
}

export interface InlineMathTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4";
}

/**
 * Safely truncates text without splitting an active LaTeX math delimiter ($...$ or $$...$$).
 * If cut lands inside an active math expression, it cleanly ends before the formula
 * (or closes it if near the end) and preserves syntax integrity.
 */
export function truncateMathText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;

  // Find all math ranges: [start, end]
  const mathRanges: Array<{ start: number; end: number }> = [];
  const mathRegex = /\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$/g;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(text)) !== null) {
    mathRanges.push({
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  // Check if maxLength falls inside any math range
  let targetCut = maxLength;
  for (const range of mathRanges) {
    if (targetCut > range.start && targetCut < range.end) {
      // If we are close to the end of the formula (within 15 chars), keep it intact
      if (range.end - targetCut <= 15) {
        targetCut = range.end;
      } else {
        // Otherwise, cut cleanly before the math block starts
        targetCut = range.start;
      }
      break;
    }
  }

  // If cut point lands in the middle of a regular word outside of math, trim back to space
  if (targetCut === maxLength && targetCut < text.length) {
    const lastSpace = text.lastIndexOf(" ", targetCut);
    if (lastSpace > maxLength * 0.8) {
      targetCut = lastSpace;
    }
  }

  const truncated = text.slice(0, targetCut).trim().replace(/[,;:\-\s]+$/, "");
  return `${truncated}...`;
}

/**
 * Lightweight inline math and text formatter for titles, abstracts, cards, and excerpts.
 * Renders LaTeX formulas ($...$ and $$...$$) alongside markdown bold/italics/code,
 * with optional math-safe truncation.
 */
export function InlineMathText({
  text,
  maxLength,
  className = "",
  as: Component = "span",
}: InlineMathTextProps) {
  if (!text) return null;

  const processedText = maxLength ? truncateMathText(text, maxLength) : text;

  return (
    <Component className={className}>
      {renderInlineFormatting(processedText)}
    </Component>
  );
}

/**
 * High-performance scientific markdown and LaTeX formula renderer for QUAZION.
 * Supports inline math ($...$), display block math ($$...$$), headings, tables,
 * lists, blockquotes, and code blocks with print-grade academic clarity.
 */
export function MathRenderer({ content, className = "" }: MathRendererProps) {
  if (!content) return null;

  // Split content into blocks by double newlines or display math delimiters
  const blocks = parseContentToBlocks(content);

  return (
    <div className={`scientific-prose space-y-6 text-slate-800 leading-relaxed font-serif text-base sm:text-lg ${className}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "math-block":
            return (
              <div
                key={index}
                className="my-6 p-4 sm:p-6 rounded-md bg-slate-50 border border-slate-200 text-center font-mono overflow-x-auto text-slate-900 shadow-2xs"
                dangerouslySetInnerHTML={{
                  __html: renderKaTeX(block.content, true),
                }}
              />
            );

          case "heading-1":
            return (
              <h1
                key={index}
                className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 border-b border-slate-200 pb-3 tracking-tight mt-10 first:mt-0"
              >
                {renderInlineFormatting(block.content)}
              </h1>
            );

          case "heading-2":
            return (
              <h2
                key={index}
                className="font-serif text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2 tracking-tight mt-8 first:mt-0"
              >
                {renderInlineFormatting(block.content)}
              </h2>
            );

          case "heading-3":
            return (
              <h3
                key={index}
                className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-6 first:mt-0"
              >
                {renderInlineFormatting(block.content)}
              </h3>
            );

          case "heading-4":
            return (
              <h4
                key={index}
                className="font-sans text-base font-bold text-slate-800 tracking-tight mt-4 first:mt-0"
              >
                {renderInlineFormatting(block.content)}
              </h4>
            );

          case "blockquote":
            return (
              <blockquote
                key={index}
                className="border-l-3 border-rose-700 pl-4 py-2 my-4 bg-rose-50/50 rounded-r-md italic text-slate-700 text-base leading-relaxed"
              >
                {renderInlineFormatting(block.content)}
              </blockquote>
            );

          case "code-block":
            return (
              <pre
                key={index}
                className="p-4 rounded-md bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-slate-100 overflow-x-auto leading-relaxed shadow-xs my-4"
              >
                <code>{block.content}</code>
              </pre>
            );

          case "unordered-list":
            return (
              <ul key={index} className="list-disc list-inside space-y-1.5 my-3 text-slate-700 text-base leading-relaxed">
                {block.items?.map((item, idx) => (
                  <li key={idx}>{renderInlineFormatting(item)}</li>
                ))}
              </ul>
            );

          case "ordered-list":
            return (
              <ol key={index} className="list-decimal list-inside space-y-1.5 my-3 text-slate-700 text-base leading-relaxed">
                {block.items?.map((item, idx) => (
                  <li key={idx}>{renderInlineFormatting(item)}</li>
                ))}
              </ol>
            );

          case "table":
            return (
              <div key={index} className="overflow-x-auto my-6 rounded-md border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm font-sans border-collapse">
                  {block.tableRows && (
                    <>
                      {block.tableRows.length > 0 && (
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200">
                            {block.tableRows[0].map((th, cellIdx) => (
                              <th key={cellIdx} className="p-3 font-semibold text-slate-900">
                                {renderInlineFormatting(th)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {block.tableRows.slice(1).map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="p-3 text-slate-700">
                                {renderInlineFormatting(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            );

          case "paragraph":
          default:
            return (
              <p key={index} className="text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line font-serif">
                {renderInlineFormatting(block.content)}
              </p>
            );
        }
      })}
    </div>
  );
}

/**
 * KaTeX formula compiler with graceful plain-text fallback.
 */
function cleanMathFallback(tex: string): string {
  return tex
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function renderKaTeX(tex: string, displayMode: boolean): string {
  try {
    const html = katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: false,
    });
    if (html.includes("katex-error")) {
      return `<span class="inline-math-clean font-serif italic">${escapeHtml(cleanMathFallback(tex))}</span>`;
    }
    return html;
  } catch {
    return `<span class="inline-math-clean font-serif italic">${escapeHtml(cleanMathFallback(tex))}</span>`;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface ContentBlock {
  type:
    | "heading-1"
    | "heading-2"
    | "heading-3"
    | "heading-4"
    | "math-block"
    | "code-block"
    | "blockquote"
    | "unordered-list"
    | "ordered-list"
    | "table"
    | "paragraph";
  content: string;
  items?: string[];
  tableRows?: string[][];
}

/**
 * Robust markdown block segmenter handling display math and structural elements.
 */
function parseContentToBlocks(raw: string): ContentBlock[] {
  const result: ContentBlock[] = [];
  const normalized = raw.replace(/\r\n/g, "\n");

  // Step 1: Extract display math blocks ($$...$$)
  const segments: Array<{ text: string; isMath: boolean }> = [];
  const mathRegex = /\$\$([\s\S]*?)\$\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: normalized.slice(lastIndex, match.index),
        isMath: false,
      });
    }
    segments.push({
      text: match[1].trim(),
      isMath: true,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < normalized.length) {
    segments.push({
      text: normalized.slice(lastIndex),
      isMath: false,
    });
  }

  for (const seg of segments) {
    if (seg.isMath) {
      result.push({
        type: "math-block",
        content: seg.text,
      });
    } else {
      parseTextBlocks(seg.text, result);
    }
  }

  return result;
}

function parseTextBlocks(text: string, result: ContentBlock[]): void {
  const rawParagraphs = text.split(/\n\s*\n/);

  for (const p of rawParagraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    // Code blocks (```...```)
    if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
      const lines = trimmed.split("\n");
      const code = lines.slice(1, -1).join("\n");
      result.push({
        type: "code-block",
        content: code,
      });
      continue;
    }

    // Headings
    if (trimmed.startsWith("#### ")) {
      result.push({
        type: "heading-4",
        content: trimmed.slice(5).trim(),
      });
      continue;
    }
    if (trimmed.startsWith("### ")) {
      result.push({
        type: "heading-3",
        content: trimmed.slice(4).trim(),
      });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      result.push({
        type: "heading-2",
        content: trimmed.slice(3).trim(),
      });
      continue;
    }
    if (trimmed.startsWith("# ")) {
      result.push({
        type: "heading-1",
        content: trimmed.slice(2).trim(),
      });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      const quote = trimmed
        .split("\n")
        .map((l) => l.replace(/^>\s?/, ""))
        .join(" ");
      result.push({
        type: "blockquote",
        content: quote,
      });
      continue;
    }

    // Markdown Table Detection
    if (trimmed.includes("|") && trimmed.split("\n").length >= 2) {
      const lines = trimmed.split("\n").filter((l) => l.includes("|"));
      const isTable = lines.some((l) => /\|?\s*[-:]+[-| :]*\|?/.test(l));
      if (isTable) {
        const tableRows = lines
          .filter((l) => !/\|?\s*[-:]+[-| :]*\|?/.test(l))
          .map((row) =>
            row
              .split("|")
              .map((c) => c.trim())
              .filter((c, idx, arr) => (idx === 0 && c === "" ? false : idx === arr.length - 1 && c === "" ? false : true))
          );

        result.push({
          type: "table",
          content: trimmed,
          tableRows,
        });
        continue;
      }
    }

    // Lists
    if (/^[-*+]\s/.test(trimmed)) {
      const items = trimmed.split("\n").map((l) => l.replace(/^[-*+]\s+/, "").trim());
      result.push({
        type: "unordered-list",
        content: "",
        items,
      });
      continue;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split("\n").map((l) => l.replace(/^\d+\.\s+/, "").trim());
      result.push({
        type: "ordered-list",
        content: "",
        items,
      });
      continue;
    }

    // Paragraph
    result.push({
      type: "paragraph",
      content: trimmed,
    });
  }
}

/**
 * Handles inline math ($...$ or $$...$$), bold (**...**), italics (*...*), and code (`...`).
 */
export function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  // Split by display math ($$...$$) or inline math ($...$)
  const mathRegex = /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = mathRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore) {
      elements.push(renderBasicInline(textBefore, keyCounter++));
    }

    const isDisplay = Boolean(match[1]);
    const mathContent = match[1] || match[2];

    elements.push(
      <span
        key={keyCounter++}
        className={isDisplay ? "block my-2 text-center" : "inline-math px-0.5 text-slate-900"}
        dangerouslySetInnerHTML={{
          __html: renderKaTeX(mathContent, isDisplay),
        }}
      />
    );
    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex);
  if (remaining) {
    elements.push(renderBasicInline(remaining, keyCounter++));
  }

  return <>{elements}</>;
}

function renderBasicInline(text: string, baseKey: number): React.ReactNode {
  // Bold: **text**
  // Inline Code: `code`
  // Italic: *text*
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return (
    <React.Fragment key={baseKey}>
      {tokens.map((token, idx) => {
        if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
          return (
            <code
              key={idx}
              className="bg-slate-100 border border-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm"
            >
              {token.slice(1, -1)}
            </code>
          );
        }
        if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
          return (
            <strong key={idx} className="font-bold text-slate-900">
              {token.slice(2, -2)}
            </strong>
          );
        }
        if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
          return (
            <em key={idx} className="italic text-slate-800">
              {token.slice(1, -1)}
            </em>
          );
        }
        return token;
      })}
    </React.Fragment>
  );
}
