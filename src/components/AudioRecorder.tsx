import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  disabled?: boolean;
  remainingMessages: number;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onSend, 
  disabled = false,
  remainingMessages 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
      cancelRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (disabled || remainingMessages <= 0) {
    return (
      <div className="flex items-center justify-center p-4 bg-secondary/50 rounded-2xl">
        <p className="text-sm text-muted-foreground">
          {remainingMessages <= 0 
            ? "You've reached your daily limit of 5 messages" 
            : "Select a contact to send a message"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
      {!isRecording && !audioBlob && (
        <>
          <Button
            onClick={startRecording}
            size="lg"
            className="rounded-full w-14 h-14 bg-gradient-to-r from-honey to-accent hover:opacity-90 transition-opacity"
          >
            <Mic className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Tap to record • {remainingMessages} messages left today
            </p>
          </div>
        </>
      )}

      {isRecording && (
        <>
          <Button
            onClick={stopRecording}
            size="lg"
            variant="destructive"
            className="rounded-full w-14 h-14"
          >
            <Square className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-3">
            <div className="audio-wave">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="audio-wave-bar" style={{ height: `${8 + Math.random() * 12}px` }} />
              ))}
            </div>
            <span className="text-lg font-medium text-destructive animate-pulse-soft">
              {formatTime(duration)}
            </span>
          </div>
        </>
      )}

      {audioBlob && !isRecording && (
        <>
          <Button
            onClick={cancelRecording}
            size="lg"
            variant="outline"
            className="rounded-full w-12 h-12"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-3">
            <audio src={audioUrl || undefined} controls className="h-10 flex-1" />
            <span className="text-sm text-muted-foreground">{formatTime(duration)}</span>
          </div>
          <Button
            onClick={handleSend}
            size="lg"
            className="rounded-full w-12 h-12 bg-gradient-to-r from-honey to-accent hover:opacity-90"
          >
            <Send className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
};
