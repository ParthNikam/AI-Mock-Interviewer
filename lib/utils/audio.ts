interface AudioRecorder {
  start: () => Promise<void>;
  stop: () => Promise<Blob>;
  isRecording: boolean;
}

export class MicrophoneRecorder implements AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: BlobPart[] = [];
  public isRecording = false;
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error('Could not access microphone. Please ensure you have granted microphone permissions.');
    }
  }

  async stop(): Promise<Blob> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No recording in progress');
    }

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.cleanup();
        resolve(audioBlob);
      };
      
      this.mediaRecorder!.stop();
      this.isRecording = false;
      
      // Stop all tracks in the stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
    });
  }

  private cleanup() {
    if (this.mediaRecorder) {
      this.mediaRecorder.ondataavailable = null;
      this.mediaRecorder.onstop = null;
      this.mediaRecorder = null;
    }
    this.audioChunks = [];
  }
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', blob, 'recording.wav');

  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to transcribe audio');
    }

    const data = await response.json();
    return data.transcript || '';
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio. Please try again.');
  }
}
