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
          gap: '0.25rem',
          padding: '0.25rem',
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
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
                padding: '0.5rem 1rem',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: isActive ? '#fff' : 'var(--text-muted)',
                background: isActive ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
                position: 'relative',
                ...(isActive ? { boxShadow: 'inset 0 0 0 1px rgba(37, 99, 235, 0.25)' } : {}),
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
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
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      >
        {items[activeIndex]?.content}
      </div>
    </div>
  );
}
