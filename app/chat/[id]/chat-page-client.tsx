"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ChatMessage } from "@/lib/api/chat"
import { submitAnswer } from "@/lib/actions/chat"
import { uploadChat } from "@/lib/api/chat"
import { VoiceRecorder } from "@/components/ui/VoiceRecorder"
import { MicrophoneRecorder, transcribeAudio } from "@/lib/utils/audio"
const Orb = dynamic(() => import("@/components/Orb"), { ssr: false })

type ChatPageClientProps = {
  chatId: string
  initialQuestion: ChatMessage | null
  role: string
}

export function ChatPageClient({
  chatId,
  initialQuestion,
  role,
}: ChatPageClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion)
  const [isComplete, setIsComplete] = useState(false)
  const { user } = useAuth();

  // Transcription state
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  // Handle transcription completion
  const handleTranscriptionComplete = (text: string) => {
    setTranscript(text)
  }

  // Handle recording state change
  const handleRecordingStateChange = (recording: boolean) => {
    setIsRecording(recording)
  }


  const handleSubmitAnswer = async () => {
    const question = currentQuestion?.message
    if (!question) return

    // Require authentication on action
    if (!user) return router.push('/auth/signin')

    setIsSubmitting(true)
    try {
      // Use the transcript from the voice recorder
      const answerText = transcript || ''
     
      // Call server action with transcribed text
      const result = await submitAnswer({
        role,
        question,
        answer: answerText,
        chatId,
      });
      
      console.log('Submission result:', result);

      // Interview complete, redirect to recommendations
      setIsComplete(true);
      router.push(`/recom/${chatId}`)
    } catch (error) {
      console.error('Error submitting answer:', error)
      setRecordingError('Failed to submit answer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full w-full relative flex items-center min-h-screen">
      {/* Orb - centered */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="size-72 shrink-0 md:size-80 lg:size-96">
          <Orb
            hoverIntensity={0.75}
            rotateOnHover
            hue={20}
            forceHoverState={isRecording}
            backgroundColor="#000000"
          />
        </div>
        {/* Question text under orb */}
        {currentQuestion && (
          <div className="mt-6 max-w-2xl px-4 text-center">
            <div className="mb-2 text-sm text-muted-foreground">
              Question 1 of 1
            </div>
            <p className="text-xl text-foreground/90">
              {currentQuestion.message}
            </p>
          </div>
        )}
      </div>

      {/* Config card - Submit Answer only */}
      <div className="ml-auto pr-16 w-full max-w-md">
        <Card className="w-full max-w-md shrink-0">
          <CardHeader>
            <CardTitle>Interview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4">
              {/* Voice Recorder Component */}
              <div className="flex items-center justify-between">
                <VoiceRecorder 
                  onTranscriptionComplete={handleTranscriptionComplete}
                  onRecordingStateChange={handleRecordingStateChange}
                  disabled={isSubmitting}
                />
                {recordingError && (
                  <p className="text-sm text-red-500">{recordingError}</p>
                )}
              </div>

              {/* Transcript Preview */}
              {transcript && (
                <div className="rounded-md border bg-muted/50 p-3 text-sm">
                  <p className="font-medium text-muted-foreground">Your answer:</p>
                  <p className="mt-1">{transcript}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTranscript('')}
                disabled={!transcript || isSubmitting}
              >
                Clear
              </Button>
              <Button
                size="lg"
                className="px-8 text-base font-semibold"
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !transcript}
              >
                {isSubmitting 
                  ? 'Processing...' 
                  : 'Submit Answer'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question dialog - shown on load */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            {initialQuestion ? (
              <>
                <DialogTitle className="text-base font-semibold">
                  {initialQuestion.message}
                </DialogTitle>
              </>
            ) : (
              <DialogTitle>No question found</DialogTitle>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
