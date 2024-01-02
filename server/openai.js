import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const send = async (messages, onDataMessage) => {
  const completion = await openai.createChatCompletion({
    model: 'gpt-4-1106-preview',
    messages,
    stream: true,
  }, {
    responseType: 'stream',
  });

  let doneResolver;
  const donePromise = new Promise(resolve => doneResolver = resolve);
  let cacheHalfDataFromOpenai = '';
  completion.data.on('data', (originalData) => {
    let data = originalData;
    try {
      if (cacheHalfDataFromOpenai) {
        data = `${cacheHalfDataFromOpenai}${originalData}`
      }
      console.log('data-:', data.toString());
      console.log('=============');
      const stringDataList = data
        .toString()
        .split('\n')
        .filter(item => item !== '')
        .map(item => {
          if (item.includes('[DONE]')) {
            return {
              done: true,
            };
          }

          const result = JSON.parse(item.replace(/^data: /, ''));
          return result;
        });

      cacheHalfDataFromOpenai = '';

      stringDataList.forEach(dataItem => {
        if (dataItem?.choices?.[0]?.delta?.role === 'assistant') {
          onDataMessage('[>_START]');
          return;
        }
        if (dataItem?.choices?.[0]?.finish_reason === 'stop') return;
        if (dataItem?.done) {
          doneResolver?.('[DONE_<]');
          return;
        }
        onDataMessage(dataItem.choices?.[0]?.delta?.content);
      });
    } catch (error) {
      cacheHalfDataFromOpenai = originalData;
      console.log('err', error);
    }

  });

  return donePromise;
};
