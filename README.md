# 夕礼グループ分けアプリ

参加者を手動で入力し、指定した数でグループ分けを行うWebアプリケーション。前回のグループ分けを記憶し、連続で同じメンバーにならないよう調整します。メンバーリストはRedisに保存され、次回利用時に再利用できます。

## 技術スタック

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **OpenAI API** (グループ分け最適化)
- **Upstash Redis** (メンバーリストと履歴保存)

## ローカル開発

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成し、必要な環境変数を設定します：

```bash
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

### OpenAI

1. [OpenAI Platform](https://platform.openai.com/)でアカウント作成
2. API Keyを発行

### Upstash Redis

1. [Upstash](https://upstash.com/)でアカウント作成
2. Redisデータベースを作成
3. 接続情報（URL, Token）を取得

## 機能一覧

1. **メンバー管理**
   - メンバーの手動追加・編集・削除
   - メンバーリストのRedisへの保存
   - 保存したメンバーリストの読み込み

2. **グループ分け**
   - グループ数を手動指定
   - OpenAI APIによる最適なグループ分け（前回との重複最小化）
   - Upstash Redisによる履歴保存

3. **表示機能**
   - グループ一覧表示
   - 前回との変更点表示

## トラブルシューティング

### 環境変数の設定

本アプリケーションは以下の環境変数が必要です：

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
