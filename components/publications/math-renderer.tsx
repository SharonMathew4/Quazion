import React from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * High-performance scientific markdown and LaTeX formula renderer for QUAZION.
 * Supports inline math ($...$), display block math ($$...$$), headings, tables,
 * lists, blockquotes, and code blocks with zero hydration mismatches.
 */
export function MathRenderer({ content, className = "" }: MathRendererProps) {
  if (!content) return null;

  // Split content into blocks by double newlines or display math delimiters
  const blocks = parseContentToBlocks(content);

  return (
    <div className={`scientific-prose space-y-5 text-slate-200 leading-relaxed font-sans ${className}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "math-block":
            return (
              <div
                key={index}
                className="my-6 p-4 sm:p-6 rounded-2xl bg-[#090d15] border border-slate-800 text-center font-mono overflow-x-auto shadow-xl"
                dangerouslySetInnerHTML={{
                  __html: renderKaTeX(block.content, true),
                }}
              />
            );

          case "heading-1":
            return (
              <h1
                key={index}
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 border-b border-slate-800 pb-3 tracking-tight mt-10 first:mt-0"
              >
                {renderInlineFormatting(block.content)}
              </h1>
            );

          case "heading-2":
            return (
              <h2
                key={index}
                className="text-xl sm:text-2xl font-bold text-slate-100 border-b border-slate-800/80 pb-2 tracking-tight mt-8 first:mt-0"
              >
                {renderInlineFormatting(block.content)}
              </h2>
            );

          case "heading-3":
            return (
              <h3
                key={index}
                className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight mt-6 first:mt-0"
              >
                {renderInlineFormatting(block.content)}
              </h3>
            );

          case "heading-4":
            return (
              <h4
                key={index}
                className="text-base sm:text-lg font-semibold text-slate-200 tracking-tight mt-4 first:mt-0"
              >
                {renderInlineFormatting(block.content)}
              </h4>
            );

          case "blockquote":
            return (
              <blockquote
                key={index}
                className="border-l-4 border-sky-400 pl-4 py-1.5 my-4 bg-sky-950/20 rounded-r-xl italic text-slate-300 text-sm sm:text-base leading-relaxed"
              >
                {renderInlineFormatting(block.content)}
              </blockquote>
            );

          case "code-block":
            return (
              <pre
                key={index}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed shadow-lg my-4"
              >
                <code>{block.content}</code>
              </pre>
            );

          case "unordered-list":
            return (
              <ul key={index} className="list-disc list-inside space-y-1.5 my-3 text-slate-300 text-sm sm:text-base">
                {block.items?.map((item, idx) => (
                  <li key={idx}>{renderInlineFormatting(item)}</li>
                ))}
              </ul>
            );

          case "ordered-list":
            return (
              <ol key={index} className="list-decimal list-inside space-y-1.5 my-3 text-slate-300 text-sm sm:text-base">
                {block.items?.map((item, idx) => (
                  <li key={idx}>{renderInlineFormatting(item)}</li>
                ))}
              </ol>
            );

          case "table":
            return (
              <div key={index} className="overflow-x-auto my-6 rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs sm:text-sm font-sans border-collapse">
                  {block.tableRows && (
                    <>
                      {block.tableRows.length > 0 && (
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800">
                            {block.tableRows[0].map((th, cellIdx) => (
                              <th key={cellIdx} className="p-3 font-mono font-semibold text-sky-400">
                                {renderInlineFormatting(th)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                        {block.tableRows.slice(1).map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-slate-900/50 transition-colors">
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="p-3 text-slate-300">
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
              <p key={index} className="text-slate-300 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                {renderInlineFormatting(block.content)}
              </p>
            );
        }
      })}
    </div>
  );
}

/* ─────────────── Internal Parser Types & Helpers ─────────────── */

interface ParsedBlock {
  type:
    | "paragraph"
    | "heading-1"
    | "heading-2"
    | "heading-3"
    | "heading-4"
    | "math-block"
    | "code-block"
    | "blockquote"
    | "unordered-list"
    | "ordered-list"
    | "table";
  content: string;
  items?: string[];
  tableRows?: string[][];
}

function renderKaTeX(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode,
      throwOnError: false,
      output: "htmlAndMathml",
    });
  } catch {
    return `<span class="katex-error font-mono text-rose-400 text-xs">[LaTeX error: ${escapeHtml(tex)}]</span>`;
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseContentToBlocks(rawText: string): ParsedBlock[] {
  const normalized = rawText.replace(/\r\n/g, "\n");
  const blocks: ParsedBlock[] = [];

  // Match standalone display math blocks: $$ ... $$
  const displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = displayMathRegex.exec(normalized)) !== null) {
    const textBefore = normalized.slice(lastIndex, match.index).trim();
    if (textBefore) {
      blocks.push(...parseStandardMarkdownBlocks(textBefore));
    }
    blocks.push({
      type: "math-block",
      content: match[1],
    });
    lastIndex = match.index + match[0].length;
  }

  const remaining = normalized.slice(lastIndex).trim();
  if (remaining) {
    blocks.push(...parseStandardMarkdownBlocks(remaining));
  }

  return blocks;
}

function parseStandardMarkdownBlocks(chunk: string): ParsedBlock[] {
  const sections = chunk.split(/\n\n+/);
  const result: ParsedBlock[] = [];

  for (const sec of sections) {
    const trimmed = sec.trim();
    if (!trimmed) continue;

    // Code blocks
    if (trimmed.startsWith("```")) {
      const codeLines = trimmed.split("\n");
      const codeContent = codeLines.slice(1, codeLines[codeLines.length - 1].startsWith("```") ? -1 : undefined).join("\n");
      result.push({
        type: "code-block",
        content: codeContent,
      });
      continue;
    }

    // Markdown Table
    if (trimmed.includes("|") && trimmed.split("\n").length >= 2) {
      const lines = trimmed.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("|") || l.includes("|"));
      if (lines.length >= 2 && lines[1].replace(/[\s|:-]/g, "") === "") {
        const rows = lines
          .filter((_, idx) => idx !== 1) // skip separator row (|---|---|)
          .map((row) =>
            row
              .replace(/^\||\|$/g, "")
              .split("|")
              .map((c) => c.trim())
          );
        result.push({
          type: "table",
          content: "",
          tableRows: rows,
        });
        continue;
      }
    }

    // Headings
    if (trimmed.startsWith("#### ")) {
      result.push({ type: "heading-4", content: trimmed.replace(/^####\s+/, "") });
      continue;
    }
    if (trimmed.startsWith("### ")) {
      result.push({ type: "heading-3", content: trimmed.replace(/^###\s+/, "") });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      result.push({ type: "heading-2", content: trimmed.replace(/^##\s+/, "") });
      continue;
    }
    if (trimmed.startsWith("# ")) {
      result.push({ type: "heading-1", content: trimmed.replace(/^#\s+/, "") });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      result.push({
        type: "blockquote",
        content: trimmed.replace(/^>\s*/gm, ""),
      });
      continue;
    }

    // Lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items = trimmed.split("\n").map((l) => l.replace(/^[-*]\s+/, "").trim());
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

  return result;
}

/**
 * Handles inline math ($...$), bold (**...**), italics (*...*), and code (`...`).
 */
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  // Split by inline math: $formula$
  const inlineMathRegex = /\$([^\$\n]+?)\$/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = inlineMathRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore) {
      elements.push(renderBasicInline(textBefore, keyCounter++));
    }

    const mathContent = match[1];
    elements.push(
      <span
        key={keyCounter++}
        className="inline-math px-1 font-mono text-sky-300"
        dangerouslySetInnerHTML={{
          __html: renderKaTeX(mathContent, false),
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
              className="bg-slate-900 border border-slate-800 text-sky-300 px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm"
            >
              {token.slice(1, -1)}
            </code>
          );
        }
        if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
          return (
            <strong key={idx} className="font-bold text-slate-100">
              {token.slice(2, -2)}
            </strong>
          );
        }
        if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
          return (
            <em key={idx} className="italic text-slate-200">
              {token.slice(1, -1)}
            </em>
          );
        }
        return token;
      })}
    </React.Fragment>
  );
}
