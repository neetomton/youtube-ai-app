# J-Creator AI Sync

日本のクリエイター向けに、YouTube / ポッドキャストの音声 1 本を
**note / LINE 公式 / X (旧 Twitter)** の 3 プラットフォーム向けに
最適化されたテキストへまとめて変換する AI リパーパス SaaS です。

- ファイルをドラッグ＆ドロップ → Whisper で日本語文字起こし
- GPT-4o クラスの LLM で 3 プラットフォームに並列リライト
- note: 見出し・目次つき長文ブログ
- LINE: 吹き出しに馴染む短文＋絵文字
- X: 140 字以内のフック付きポスト
- 生成履歴は Supabase に自動保存、いつでも再編集／コピー

## 技術スタック

- Next.js 16 (App Router, Server Actions, React 19 `useActionState`)
- Tailwind CSS 4 + Shadcn UI
- Supabase (Auth + Postgres + Row Level Security)
- OpenAI API (Whisper `whisper-1` + Chat Completions)
- Vercel でホスティング想定

## 必要な環境変数

`.env.local.example` をコピーして `.env.local` を作成し、以下を設定してください。

| 変数名 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | （任意）管理者操作用 |
| `OPENAI_API_KEY` | OpenAI API キー |
| `OPENAI_MODEL` | （任意）既定は `gpt-4o-mini`。品質優先なら `gpt-4o` |

## ローカル開発

```bash
# 1. Supabase プロジェクトを作成し、SQL Editor で初期スキーマを流す
#    supabase/migrations/0001_init.sql

# 2. 依存インストール
npm install

# 3. 環境変数
cp .env.local.example .env.local
# エディタで値を埋める

# 4. 開発サーバー
npm run dev
# → http://localhost:3000
```

最初に `/signup` からアカウントを作成、確認メールのリンクをクリック
してからログインしてください。

## Vercel へのデプロイ

1. このリポジトリを GitHub に push（済）。
2. https://vercel.com/new から Import Project → リポジトリを選択。
3. **Root Directory** を `j-creator-ai` に設定。
4. **Environment Variables** に上表の値を登録。
   - Production / Preview の両方に設定することを推奨。
5. Deploy を実行。

### 注意点

- Whisper / LLM 呼び出しは時間がかかるため、
  `vercel.json` でサーバー関数のタイムアウトを 60 秒に引き上げています。
  さらに伸ばす場合は Pro プラン以上にアップグレードのうえ、
  `vercel.json` の `maxDuration` と
  `src/app/generations/[id]/page.tsx` の `export const maxDuration`
  を最大 300 まで上げてください。
- Supabase 側では `supabase/migrations/0001_init.sql` の実行が必要です
  （`profiles` / `content_generations` テーブル + RLS ポリシー）。
- Supabase Auth の **Site URL** と **Redirect URLs** に、Vercel の
  Production ドメインと `/auth/callback` を追加してください。

## 開発フェーズ

- [x] Phase 1: ダッシュボードの UI モックアップ
- [x] Phase 2: Supabase Auth + ルート保護
- [x] Phase 3: 音声アップロード + Whisper 文字起こし
- [x] Phase 4: LLM で note / LINE / X に並列リパーパス
- [x] Phase 5: 履歴保存 + Vercel デプロイ準備

## ディレクトリ構成（抜粋）

```
src/
├── app/
│   ├── actions/        # "use server" Server Actions (auth / transcribe / generate)
│   ├── auth/callback/  # Supabase OAuth / メール認証の戻り先
│   ├── generations/[id]/ # 文字起こし＋プラットフォーム別結果ページ
│   ├── login/ signup/  # 認証ページ
│   └── page.tsx        # ダッシュボード（アップロード + 履歴）
├── components/
│   ├── auth/           # ログイン / 登録フォーム (Client Component)
│   ├── ui/             # Shadcn UI
│   ├── generated-output-card.tsx
│   ├── generate-trigger.tsx
│   ├── history-section.tsx
│   ├── site-header.tsx
│   └── upload-panel.tsx
├── lib/
│   ├── db/generations.ts   # content_generations へのアクセス
│   ├── llm/                # プロンプトと GPT-4o 呼び出し
│   ├── openai/             # OpenAI クライアント + 環境変数
│   └── supabase/           # SSR クライアント + 環境変数 + proxy セッション更新
└── proxy.ts            # Next.js 16 のルート保護 (middleware 後継)
```
