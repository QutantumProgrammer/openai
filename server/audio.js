import {
  SpeechConfig,
  SpeechSynthesizer,
} from 'microsoft-cognitiveservices-speech-sdk';

const speechConfig = SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);

speechConfig.speechSynthesisVoiceName = 'zh-CN-YunxiNeural';
// speechConfig.speechSynthesisVoiceName = 'zh-CN-liaoning-YunbiaoNeural';
// speechConfig.speechSynthesisVoiceName = 'zh-CN-henan-YundengNeural';
// speechConfig.speechSynthesisVoiceName = 'zh-HK-WanLungNeural';
// speechConfig.speechSynthesisVoiceName = 'zh-TW-HsiaoChenNeural';
// speechConfig.speechSynthesisVoiceName = 'zh-CN-guangxi-YunqiNeural';

export async function getAudioStreamFromText(text) {

  // speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3;
  const speechSynthesizer = new SpeechSynthesizer(speechConfig, null);

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
