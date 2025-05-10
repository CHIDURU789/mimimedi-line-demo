const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// LINE Webhook エンドポイント
app.post('/webhook', async (req, res) => {
  try {
    const events = req.body.events;
    if (!events || events.length === 0) {
      return res.status(200).send('No events');
    }

    const event = events[0];
    if (event.type !== 'message' || event.message.type !== 'text') {
      return res.status(200).send('Not a text message');
    }

    // ChatGPTへの問い合わせ
    const gptRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'あなたはペットの健康相談に詳しい獣医師です。' },
        { role: 'user', content: event.message.text }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const replyMessage = gptRes.data.choices[0].message.content;

    // LINEに返信
    await axios.post('https://api.line.me/v2/bot/message/reply', {
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: replyMessage }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      }
    });

    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Cloud Run用にポート指定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mimimedi LINE bot running on port ${PORT}`);
});


