const express = require('express');
const { middleware, Client } = require('@line/bot-sdk');
const axios = require('axios');
require('dotenv').config();

const app = express();

// LINEチャネル設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

// webhookエンドポイント
app.post('/webhook', middleware(config), async (req, res) => {
  try {
    const results = await Promise.all(req.body.events.map(handleEvent));
    res.json(results);
  } catch (err) {
    console.error('エラー:', err);
    res.status(500).end();
  }
});

// メッセージイベント処理
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

 const userMessage = event.message.text;

try {
  const openaiResponse = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  const aiReply = openaiResponse.data.choices[0].message.content.trim();

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: aiReply,
  });
} catch (error) {
  console.error('OpenAI APIエラー:', error.response?.data || error.message);

  // LINE側にエラーを通知（任意）
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: 'ごめんなさい、現在システムエラーが発生しています。',
  });
}


  } catch (error) {
    console.error('OpenAI APIエラー:', error.message);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'ごめんなさい。現在お答えできません🙏',
    });
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
