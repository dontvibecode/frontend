import React from 'react';
import katex from 'katex';

/**
 * Markdown Parser Utility
 *
 * Supported Markdown Syntax:
 * ==========================
 *
 * **Bold Text**
 *   - Syntax: **text** or __text__
 *   - Example: **important** → <strong>important</strong>
 *
 * *Italic Text*
 *   - Syntax: *text* or _text_
 *   - Example: *emphasis* → <em>emphasis</em>
 *
 * ~~Strikethrough~~
 *   - Syntax: ~~text~~
 *   - Example: ~~deleted~~ → <del>deleted</del>
 *
 * `Inline Code`
 *   - Syntax: `code`
 *   - Example: `const x = 1` → <code>const x = 1</code>
 *
 * [Links](url)
 *   - Syntax: [text](url)
 *   - Example: [Google](https://google.com) → <a href="...">Google</a>
 *
 * $Math$
 *   - Syntax: $tex$ or \(tex\) inline; $$tex$$ or \[tex\] for display math,
 *     either on one line or with the delimiters on their own lines
 *   - Example: $d_k$ → d with subscript k, rendered by KaTeX
 *   - A $ followed by a space, or a closing $ after a space or before a
 *     digit, stays text, so prices like $5 are not read as math
 *
 * ### Headings
 *   - Syntax: # H1, ## H2, ### H3 (at start of line)
 *   - Example: ### Section Title → <h3>Section Title</h3>
 *
 * - Bullet Points
 *   - Syntax: - item or * item (at start of line)
 *   - Example: - First item → <li>First item</li>
 *
 * 1. Numbered Lists
 *   - Syntax: 1. item, 2. item (at start of line)
 *   - Example: 1. First → <li>First</li> (in <ol>)
 *
 * > Blockquotes
 *   - Syntax: > text (at start of line)
 *   - Example: > Quote → <blockquote>Quote</blockquote>
 *
 * --- Horizontal Rule
 *   - Syntax: --- or *** or ___ (alone on line)
 *   - Example: --- → <hr />
 *
 * ```language
 * Code Block
 * ```
 *   - Syntax: ```language ... ``` (language optional)
 *   - Example: ```python\nprint("hi")\n``` → <pre><code>print("hi")</code></pre>
 */

type ParsedElement = string | React.ReactElement;

const DISPLAY_MATH_DELIMITERS: Array<[open: string, close: string]> = [
  ['$$', '$$'],
  ['\\[', '\\]'],
];

/**
 * Renders TeX to HTML. KaTeX escapes text and, without its `trust` option,
 * rejects commands that emit links or raw HTML, so the output is safe to
 * inject. Invalid TeX (e.g. half-streamed) renders as its source in red.
 */
function renderMath(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, { displayMode, throwOnError: false });
}

/**
 * Whether a line starts display math. `complete` means the whole equation is
 * on the line; otherwise a block opens and runs until a line ending in
 * `close`. An equation followed by more text is left to the inline parser.
 * backend/chatbot/services/speech_text.py mirrors this in `_display_math`.
 */
function matchDisplayMath(line: string): { tex: string; close: string; complete: boolean } | null {
  for (const [open, close] of DISPLAY_MATH_DELIMITERS) {
    if (!line.startsWith(open)) continue;
    const rest = line.slice(open.length);
    const closeIndex = rest.indexOf(close);
    if (closeIndex === -1) return { tex: rest, close, complete: false };
    if (closeIndex === rest.length - close.length) {
      return { tex: rest.slice(0, closeIndex), close, complete: true };
    }
    return null;
  }
  return null;
}

/**
 * Parses inline markdown syntax (math, bold, italic, strikethrough, code, links)
 */
function parseInlineMarkdown(text: string, keyPrefix: string = ''): ParsedElement[] {
  const elements: ParsedElement[] = [];
  let remaining = text;
  let keyIndex = 0;

  // Math comes first so that, when patterns start at the same index, the
  // underscores and asterisks inside TeX are not taken for emphasis.
  const patterns: Array<{
    regex: RegExp;
    render: (match: RegExpMatchArray, key: string) => React.ReactElement;
  }> = [
    // Display math within a line: $$tex$$ or \[tex\]. Math never spans a
    // backtick, so a stray $ can't swallow the start of inline code.
    {
      regex: /\$\$([^`]+?)\$\$|\\\[(.+?)\\\]/,
      render: (match, key) => (
        <span
          key={key}
          className="block overflow-x-auto overflow-y-hidden"
          dangerouslySetInnerHTML={{ __html: renderMath(match[1] || match[2], true) }}
        />
      ),
    },
    // Inline math: $tex$ or \(tex\)
    {
      regex: /\$(?![\s$])((?:\\\$|[^$\n`])+?)(?<![\s\\])\$(?!\d)|\\\((.+?)\\\)/,
      render: (match, key) => (
        <span
          key={key}
          dangerouslySetInnerHTML={{ __html: renderMath(match[1] || match[2], false) }}
        />
      ),
    },
    // Bold: **text** or __text__
    {
      regex: /\*\*(.+?)\*\*|__(.+?)__/,
      render: (match, key) => (
        <strong key={key} className="font-semibold">
          {match[1] || match[2]}
        </strong>
      ),
    },
    // Italic: *text* or _text_
    {
      regex: /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/,
      render: (match, key) => (
        <em key={key} className="italic">
          {match[1] || match[2]}
        </em>
      ),
    },
    // Strikethrough: ~~text~~
    {
      regex: /~~(.+?)~~/,
      render: (match, key) => (
        <del key={key} className="line-through text-text-70">
          {match[1]}
        </del>
      ),
    },
    // Inline code: `code`
    {
      regex: /`([^`]+)`/,
      render: (match, key) => (
        <code
          key={key}
          className="bg-base-10 text-rose-600 px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {match[1]}
        </code>
      ),
    },
    // Links: [text](url)
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (match, key) => (
        <a
          key={key}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-text hover:text-primary-text-hover underline"
        >
          {match[1]}
        </a>
      ),
    },
  ];

  while (remaining.length > 0) {
    let earliestMatch: { index: number; match: RegExpMatchArray; pattern: typeof patterns[0] } | null = null;

    // Find the earliest matching pattern
    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index !== undefined) {
        if (!earliestMatch || match.index < earliestMatch.index) {
          earliestMatch = { index: match.index, match, pattern };
        }
      }
    }

    if (earliestMatch) {
      // Add text before the match
      if (earliestMatch.index > 0) {
        elements.push(remaining.slice(0, earliestMatch.index));
      }

      // Add the rendered element
      const key = `${keyPrefix}-${keyIndex++}`;
      elements.push(earliestMatch.pattern.render(earliestMatch.match, key));

      // Continue with remaining text
      remaining = remaining.slice(earliestMatch.index + earliestMatch.match[0].length);
    } else {
      // No more matches, add remaining text
      elements.push(remaining);
      break;
    }
  }

  return elements;
}

/**
 * Parses a full markdown string and returns React elements.
 *
 * Every block carries data-speech-line: its 1-based source line (a code block
 * or display math block uses its opening line). Narration highlights the line
 * being read by that number, and backend/chatbot/services/speech_text.py
 * numbers lines the same way, so a change to how lines are walked here must be
 * made there too.
 */
export function parseMarkdown(markdown: string, compact: boolean = false): React.ReactElement {
  if (!markdown) return <></>;

  const lines = markdown.split('\n');
  const elements: React.ReactElement[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactElement[] } | null = null;
  let codeBlock: { language: string; lines: string[]; startIndex: number } | null = null;
  let mathBlock: { close: string; lines: string[]; startIndex: number } | null = null;
  let lineIndex = 0;

  const flushList = () => {
    if (currentList) {
      const ListTag = currentList.type;
      const baseClass = currentList.type === 'ul' ? 'list-disc list-inside space-y-1' : 'list-decimal list-inside space-y-1';
      elements.push(
        <ListTag
          key={`list-${lineIndex}`}
          className={compact ? baseClass : `${baseClass} my-2`}
        >
          {currentList.items}
        </ListTag>
      );
      currentList = null;
    }
  };

  const flushCodeBlock = () => {
    if (codeBlock) {
      const code = codeBlock.lines.join('\n');
      elements.push(
        <pre
          key={`code-${codeBlock.startIndex}`}
          data-speech-line={codeBlock.startIndex}
          className={`bg-base-10 border border-base-10 rounded-lg p-3 overflow-x-auto ${compact ? '' : 'my-3'}`}
        >
          <code className="text-sm font-mono text-primary-text whitespace-pre">{code}</code>
        </pre>
      );
      codeBlock = null;
    }
  };

  const pushDisplayMath = (tex: string, startIndex: number) => {
    elements.push(
      <div
        key={`math-${startIndex}`}
        data-speech-line={startIndex}
        className={`overflow-x-auto overflow-y-hidden ${compact ? '' : 'my-3'}`}
        dangerouslySetInnerHTML={{ __html: renderMath(tex, true) }}
      />
    );
  };

  const flushMathBlock = () => {
    if (mathBlock) {
      pushDisplayMath(mathBlock.lines.join('\n'), mathBlock.startIndex);
      mathBlock = null;
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    lineIndex++;

    // If inside a display math block, collect lines until the closing delimiter
    if (mathBlock) {
      if (trimmedLine.endsWith(mathBlock.close)) {
        mathBlock.lines.push(trimmedLine.slice(0, -mathBlock.close.length));
        flushMathBlock();
      } else {
        mathBlock.lines.push(line);
      }
      continue;
    }

    // Check for code block start/end
    if (trimmedLine.startsWith('```')) {
      if (codeBlock) {
        // End of code block
        flushCodeBlock();
      } else {
        // Start of code block
        flushList();
        const language = trimmedLine.slice(3).trim();
        codeBlock = { language, lines: [], startIndex: lineIndex };
      }
      continue;
    }

    // If inside code block, collect lines (preserve original indentation)
    if (codeBlock) {
      codeBlock.lines.push(line);
      continue;
    }

    // Empty line
    if (trimmedLine === '') {
      flushList();
      continue;
    }

    // Horizontal rule: ---, ***, ___
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmedLine)) {
      flushList();
      elements.push(<hr key={`hr-${lineIndex}`} className={`border-gray-200 ${compact ? '' : 'my-4'}`} />);
      continue;
    }

    // Display math: $$tex$$ on one line, or a $$ ... $$ block
    const displayMath = matchDisplayMath(trimmedLine);
    if (displayMath) {
      flushList();
      if (displayMath.complete) {
        pushDisplayMath(displayMath.tex, lineIndex);
      } else {
        mathBlock = { close: displayMath.close, lines: [displayMath.tex], startIndex: lineIndex };
      }
      continue;
    }

    // Headings: #, ##, ###
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const content = parseInlineMarkdown(headingMatch[2], `h-${lineIndex}`);
      const headingClasses: Record<number, string> = {
        1: 'text-2xl font-bold mt-4 mb-2',
        2: 'text-xl font-bold mt-3 mb-2',
        3: 'text-lg font-semibold mt-3 mb-1',
        4: 'text-base font-semibold mt-2 mb-1',
        5: 'text-sm font-semibold mt-2 mb-1',
        6: 'text-sm font-medium mt-2 mb-1',
      };
      const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      elements.push(
        React.createElement(
          HeadingTag,
          { key: `heading-${lineIndex}`, className: headingClasses[level], "data-speech-line": lineIndex },
          content
        )
      );
      continue;
    }

    // Blockquote: >
    const blockquoteMatch = trimmedLine.match(/^>\s*(.*)$/);
    if (blockquoteMatch) {
      flushList();
      const content = parseInlineMarkdown(blockquoteMatch[1], `bq-${lineIndex}`);
      elements.push(
        <blockquote
          key={`blockquote-${lineIndex}`}
          data-speech-line={lineIndex}
          className={`border-l-4 border-gray-300 pl-4 py-1 text-gray-600 italic ${compact ? '' : 'my-2'}`}
        >
          {content}
        </blockquote>
      );
      continue;
    }

    // Unordered list: - or *
    const ulMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      const content = parseInlineMarkdown(ulMatch[1], `ul-${lineIndex}`);
      currentList.items.push(<li key={`li-${lineIndex}`} data-speech-line={lineIndex}>{content}</li>);
      continue;
    }

    // Ordered list: 1. 2. etc
    const olMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      const content = parseInlineMarkdown(olMatch[1], `ol-${lineIndex}`);
      currentList.items.push(<li key={`li-${lineIndex}`} data-speech-line={lineIndex}>{content}</li>);
      continue;
    }

    // Regular paragraph
    flushList();
    const content = parseInlineMarkdown(trimmedLine, `p-${lineIndex}`);
    elements.push(
      <p key={`p-${lineIndex}`} data-speech-line={lineIndex} className={compact ? '' : 'my-2'}>
        {content}
      </p>
    );
  }

  // Flush any remaining list, code block or math block
  flushList();
  flushCodeBlock();
  flushMathBlock();

  return <div className="markdown-content">{elements}</div>;
}

/**
 * A React component wrapper for parsing markdown
 */
export function Markdown({ children, compact = false }: { children: string; compact?: boolean }) {
  return parseMarkdown(children, compact);
}

export default parseMarkdown;

