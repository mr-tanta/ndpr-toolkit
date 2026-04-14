import React from 'react';

export interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
}

export function GradientText({
  children,
  className = '',
  gradient,
  as: Tag = 'span',
}: GradientTextProps) {
  return (
    <Tag
      className={className}
      style={{
        background: gradient || 'var(--gradient-text)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline',
      }}
    >
      {children}
    </Tag>
  );
}
