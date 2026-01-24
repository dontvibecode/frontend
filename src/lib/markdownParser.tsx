import React from 'react';

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

/**
 * Parses inline markdown syntax (bold, italic, strikethrough, code, links)
 */
function parseInlineMarkdown(text: string, keyPrefix: string = ''): ParsedElement[] {
  const elements: ParsedElement[] = [];
  let remaining = text;
  let keyIndex = 0;

  const patterns: Array<{
    regex: RegExp;
    render: (match: RegExpMatchArray, key: string) => React.ReactElement;
  }> = [
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
        <del key={key} className="line-through text-gray-500">
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
          className="bg-gray-100 text-rose-600 px-1.5 py-0.5 rounded text-sm font-mono"
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
          className="text-blue-600 hover:text-blue-800 underline"
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
 * Parses a full markdown string and returns React elements
 */
export function parseMarkdown(markdown: string, compact: boolean = false): React.ReactElement {
  if (!markdown) return <></>;

  const lines = markdown.split('\n');
  const elements: React.ReactElement[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactElement[] } | null = null;
  let codeBlock: { language: string; lines: string[]; startIndex: number } | null = null;
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
          className={`bg-gray-100 border border-gray-200 rounded-lg p-3 overflow-x-auto ${compact ? '' : 'my-3'}`}
        >
          <code className="text-sm font-mono text-black whitespace-pre">{code}</code>
        </pre>
      );
      codeBlock = null;
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    lineIndex++;

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
          { key: `heading-${lineIndex}`, className: headingClasses[level] },
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
      currentList.items.push(<li key={`li-${lineIndex}`}>{content}</li>);
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
      currentList.items.push(<li key={`li-${lineIndex}`}>{content}</li>);
      continue;
    }

    // Regular paragraph
    flushList();
    const content = parseInlineMarkdown(trimmedLine, `p-${lineIndex}`);
    elements.push(
      <p key={`p-${lineIndex}`} className={compact ? '' : 'my-2'}>
        {content}
      </p>
    );
  }

  // Flush any remaining list or code block
  flushList();
  flushCodeBlock();

  return <div className="markdown-content">{elements}</div>;
}

/**
 * A React component wrapper for parsing markdown
 */
export function Markdown({ children, compact = false }: { children: string; compact?: boolean }) {
  return parseMarkdown(children, compact);
}

export default parseMarkdown;

