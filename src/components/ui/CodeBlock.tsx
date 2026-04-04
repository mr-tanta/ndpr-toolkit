'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: 'typescript' | 'tsx' | 'bash' | 'json';
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

type TokenType =
  | 'keyword'
  | 'string'
  | 'comment'
  | 'type'
  | 'function'
  | 'bracket'
  | 'number'
  | 'plain';

interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'interface',
  'type',
  'extends',
  'implements',
  'class',
  'new',
  'this',
  'async',
  'await',
  'default',
  'try',
  'catch',
  'throw',
  'finally',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'typeof',
  'instanceof',
  'in',
  'of',
  'as',
  'true',
  'false',
  'null',
  'undefined',
  'void',
  'enum',
  'readonly',
  'private',
  'public',
  'protected',
  'static',
  'abstract',
  'declare',
  'module',
  'require',
]);

const BRACKET_CHARS = new Set([
  '{',
  '}',
  '(',
  ')',
  '[',
  ']',
  '<',
  '>',
  ';',
  ':',
  ',',
  '.',
  '=',
  '!',
  '&',
  '|',
  '?',
  '+',
  '-',
  '*',
  '/',
  '%',
  '^',
  '~',
]);

function tokenize(code: string, language: string): Token[] {
  if (language === 'bash') {
    return tokenizeBash(code);
  }
  if (language === 'json') {
    return tokenizeJson(code);
  }
  return tokenizeTs(code);
}

function tokenizeBash(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Comments
    if (code[i] === '#') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Strings
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Words
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_\-]/.test(code[j])) j++;
      const word = code.slice(i, j);
      const bashKeywords = new Set([
        'if',
        'then',
        'else',
        'fi',
        'for',
        'do',
        'done',
        'while',
        'case',
        'esac',
        'echo',
        'export',
        'source',
        'sudo',
        'cd',
        'ls',
        'mkdir',
        'rm',
        'cp',
        'mv',
        'cat',
        'grep',
        'awk',
        'sed',
        'curl',
        'wget',
        'npm',
        'npx',
        'pnpm',
        'bun',
        'yarn',
        'git',
        'docker',
        'pip',
        'install',
        'run',
        'build',
        'start',
        'dev',
        'add',
      ]);
      if (bashKeywords.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      i = j;
      continue;
    }

    // Flags
    if (code[i] === '-' && i + 1 < code.length && /[a-zA-Z]/.test(code[i + 1])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9\-]/.test(code[j])) j++;
      tokens.push({ type: 'function', value: code.slice(i, j) });
      i = j;
      continue;
    }

    tokens.push({ type: 'plain', value: code[i] });
    i++;
  }

  return tokens;
}

function tokenizeJson(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Strings (keys and values)
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') {
        if (code[j] === '\\') j++;
        j++;
      }
      const str = code.slice(i, j + 1);
      // Check if this is a key (followed by colon)
      let afterStr = j + 1;
      while (afterStr < code.length && /\s/.test(code[afterStr])) afterStr++;
      if (code[afterStr] === ':') {
        tokens.push({ type: 'function', value: str });
      } else {
        tokens.push({ type: 'string', value: str });
      }
      i = j + 1;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(code[i]) || (code[i] === '-' && i + 1 < code.length && /[0-9]/.test(code[i + 1]))) {
      let j = i;
      if (code[j] === '-') j++;
      while (j < code.length && /[0-9.eE\-+]/.test(code[j])) j++;
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // true, false, null
    const remaining = code.slice(i);
    const boolMatch = remaining.match(/^(true|false|null)\b/);
    if (boolMatch) {
      tokens.push({ type: 'keyword', value: boolMatch[1] });
      i += boolMatch[1].length;
      continue;
    }

    // Brackets
    if (BRACKET_CHARS.has(code[i])) {
      tokens.push({ type: 'bracket', value: code[i] });
      i++;
      continue;
    }

    tokens.push({ type: 'plain', value: code[i] });
    i++;
  }

  return tokens;
}

function tokenizeTs(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Line comments
    if (code[i] === '/' && code[i + 1] === '/') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Block comments
    if (code[i] === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2);
      if (end === -1) end = code.length;
      else end += 2;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Template literals
    if (code[i] === '`') {
      let j = i + 1;
      let depth = 0;
      while (j < code.length) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === '$' && code[j + 1] === '{') {
          depth++;
          j += 2;
          continue;
        }
        if (code[j] === '}' && depth > 0) {
          depth--;
          j++;
          continue;
        }
        if (code[j] === '`' && depth === 0) {
          j++;
          break;
        }
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // Strings
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote && code[j] !== '\n') {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // JSX strings (attribute values)
    // Already handled by single/double quote cases above

    // Numbers
    if (/[0-9]/.test(code[i]) && (i === 0 || !/[a-zA-Z_$]/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[0-9.xXa-fA-FeEbBoO_]/.test(code[j])) j++;
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // Words (identifiers, keywords)
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);

      if (KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (/^[A-Z][a-zA-Z0-9]*$/.test(word)) {
        // PascalCase = type or component
        tokens.push({ type: 'type', value: word });
      } else {
        // Check if followed by ( => function call
        let k = j;
        while (k < code.length && code[k] === ' ') k++;
        if (code[k] === '(') {
          tokens.push({ type: 'function', value: word });
        } else {
          tokens.push({ type: 'plain', value: word });
        }
      }
      i = j;
      continue;
    }

    // Brackets and operators
    if (BRACKET_CHARS.has(code[i])) {
      // Arrow function =>
      if (code[i] === '=' && code[i + 1] === '>') {
        tokens.push({ type: 'bracket', value: '=>' });
        i += 2;
        continue;
      }
      tokens.push({ type: 'bracket', value: code[i] });
      i++;
      continue;
    }

    // Everything else (whitespace, etc.)
    tokens.push({ type: 'plain', value: code[i] });
    i++;
  }

  return tokens;
}

const TOKEN_CLASSES: Record<TokenType, string> = {
  keyword: 'text-purple-400',
  string: 'text-green-400',
  comment: 'text-gray-500 italic',
  type: 'text-yellow-300',
  function: 'text-blue-400',
  bracket: 'text-gray-400',
  number: 'text-orange-400',
  plain: 'text-gray-200',
};

function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const tokens = React.useMemo(() => tokenize(code, language), [code, language]);

  const lines = React.useMemo(() => {
    const result: Token[][] = [[]];
    for (const token of tokens) {
      const parts = token.value.split('\n');
      for (let p = 0; p < parts.length; p++) {
        if (p > 0) {
          result.push([]);
        }
        if (parts[p].length > 0) {
          result[result.length - 1].push({ type: token.type, value: parts[p] });
        }
      }
    }
    return result;
  }, [tokens]);

  const languageLabel = language === 'typescript' ? 'ts' : language;

  return (
    <div
      data-slot="code-block"
      className={cn('relative group rounded-lg overflow-hidden bg-gray-900 border border-gray-800', className)}
    >
      {/* Header bar */}
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/60 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {language && (
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded">
                {languageLabel}
              </span>
            )}
            {filename && (
              <span className="text-xs text-gray-400 font-mono">
                {filename}
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors px-2 py-1 rounded hover:bg-gray-700/50"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-400"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* No header — floating copy button */}
      {!filename && !language && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 px-2 py-1 rounded bg-gray-800/80 hover:bg-gray-700/80"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <span className="text-green-400">Copied!</span>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      )}

      {/* Code content */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed font-mono">
          <code>
            {lines.map((lineTokens, lineIndex) => (
              <div key={lineIndex} className="flex">
                {showLineNumbers && (
                  <span className="select-none text-gray-600 text-right w-8 pr-4 shrink-0 inline-block">
                    {lineIndex + 1}
                  </span>
                )}
                <span>
                  {lineTokens.length === 0 ? (
                    '\n'
                  ) : (
                    lineTokens.map((token, tokenIndex) => (
                      <span key={tokenIndex} className={TOKEN_CLASSES[token.type]}>
                        {token.value}
                      </span>
                    ))
                  )}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

export { CodeBlock };
export type { CodeBlockProps };
