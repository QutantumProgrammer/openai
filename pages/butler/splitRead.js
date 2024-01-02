import { read } from './reader.js';

const holdingWords = [];

export function splitRead(words) {
  holdingWords.push(words);
  
  if (/[，,。.？?！!；;：:]/.test(words)) {
    readImmediately();
    return;
  }
}

export function readImmediately() {
  const { after } = read(holdingWords.join(''));
  holdingWords.length = 0;
  return after;
}
