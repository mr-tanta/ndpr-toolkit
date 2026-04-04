'use client';

import React from 'react';

/**
 * Renders markdown content as HTML.
 * Uses a lightweight regex-based parser for static blog content.
 *
 * Security note: This component renders trusted content authored by the
 * site owner in local MDX files — not user-submitted input. The content
 * is parsed at build time from files in the content/blog/ directory.
 */
export function BlogMDX({ source }: { source: string }) {
  const html = markdownToHtml(source);
  // Content is from trusted local MDX files, not user input
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function markdownToHtml(md: string): string {
  // Step 1: Extract code blocks and replace with placeholders to protect them
  const codeBlocks: string[] = [];
  let processed = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = escapeHtml(code.trimEnd());
    const langLabel = lang ? `<div class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 rounded-t-lg"><span class="text-xs font-mono text-gray-400 uppercase">${lang}</span></div>` : '';
    const preClass = lang ? 'rounded-b-lg' : 'rounded-lg';
    const html = `<div class="my-6 border border-gray-700 rounded-lg overflow-hidden">${langLabel}<pre class="bg-gray-900 text-gray-300 p-4 overflow-x-auto text-sm leading-relaxed ${preClass}"><code>${escaped}</code></pre></div>`;
    codeBlocks.push(html);
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  // Step 2: Process inline elements
  // Inline code
  processed = processed.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-sm px-1.5 py-0.5 rounded font-mono">$1</code>');

  // Images
  processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-6" />');

  // Links
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');

  // Headers
  processed = processed.replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold text-gray-900 dark:text-white mt-8 mb-3">$1</h4>');
  processed = processed.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">$1</h3>');
  processed = processed.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">$1</h2>');
  processed = processed.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-extrabold text-gray-900 dark:text-white mt-12 mb-6">$1</h1>');

  // Bold and italic
  processed = processed.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Blockquotes
  processed = processed.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 py-1 my-4 text-gray-600 dark:text-gray-400 italic">$1</blockquote>');

  // Horizontal rules
  processed = processed.replace(/^---$/gm, '<hr class="my-8 border-gray-200 dark:border-gray-700" />');

  // Unordered lists
  processed = processed.replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-gray-700 dark:text-gray-300 mb-1">$1</li>');

  // Ordered lists
  processed = processed.replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-gray-700 dark:text-gray-300 mb-1">$1</li>');

  // Wrap consecutive <li> elements
  processed = processed.replace(/((?:<li class="ml-6 list-disc[^>]*>.*?<\/li>\n?)+)/g, '<ul class="my-4">$1</ul>');
  processed = processed.replace(/((?:<li class="ml-6 list-decimal[^>]*>.*?<\/li>\n?)+)/g, '<ol class="my-4">$1</ol>');

  // Step 3: Wrap paragraphs
  const lines = processed.split('\n');
  const result: string[] = [];
  let inParagraph = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
      continue;
    }

    const isBlock = /^<(h[1-6]|pre|ul|ol|li|blockquote|hr|div|table|img)/.test(trimmed)
      || /^%%CODEBLOCK_\d+%%$/.test(trimmed);

    if (isBlock) {
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
      result.push(trimmed);
    } else {
      if (!inParagraph) {
        result.push('<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">');
        inParagraph = true;
      }
      result.push(trimmed);
    }
  }
  if (inParagraph) result.push('</p>');

  // Step 4: Restore code blocks from placeholders
  let final = result.join('\n');
  codeBlocks.forEach((block, i) => {
    final = final.replace(`%%CODEBLOCK_${i}%%`, block);
  });

  return final;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
