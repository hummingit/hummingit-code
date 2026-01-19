import React from 'react';
import hummingbirdLogo from '@/assets/hummingbird-logo.png';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className }) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src={hummingbirdLogo}
        alt="Hummingit Logo"
        className={cn(sizeClasses[size], 'object-contain')}
      />
      {showText && (
        <span className={cn('font-display font-bold text-foreground', textSizeClasses[size])}>
          Hummingit
        </span>
      )}
    </div>
  );
};
