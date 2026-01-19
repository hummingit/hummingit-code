import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AudioMessageProps {
  audioUrl: string;
  duration: number;
  createdAt: string;
  isSent: boolean;
}

export const AudioMessage: React.FC<AudioMessageProps> = ({ 
  audioUrl, 
  duration, 
  createdAt,
  isSent 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn(
      'max-w-[280px] animate-fade-in',
      isSent ? 'chat-bubble-sent ml-auto' : 'chat-bubble-received mr-auto'
    )}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
      <div className="flex items-center gap-3">
        <Button
          onClick={togglePlay}
          size="sm"
          variant="ghost"
          className={cn(
            'rounded-full w-10 h-10 shrink-0',
            isSent ? 'hover:bg-primary/10' : 'hover:bg-accent/10'
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-honey to-accent transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {formatTime(isPlaying ? currentTime : duration)}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(createdAt), 'HH:mm')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
