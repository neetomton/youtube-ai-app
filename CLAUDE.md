# J-Creator AI Sync — プロジェクト仕様書 (CLAUDE.md)

本ドキュメントは、日本のクリエイター向けに特化したコンテンツ再利用（リパーパス）SaaS
**J-Creator AI Sync** の仕様書です。Claude Code が実装を進める際のリファレンスとします。

## プロジェクト概要

クリエイターが YouTube やポッドキャストのコンテンツを作成した後、配信先のプラットフォーム
（note / LINE 公式アカウント / X）ごとに最適なフォーマット・文字数・トーンで書き直すのは
大きな負担です。本アプリはこの再加工を AI で自動化します。

## 技術スタック

- **フロントエンド / バックエンド**: Next.js (App Router) / TypeScript
- **スタイリング / UI**: Tailwind CSS + Shadcn UI
- **データベース / 認証**: Supabase
- **AI / API**: OpenAI (Whisper で音声文字起こし) + GPT-4o / Claude 3.5 Sonnet（テキスト生成）
- **デプロイ**: Vercel

## コア機能 (PRD)

1. **ユーザー認証**
   - Supabase Auth によるメール/パスワード認証または Google OAuth
2. **メディア入力**
   - 音声ファイル（.mp3, .m4a）のアップロード UI
   - （拡張）YouTube URL 指定による音声抽出
3. **AI 処理パイプライン（プロンプトチェーン）**
   - Step 1: Whisper で日本語トランスクリプトを生成
   - Step 2: LLM で以下 3 種を並行生成
     - **note 用**: 見出し(H2/H3)・目次・段落のある長文ブログ形式
     - **LINE 公式用**: 吹き出しに馴染む短文、親しみやすいトーン、絵文字と改行多用
     - **X 用**: 140 字以内、フック・ハッシュタグ付き、スレッド提案可
4. **出力・編集・管理**
   - 1 ダッシュボードで 3 出力を横並び表示
   - その場で手動編集できるエディタ
   - ワンクリックコピー
   - 生成履歴を Supabase に保存し再閲覧可能

## データベーススキーマ (Supabase)

```sql
-- users (auth.users と連携)
id         uuid primary key
email      text
created_at timestamptz default now()

-- content_generations
id                uuid primary key
user_id           uuid references users(id)
original_filename text
transcription     text
note_content      text
line_content      text
x_content         text
created_at        timestamptz default now()
```

## 開発フェーズ

- **Phase 1**: Next.js 初期化 + Shadcn UI ダッシュボードのモックアップ
- **Phase 2**: Supabase セットアップ + 認証実装
- **Phase 3**: ファイルアップロード + Whisper 文字起こし
- **Phase 4**: LLM 呼び出し + 3 プラットフォーム向けプロンプトエンジニアリング
- **Phase 5**: 履歴保存 + Vercel 本番デプロイ

## リポジトリ構成

Next.js アプリは `j-creator-ai/` サブディレクトリに配置します。ルートの `app.py` と
`requirements.txt` は別プロジェクト（Streamlit 製 YouTube コメント解析）で、本プロジェクト
とは独立しています。

## 開発ブランチ

`claude/ai-content-repurposing-KyW9n`
