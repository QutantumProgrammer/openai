import { send } from './ws.js';
import { splitRead, readImmediately } from './splitRead.js';
import { isEnableRead } from './soundControl.js';
import { loginPromise } from './login.js';

let chats = [];
let chatting = false;

function addUserRow(inputValue) {
  const rowNode = document.createElement('div');
  rowNode.classList.add('row-user');
  rowNode.innerHTML = `
  <div class="row-holder"></div>
  <pre class="message-content">${inputValue}</pre>
  <div class="icon"></div>
  `;
  document.querySelector('.message-wrapper').appendChild(rowNode);
}

function addAssistantRow() {
  const rowNode = document.createElement('div');
  rowNode.classList.add('row-assistant');
  rowNode.innerHTML = `
  <div class="icon"></div>
  <pre class="message-content">
    <div class="cursor"></div>
  </pre>
  <div class="row-holder"></div>
  `;
  document.querySelector('.message-wrapper').appendChild(rowNode);

  const messageNode = rowNode.querySelector('.message-content');
  const cursorNode = document.createElement('div');
  cursorNode.classList.add('cursor');

  return {
    appendText: (value) => {
      messageNode.innerText = `${value}`;
      messageNode.appendChild(cursorNode);
    },
    removeCursor: () => {
      setTimeout(() => {
        cursorNode.remove();
      }, 1000);
    },
  };
}

document.querySelector('#userInput').addEventListener('keydown', (event) => {
  if (event.keyCode !== 13) return;
  event.preventDefault();
  document.querySelector('#send').click();
});

document.querySelector('#send').addEventListener('click', async () => {
  if (chatting) return;

  chatting = true;
  document.querySelector('.content-wrapper').classList.add('chatting');

  await loginPromise;
  const value = document.querySelector('#userInput').value;
  addUserRow(value);
  document.querySelector('#userInput').value = '';
  let replyText = '';

  chats.push({
    role: 'user',
    content: value,
  });

  let assistantRowHandler;

  send(JSON.stringify(chats), (event) => {

    if ('[>_START]' === event.data) {
      assistantRowHandler = addAssistantRow();
      return;
    }

    if ('[DONE_<]' === event.data) {
      chats.push({
        role: 'assistant',
        content: replyText,
      });

      if (isEnableRead()) {
        readImmediately();
      }

      chatting = false;
      document.querySelector('.content-wrapper').classList.remove('chatting');
      assistantRowHandler.removeCursor();
      return;
    }

    if (isEnableRead()) {
      splitRead(event.data);
    }

    replyText += event.data;
    const renderText = replyText;
    setTimeout(() => {
      assistantRowHandler.appendText(renderText);
    }, 20);
  });
});
