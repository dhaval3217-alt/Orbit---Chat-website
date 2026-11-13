import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  noBottomPadding?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  noBottomPadding = false,
}) => {
  return (
    <div
      className={`mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 w-full ${
        noBottomPadding ? 'pb-4' : 'pb-24 lg:pb-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

