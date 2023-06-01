import { switchMute } from './reader.js';

export const ENABLE_READ_MARK = '__ENABLE_READ';

let enableRead = localStorage.getItem(ENABLE_READ_MARK) === '1';
if (enableRead) document.querySelector('.sound').classList.remove('mute');

document.querySelector('.sound').addEventListener('click', () => {
  if (enableRead) {
    document.querySelector('.sound').classList.add('mute');
    localStorage.setItem(ENABLE_READ_MARK, null);
    switchMute(true);
  } else {
    document.querySelector('.sound').classList.remove('mute');
    localStorage.setItem(ENABLE_READ_MARK, '1');
    switchMute(false);
  }

  enableRead = !enableRead;
});

export function isEnableRead() {
  return enableRead;
}
