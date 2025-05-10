FROM node:18

# 作業ディレクトリの設定
WORKDIR /app

# 依存ファイルをコピーしてインストール
COPY package*.json ./
RUN npm install

# アプリケーションの全コードをコピー
COPY . .

# Cloud Run のデフォルトポート
EXPOSE 3000

# アプリの起動コマンドを明示的に指定
CMD ["node", "index.js"]
