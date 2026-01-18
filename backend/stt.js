const speech = require('@google-cloud/speech');

/**
 * Speech-to-Text service using Google Cloud Speech API
 * Transcribes audio buffers sent from the frontend
 */

const client = new speech.SpeechClient();

/**
 * Transcribe audio buffer to text
 * @param {Buffer} audioBuffer - Audio data in WebM/Opus format
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(audioBuffer) {
  try {
    const audio = {
      content: audioBuffer.toString('base64'),
    };

    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await client.recognize(request);
    
    if (!response.results || response.results.length === 0) {
      return '';
    }

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    return transcription;
  } catch (error) {
    console.error('STT Error:', error);
    throw new Error(`Speech-to-Text failed: ${error.message}`);
  }
}

module.exports = { transcribeAudio };
