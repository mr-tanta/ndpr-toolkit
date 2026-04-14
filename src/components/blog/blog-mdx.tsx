'use client';

import React from 'react';

/**
 * Renders markdown content as HTML.
 * Uses a lightweight regex-based parser for static blog content.
 *
 * Security note: This component renders trusted content authored by the
 * site owner in local MDX files — not user-submitted input.
 */
export function BlogMDX({ source }: { source: string }) {
  const html = markdownToHtml(source);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function markdownToHtml(md: string): string {
  const codeBlocks: string[] = [];
  let processed = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = escapeHtml(code.trimEnd());
    const langLabel = lang
      ? `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.625rem 1.25rem;border-bottom:1px solid var(--border-default);background:linear-gradient(180deg,var(--bg-elevated),var(--bg-surface))"><span style="font-size:0.625rem;font-family:var(--font-mono);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;font-weight:600;padding:0.125rem 0.5rem;border-radius:9999px;background:rgba(37,99,235,0.08)">${lang}</span></div>`
      : '';
    const html = `<div style="margin:1.5rem 0;border-radius:var(--radius-xl);overflow:hidden;border:1px solid var(--border-default);background:var(--bg-inset);box-shadow:0 4px 24px rgba(0,0,0,0.15)">${langLabel}<pre style="margin:0;padding:1.25rem 1.5rem;font-family:var(--font-mono);font-size:0.8125rem;line-height:1.75;color:var(--text-secondary);overflow-x:auto;tab-size:2"><code>${escaped}</code></pre></div>`;
    codeBlocks.push(html);
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  // Inline code
  processed = processed.replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono);font-size:0.875em;padding:0.125em 0.375em;border-radius:var(--radius-sm);background:var(--bg-elevated);color:#60a5fa">$1</code>');

  // Images
  processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="border-radius:var(--radius-lg);margin:1.5rem 0" />');

  // Links
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#60a5fa;text-decoration:underline;text-decoration-color:rgba(37,99,235,0.3);text-underline-offset:2px">$1</a>');

  // Headers
  processed = processed.replace(/^#### (.+)$/gm, '<h4 style="font-size:var(--text-lg);font-weight:700;color:var(--text-primary);margin-top:2rem;margin-bottom:0.75rem;letter-spacing:-0.01em">$1</h4>');
  processed = processed.replace(/^### (.+)$/gm, '<h3 style="font-size:var(--text-xl);font-weight:700;color:var(--text-primary);margin-top:2.5rem;margin-bottom:1rem;letter-spacing:-0.01em">$1</h3>');
  processed = processed.replace(/^## (.+)$/gm, '<h2 style="font-size:var(--text-2xl);font-weight:800;color:var(--text-primary);margin-top:3rem;margin-bottom:1rem;letter-spacing:-0.02em;padding-bottom:0.75rem;border-bottom:1px solid var(--border-default)">$1</h2>');
  processed = processed.replace(/^# (.+)$/gm, '<h1 style="font-size:var(--text-3xl);font-weight:800;color:var(--text-primary);margin-top:3rem;margin-bottom:1.5rem;letter-spacing:-0.025em">$1</h1>');

  // Bold and italic
  processed = processed.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>');
  processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Blockquotes
  processed = processed.replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #2563eb;padding-left:1rem;margin:1rem 0;color:var(--text-muted);font-style:italic">$1</blockquote>');

  // Horizontal rules
  processed = processed.replace(/^---$/gm, '<hr style="margin:2rem 0;border:none;border-top:1px solid var(--border-default)" />');

  // Lists
  processed = processed.replace(/^- (.+)$/gm, '<li style="margin-left:1.5rem;list-style-type:disc;color:var(--text-secondary);margin-bottom:0.25rem">$1</li>');
  processed = processed.replace(/^\d+\. (.+)$/gm, '<li style="margin-left:1.5rem;list-style-type:decimal;color:var(--text-secondary);margin-bottom:0.25rem">$1</li>');

  processed = processed.replace(/((?:<li style="margin-left:1\.5rem;list-style-type:disc[^>]*>.*?<\/li>\n?)+)/g, '<ul style="margin:1rem 0">$1</ul>');
  processed = processed.replace(/((?:<li style="margin-left:1\.5rem;list-style-type:decimal[^>]*>.*?<\/li>\n?)+)/g, '<ol style="margin:1rem 0">$1</ol>');

  // Paragraphs
  const lines = processed.split('\n');
  const result: string[] = [];
  let inParagraph = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      continue;
    }
    const isBlock = /^<(h[1-6]|pre|ul|ol|li|blockquote|hr|div|table|img)/.test(trimmed) || /^%%CODEBLOCK_\d+%%$/.test(trimmed);
    if (isBlock) {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      result.push(trimmed);
    } else {
      if (!inParagraph) { result.push('<p style="color:var(--text-secondary);line-height:1.8;margin-bottom:1rem">'); inParagraph = true; }
      result.push(trimmed);
    }
  }
  if (inParagraph) result.push('</p>');

  let final = result.join('\n');
  codeBlocks.forEach((block, i) => { final = final.replace(`%%CODEBLOCK_${i}%%`, block); });
  return final;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
