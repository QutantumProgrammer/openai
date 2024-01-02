let wsInstance;
let onmessageHolder;

function init() {
  return new Promise(resolve => {
    wsInstance = new WebSocket(`ws://${location.host}`);

    wsInstance.onopen = () => {
      console.log('ws open');
      resolve(wsInstance);
    };

    wsInstance.onclose = () => {
      wsInstance = undefined;
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
    console.log(err);
  }
}
