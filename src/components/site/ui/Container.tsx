import React from 'react';

export interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap: Record<NonNullable<ContainerProps['size']>, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

export function Container({ children, size = 'xl', className = '' }: ContainerProps) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        maxWidth: sizeMap[size],
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 'var(--space-6)',
        paddingRight: 'var(--space-6)',
      }}
    >
      {children}
    </div>
  );
}
