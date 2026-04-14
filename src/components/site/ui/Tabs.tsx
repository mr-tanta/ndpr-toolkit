'use client';

import React, { useState, useCallback } from 'react';

export interface TabItem {
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  className?: string;
}

export function SiteTabs({ items, className = '' }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  if (!items.length) return null;

  return (
    <div className={className}>
      {/* Tab header */}
      <div
        style={{
          display: 'flex',
          gap: '0.125rem',
          borderBottom: '1px solid var(--border-default)',
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
        }}
        role="tablist"
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.label}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(index)}
              style={{
                padding: '0.625rem 1rem',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                background: 'none',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
                marginBottom: '-1px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div
        role="tabpanel"
        style={{
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {items[activeIndex]?.content}
      </div>
    </div>
  );
}
