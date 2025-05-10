# 🐶 Mimimedi LINEデモボット

ペットの健康に関する悩みを、LINEで気軽に相談できるAIボットです。  
OpenAI GPT-4と連携し、LINEメッセージに自動応答します。

---

## 📦 使用技術

- LINE Messaging API
- OpenAI ChatGPT (GPT-4)
- Node.js (Express)
- Cloud Run (Dockerコンテナ)
- dotenv（環境変数管理）

---

## 🚀 セットアップ手順

### 1. `.env` ファイルを作成（`.env.example`を元に）

```env
OPENAI_API_KEY=your-openai-api-key
LINE_CHANNEL_ACCESS_TOKEN=your-line-access-token
