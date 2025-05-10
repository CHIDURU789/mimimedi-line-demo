const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const event = req.body.events?.[0];
  if (!event || event.type !== 'message') return res.sendStatus(200);

  const userMessage = event.message.text;

  // GPTに問い合わせ
  const gptRes = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [
        { role: "system", content: "あなたは親切なペットの健康アドバイザーです。" },
        { role: "user", content: userMessage }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  const replyMessage = gptRes.data.choices[0].message.content;

  // LINEに返信
  await axios.post(
    'https://api.line.me/v2/bot/message/reply',
    {
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: replyMessage }]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      }
    }
  );

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mimimedi LINE bot running on port ${PORT}`);
});
