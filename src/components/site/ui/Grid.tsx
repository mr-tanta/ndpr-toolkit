import React from 'react';

export interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gapMap: Record<NonNullable<GridProps['gap']>, string> = {
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
};

export function Grid({
  children,
  cols = 3,
  gap = 'md',
  className = '',
}: GridProps) {
  /*
   * We use CSS grid with a responsive column strategy.
   * On small screens everything is single-column, then scales up.
   * The `repeat(auto-fit, ...)` pattern ensures graceful wrapping.
   */
  const colMinWidths: Record<number, string> = {
    1: '100%',
    2: '280px',
    3: '260px',
    4: '220px',
  };

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${colMinWidths[cols]}, 100%), 1fr))`,
        gap: gapMap[gap],
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}
