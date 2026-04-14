'use client';

import React, { useState, useCallback } from 'react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}

export function SiteCodeBlock({
  code,
  language = 'tsx',
  title,
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }, [code]);

  return (
    <div
      className={className}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-default)',
        background: 'var(--bg-inset)',
        fontSize: 'var(--text-sm)',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Traffic-light dots */}
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <span
              style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                background: '#ef4444',
                opacity: 0.7,
              }}
            />
            <span
              style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                background: '#f59e0b',
                opacity: 0.7,
              }}
            />
            <span
              style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                background: '#10b981',
                opacity: 0.7,
              }}
            />
          </div>
          {title && (
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {title}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 500,
            }}
          >
            {language}
          </span>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              color: copied ? 'var(--success)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
            }}
            title="Copy code"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div style={{ overflow: 'auto' }}>
        <pre
          style={{
            margin: 0,
            padding: '1rem 1.25rem',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            tabSize: 2,
          }}
        >
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
