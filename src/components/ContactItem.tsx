import React from 'react';
import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';

interface ContactItemProps {
  name: string;
  avatarColor: string;
  uid: string;
  isActive?: boolean;
  onClick: () => void;
  lastMessage?: string;
}

export const ContactItem: React.FC<ContactItemProps> = ({
  name,
  avatarColor,
  uid,
  isActive = false,
  onClick,
  lastMessage,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
        isActive 
          ? 'bg-accent/20 border border-accent/30' 
          : 'hover:bg-secondary/50'
      )}
    >
      <Avatar name={name} color={avatarColor} size="md" />
      <div className="flex-1 min-w-0 text-left">
        <p className="font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {lastMessage || `UID: ${uid}`}
        </p>
      </div>
    </button>
  );
};
