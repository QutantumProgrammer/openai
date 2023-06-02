import sdk from 'microsoft-cognitiveservices-speech-sdk';

const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);

speechConfig.speechSynthesisVoiceName = 'zh-CN-YunxiNeural';

export async function getAudioStreamFromText(text) {

  // speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3;
  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

  return new Promise((resolve, reject) => {
    speechSynthesizer.speakTextAsync(
      text,
      result => {
        speechSynthesizer.close();
        resolve(result.audioData);
      },
      error => {
        console.log(error);
        reject(error);
        speechSynthesizer.close();
      });
  })
}
