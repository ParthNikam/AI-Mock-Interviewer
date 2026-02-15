import asyncio
import os
from dotenv import load_dotenv

# Note: Ensure you have 'deepgram-sdk>=3.0.0' and 'pyaudio' installed
from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveTranscriptionEvents,
    LiveOptions,
    Microphone,
)

load_dotenv()
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
exit_signal = asyncio.Event()


class TranscriptCollector:
    def __init__(self):
        self.reset()

    def reset(self):
        self.transcript_parts = []

    def add_part(self, part):
        if part:
            self.transcript_parts.append(part)

    def get_full_transcript(self):
        return " ".join(self.transcript_parts)


transcript_collector = TranscriptCollector()


async def get_transcript():
    try:
        # Use DeepgramClientOptions for connection-level settings
        config = DeepgramClientOptions(options={"keepalive": "true"})
        deepgram: DeepgramClient = DeepgramClient(DEEPGRAM_API_KEY, config)

        # Initialize the connection
        dg_connection = deepgram.listen.asyncwebsocket.v("1")

        # FIX: Removed 'self' from these standalone async functions
        async def on_message(unused_self, result, **kwargs):
            # result is a LiveResult object
            sentence = result.channel.alternatives[0].transcript

            if not sentence:
                return

            # Check if the result is a partial or final transcript
            if result.is_final:
                transcript_collector.add_part(sentence)

                # speech_final means the speaker has stopped talking for a bit
                if result.speech_final:
                    full_sentence = transcript_collector.get_full_transcript()
                    print(f"Speaker: {full_sentence}")

                    if "goodbye" in full_sentence.lower():
                        print("\n[System]: Goodbye detected! Closing connection...")
                        exit_signal.set()

                    transcript_collector.reset()
                else:
                    # Intermediate final (still part of the same sentence)
                    pass
            else:
                # This is a 'streaming' result (real-time updates)
                print(f"Interim: {sentence}", end="\r")

        async def on_error(unused_self, error, **kwargs):
            print(f"Deepgram Error: {error}")

        # Register events
        dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
        dg_connection.on(LiveTranscriptionEvents.Error, on_error)

        options = LiveOptions(
            model="nova-2",
            punctuate=True,
            language="en-US",
            encoding="linear16",
            channels=1,
            sample_rate=16000,
            endpointing=300,  # Wait 300ms of silence before marking speech_final
            smart_format=True,
        )

        # Start the connection
        if await dg_connection.start(options) is False:
            print("Failed to start connection")
            return

        # Open microphone stream
        # Pass the connection object so it knows where to send data
        microphone = Microphone(dg_connection.send)
        microphone.start()

        print("Listening... (Say 'goodbye' to exit)")

        while not exit_signal.is_set():
            await asyncio.sleep(0.1)
            if not microphone.is_active():
                break

        print("Shutting down...")
        microphone.finish()
        dg_connection.finish()
        print("Finished")

    except Exception as e:
        print(f"Exception: {e}")


if __name__ == "__main__":

    async def main():
        await get_transcript()

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass

# import os
# from dotenv import load_dotenv
# from deepgram import (
#     DeepgramClient,
#     DeepgramClientOptions,
#     PrerecordedOptions,
#     FileSource,
# )

# # The SDK automatically looks for the DEEPGRAM_API_KEY environment variable.
# # You can also explicitly pass it:
# # deepgram = DeepgramClient(api_key="YOUR_API_KEY")
# load_dotenv()
# DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
# client = DeepgramClient(DEEPGRAM_API_KEY)

# # Path to your audio file (e.g., "audio.wav", "meeting.mp3", etc.)
# AUDIO_FILE = "Recording.wav"

# try:
#     with open(AUDIO_FILE, "rb") as audio_file:
#         # 1. Read the file into a buffer
#         buffer_data = audio_file.read()

#         # 2. Create a dictionary payload (this avoids the Union error)
#         payload = {
#             "buffer": buffer_data,
#         }

#         # 3. Use PrerecordedOptions for transcription settings
#         # Note: Ensure you import PrerecordedOptions from deepgram
#         options = PrerecordedOptions(
#             model="nova-2",
#             smart_format=True,
#         )

#         # 4. Call the transcription method
#         # rest.v("1") is the stable path for the v3 SDK
#         response = client.listen.rest.v("1").transcribe_file(payload, options)

#         # 5. Extract and print
#         transcript = response.results.channels[0].alternatives[0].transcript
#         print(f"Transcript: {transcript}")

# except Exception as e:
#     print(f"Error during transcription: {e}")
