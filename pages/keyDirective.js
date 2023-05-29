// 连续的键盘输入触发回调
const callbackHolder = {};
function listenKeys(keys, callback) {
  let inputs = [];
  let timeId;
  const eventId = `${new Date().getTime()}_${(Math.random() * 10000).toFixed(0)}`;
  const keydownHandle = ({ keyCode }) => {
    clearTimeout(timeId);
    if (keys[inputs.length] !== keyCode) {
      inputs = [];
      return;
    }
    inputs.push(keyCode);
    if (inputs.length === keys.length) {
      inputs = [];
      callback();
      return;
    }

    timeId = setTimeout(() => {
      inputs = [];
    }, 850);
  };
  callbackHolder[eventId] = keydownHandle;
  document.addEventListener('keydown', keydownHandle);
  return eventId;
}
function destroyById(eventId) {
  document.removeEventListener('keydown', callbackHolder[eventId]);
  delete callbackHolder[eventId];
}

export default {
  listenKeys,
  destroyById,
};
