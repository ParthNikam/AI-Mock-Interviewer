import { useState, useCallback, useRef, useEffect } from 'react';
import { MicrophoneRecorder, transcribeAudio } from '@/lib/utils/audio';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const recorderRef = useRef<MicrophoneRecorder | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recorderRef.current?.isRecording) {
        recorderRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const recorder = new MicrophoneRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    if (!recorderRef.current?.isRecording) {
      throw new Error('No active recording');
    }

    setIsTranscribing(true);
    setError(null);

    try {
      const audioBlob = await recorderRef.current.stop();
      const transcription = await transcribeAudio(audioBlob);
      setTranscript(transcription);
      return transcription;
    } catch (err) {
      console.error('Error during transcription:', err);
      setError(err instanceof Error ? err.message : 'Failed to transcribe audio');
      throw err;
    } finally {
      setIsRecording(false);
      setIsTranscribing(false);
      recorderRef.current = null;
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (recorderRef.current?.isRecording) {
      recorderRef.current.stop().catch(console.error);
      setTranscript('');
      setIsRecording(false);
      setError(null);
      recorderRef.current = null;
    }
  }, []);

  return {
    isRecording,
    isTranscribing,
    error,
    transcript,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
