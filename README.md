# 夕礼グループ分けアプリ

Google Calendar APIから「夕礼（隔週1回）」の参加者を取得し、指定した数でグループ分けを行うWebアプリケーション。前回のグループ分けを記憶し、連続で同じメンバーにならないよう調整します。

## 技術スタック

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Google Calendar API**
- **OpenAI API**
- **Upstash Redis**

## ローカル開発

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成し、必要な環境変数を設定します：

```bash
# Google Calendar API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Upstash Redis
UPSTASH_REDIS_URL=your_upstash_redis_url
UPSTASH_REDIS_TOKEN=your_upstash_redis_token
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3000 で実行されます。

## Vercelへのデプロイ手順

### 1. 環境変数の設定

Vercelにデプロイする前に、必要な環境変数を設定する必要があります。以下のコマンドを実行して環境変数を追加します：

```bash
# Vercel CLIをインストール（まだの場合）
npm install -g vercel

# 環境変数の設定
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GOOGLE_REFRESH_TOKEN
vercel env add OPENAI_API_KEY
vercel env add UPSTASH_REDIS_URL
vercel env add UPSTASH_REDIS_TOKEN
```

各コマンドを実行すると、対応する環境変数の値を入力するプロンプトが表示されます。

### 2. デプロイの実行

```bash
# 初回デプロイ（プロジェクト設定）
vercel

# 本番環境へのデプロイ
vercel --prod
```

### 3. GitHubとの連携によるCI/CD

1. GitHubリポジトリとVercelプロジェクトを連携します（Vercelダッシュボードから設定可能）
2. `main`ブランチへのプッシュで自動デプロイが行われるように設定します

```bash
# 変更をコミット
git add .
git commit -m "feat: 機能追加やバグ修正の説明"

# GitHubにプッシュ（自動デプロイが開始されます）
git push origin main
```

### 4. デプロイ状況の確認

```bash
# デプロイ一覧の確認
vercel ls

# デプロイログの確認
vercel logs

# ドメイン設定の確認
vercel domains ls
```

## 外部サービスの設定

### Google Cloud Platform

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Google Calendar APIを有効化
3. OAuth認証情報を作成
4. リフレッシュトークンを取得

### OpenAI

1. [OpenAI Platform](https://platform.openai.com/)でアカウント作成
2. API Keyを発行

### Upstash Redis

1. [Upstash](https://upstash.com/)でアカウント作成
2. Redisデータベースを作成
3. 接続情報（URL, Token）を取得

## 機能一覧

1. **カレンダー連携**
   - Google Calendar APIから夕礼の参加者を自動取得
   - 出席予定者のみ抽出

2. **グループ分け**
   - グループ数を手動指定
   - OpenAI APIによる最適なグループ分け（前回との重複最小化）
   - Upstash Redisによる履歴保存

3. **表示機能**
   - グループ一覧表示
   - 前回との変更点表示
   - 手動での参加者追加・編集

## トラブルシューティング

### 環境変数の設定

本アプリケーションは以下の環境変数が必要です：

- Google Calendar API: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- OpenAI API: `OPENAI_API_KEY`
- Upstash Redis: `UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN`

これらの環境変数が設定されていない場合、アプリケーションの一部または全部の機能が正常に動作しない可能性があります。本番環境では、すべての環境変数を適切に設定してください。

### ビルドエラーが発生する場合

1. 依存関係が正しくインストールされているか確認
   ```bash
   npm ci
   ```

2. キャッシュをクリアしてビルド
   ```bash
   npm run build -- --no-cache
   ```

3. Vercelのログを確認
   ```bash
   vercel logs your-deployment-url
   ```
