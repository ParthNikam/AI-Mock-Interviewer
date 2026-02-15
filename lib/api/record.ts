import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

// Note: This is an English stream, update accordingly for other languages
const STREAM_URL = 'https://playerservices.streamtheworld.com/api/livestream-redirect/CSPANRADIOAAC.aac';

const live = async () => {
  const deepgram = createClient(DEEPGRAM_API_KEY);

  const connection = deepgram.listen.live({
    model: 'base',
    language: 'en',
    smart_format: true,
    interim_results: true,
    endpointing: 10,
  });

  connection.on(LiveTranscriptionEvents.Open, async () => {
    console.log(`Transcribing ${STREAM_URL}...`);

    const response = await fetch(STREAM_URL, { redirect: 'follow' });
    if (!response.body) {
      console.error('Response body is null');
      return;
    }
    const reader = response.body.getReader();

    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) return;
      connection.send(value.buffer);
      pump();
    };
    pump();
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data) => {
    if (data.channel?.alternatives?.[0]) {
      const transcript = data.channel.alternatives[0].transcript;
      const prefix = data.is_final ? '[ FINAL ]' : '[Interim]';
      if (transcript) {
        console.log(`${prefix} ${transcript}`);
      }
    }
  });

  connection.on(LiveTranscriptionEvents.SpeechStarted, (data) => {
    // Handle speech started event
  });

  connection.on(LiveTranscriptionEvents.UtteranceEnd, (data) => {
    // Handle utterance end event
  });

  connection.on(LiveTranscriptionEvents.Close, () => {
    console.log('Connection closed.');
  });

  connection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error(err);
  });
};

live();