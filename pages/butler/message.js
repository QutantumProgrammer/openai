import { send } from './ws.js';
import { splitRead, readImmediately } from './splitRead.js';
import { isEnableRead } from './soundControl.js';
import { loginPromise } from './login.js';
import { read } from './reader.js';

let chats = [];
let chatting = false;
let bootSpeechRecognition;
let contentSpeechRecognition;
let systemSpeaking = false;
let booting = false;

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

async function askOpenAi (value) {
  await loginPromise;
  addUserRow(value);
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
        readImmediately().then(() => {
          systemSpeaking = false;
          bootSpeechRecognition.start();
          booting = false;
        });
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
}

async function greet() {
  systemSpeaking = true;
  const { after } = read('愿意为您效劳');
  await after;
  systemSpeaking = false;
  contentSpeechRecognition.start();
}

function listenBootWord() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // const grammar ='#JSGF V1.0; grammar colors; public <name> = lucy ;';
  // const speechRecognitionList = new webkitSpeechGrammarList();
  // speechRecognitionList.addFromString(grammar, 1);
  // recognition.grammars = speechRecognitionList;
  
  recognition.continuous = false; // 一次只处理一句话
  recognition.lang = 'en-US'; // 设置语言
  recognition.interimResults = false; // 只返回最终结果
  recognition.maxAlternatives = 1; // 设置结果的最大替代数

  recognition.onresult = function(event) {
    const speechResult = event.results[0][0].transcript;
    console.log('onresult:', speechResult);
    if (speechResult.toLowerCase() !== 'lucy') return;
    booting = true;
    greet();
    recognition.stop();
  };

  recognition.onend = function() {
    if (booting) return;
    recognition.start();
    console.log('listenBootWord end');
  };

  recognition.onerror = function(event) {
    console.log('语音识别错误: ' + event.error);
  };

  recognition.start();

  return recognition;
}

bootSpeechRecognition = listenBootWord();

function listenContent() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false; // 一次只处理一句话
  recognition.lang = 'zh-CN'; // 设置语言
  recognition.interimResults = false; // 只返回最终结果
  recognition.maxAlternatives = 1; // 设置结果的最大替代数
  console.log('start listen');

  recognition.onresult = function(event) {
    const speechResult = event.results[0][0].transcript;
    systemSpeaking = true;
    console.log('on----result');
    recognition.stop();
    askOpenAi(speechResult);
  };

  recognition.onend = function() {
    if (systemSpeaking) return;
    recognition.start();
    console.log('listenContent end');
  };

  recognition.onerror = function(event) {
    console.log('语音识别错误: ' + event.error);
  };
  return recognition;
}

contentSpeechRecognition = listenContent();
