const messageQueue = [];

function readByBrowser(text) {
  return {
    after: new Promise((resolve, reject) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.pitch = 1; // 范围从0到2
      utterance.rate = 1; // 速度，较低值较慢
      synth.speak(utterance);
      utterance.onstart = function(event) {
        console.log('Speech synthesis started');
      };

      utterance.onend = function(event) {
        console.log('Speech synthesis finished');
        resolve();
      };
    }),
  }
}

export function read(text) {
  const selfMessageQueue = [...messageQueue];
  const selfMessageQueueFinishedPromise = Promise.all(selfMessageQueue).catch(err => err);
  const endPromise = selfMessageQueueFinishedPromise.then(() => readByBrowser(text))
  messageQueue.push(endPromise);
  return endPromise;
}
