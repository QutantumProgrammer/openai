let wsInstance;
let onmessageHolder;

function init() {
  return new Promise(resolve => {
    wsInstance = new WebSocket('ws://149.28.124.105:3000');

    wsInstance.onopen = () => {
      console.log('ws open');
      resolve(wsInstance);
    };

    wsInstance.onclose = () => {
      console.log('ws close');
    };

    wsInstance.onmessage = event => {
      onmessageHolder(event);
    };
  });
}

export async function send(msg, onmessage) {
  onmessageHolder = onmessage;
  if (!wsInstance) await init();
  try {
    wsInstance.send(msg);
  } catch (err) {
    await init();
    wsInstance.send(msg);
  }
}