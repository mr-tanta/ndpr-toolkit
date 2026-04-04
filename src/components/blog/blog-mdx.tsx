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
  let html = md;

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = escapeHtml(code.trim());
    const langAttr = lang ? ` data-language="${lang}"` : '';
    return `<pre class="bg-gray-900 text-gray-300 rounded-lg p-4 overflow-x-auto text-sm my-6"${langAttr}><code>${escaped}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-6" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold text-gray-900 dark:text-white mt-8 mb-3">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 dark:text-white mt-10 mb-4">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-extrabold text-gray-900 dark:text-white mt-12 mb-6">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 py-1 my-4 text-gray-600 dark:text-gray-400 italic">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-gray-200 dark:border-gray-700" />');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-gray-700 dark:text-gray-300 mb-1">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-gray-700 dark:text-gray-300 mb-1">$1</li>');

  // Wrap consecutive <li> elements in <ul> or <ol>
  html = html.replace(/((?:<li class="ml-6 list-disc[^>]*>.*?<\/li>\n?)+)/g, '<ul class="my-4">$1</ul>');
  html = html.replace(/((?:<li class="ml-6 list-decimal[^>]*>.*?<\/li>\n?)+)/g, '<ol class="my-4">$1</ol>');

  // Paragraphs — wrap non-tag lines
  const lines = html.split('\n');
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

    const isBlock = /^<(h[1-6]|pre|ul|ol|li|blockquote|hr|div|table|img)/.test(trimmed);
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

  return result.join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
