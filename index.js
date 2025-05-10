import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// LINEからのWebhookイベントを受け取るエンドポイント
app.post("/webhook", async (req, res) => {
  const events = req.body.events;
  if (!events || events.length === 0) {
    return res.status(200).send("No events");
  }

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;

      try {
        const completion = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
          }
        );

        const replyMessage = completion.data.choices[0].message.content;

        await axios.post(
          "https://api.line.me/v2/bot/message/reply",
          {
            replyToken: event.replyToken,
            messages: [{ type: "text", text: replyMessage }],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
            },
          }
        );
      } catch (error) {
        console.error("Error handling message:", error.response?.data || error.message);
      }
    }
  }

  res.sendStatus(200);
});

// デフォルトのGETルート（確認用）
app.get("/", (req, res) => {
  res.send("Mimimedi LINE Bot is running!");
});

// ポート指定（Cloud Run用）
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

