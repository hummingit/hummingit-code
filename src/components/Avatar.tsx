import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
};

export const Avatar: React.FC<AvatarProps> = ({ name, color, size = 'md', className }) => {
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
};
