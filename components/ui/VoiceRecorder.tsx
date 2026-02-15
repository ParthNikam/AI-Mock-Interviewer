'use client';

import React from 'react';
import { Button } from './button';
import { Mic, Square, X } from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

type VoiceRecorderProps = {
  onTranscriptionComplete: (transcript: string) => void;
  disabled?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
};

export function VoiceRecorder({ onTranscriptionComplete, disabled, onRecordingStateChange }: VoiceRecorderProps) {
  const {
    isRecording,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  // Notify parent when recording state changes
  React.useEffect(() => {
    onRecordingStateChange?.(isRecording);
  }, [isRecording, onRecordingStateChange]);

  const handleStopRecording = async () => {
    try {
      const transcript = await stopRecording();
      onTranscriptionComplete(transcript);
    } catch (error) {
      console.error('Error during transcription:', error);
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm">
        <span>{error}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isRecording) cancelRecording();
          }}
          className="text-red-500 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Recording...</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleStopRecording}
          disabled={isTranscribing || disabled}
          className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={startRecording}
      disabled={isTranscribing || disabled}
      className="relative"
    >
      {isTranscribing ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
