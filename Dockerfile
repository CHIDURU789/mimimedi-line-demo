FROM node:18

# アプリ作業ディレクトリを設定
WORKDIR /app

# 必要ファイルをコピー
COPY package.json ./
RUN npm install

COPY . .

# ポート番号指定（Cloud Runはポート3000で自動マッピング）
EXPOSE 3000

CMD ["npm", "start"]
