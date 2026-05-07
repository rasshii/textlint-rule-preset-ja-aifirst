# 正しい表記の例 (OK: false positive 検証用)

このファイルは prh / ja-hiragana / jtf-style / AI 文書品質ルールのすべてを満たす正しい表記のみを含みます。
textlint がエラーを **検出してはいけません**。

## AI モデル名 (正)

ChatGPT は OpenAI が開発しました。
GPT-4 や GPT-3.5、GPT-4o などのモデルがあります。
Claude は Anthropic のモデルです。
Gemini は Google のモデルです。
Copilot は GitHub の AI ペアプログラマーです。
DALL-E や Stable Diffusion、Midjourney は画像を生成します。
Mistral も注目されています。

## AI 概念 (正)

LLM は大規模言語モデルの略です。
プロンプトの工夫をプロンプトエンジニアリングと呼びます。
トークンの数で課金されることが多いです。
エンベディングはベクトル化のことです。
ベクトルデータベースに保存して RAG を構築します。
ファインチューニングや RLHF でモデルを調整します。
MCP (Model Context Protocol) で AI とツールを接続できます。
ハルシネーションを抑える工夫が必要です。
Few-shot や Zero-shot、Chain of Thought の手法が知られています。

## AI 企業 (正)

OpenAI、Anthropic、DeepMind、Meta AI、Hugging Face が代表的です。
LangChain や LangGraph、LlamaIndex などのライブラリも有名です。

## 開発ツール (正)

Markdown で文書を書きます。
JSON や JSONL、YAML でデータを表現します。
Docker でコンテナ化し、Kubernetes (K8s) でオーケストレーションします。
CLI や IDE、VS Code を使い、GitHub にコードを送ります。
Node.js のサーバーを npm で管理し、API を提供します。

## プログラミング言語 (正)

JavaScript で書かれた jQuery を使います。
ECMAScript 5 の仕様を確認します。

## 略語の括弧表記 (正)

Open Source Software (OSS) を使います。
JavaScript (JS) で書きます。
Large Language Model (LLM) は AI 技術の中核です。

## 文末句点 (正)

これは API です。
別の文にも句点がついています。

## 同一語の連続 (正、繰り返しなし)

テストを実行します。
データを取得します。

## 強い言明 (正、弱い表現なし)

この機能は動作します。
仕様どおりに実装されています。

## バッククォート識別子 (正、no-unbacktick-identifier の false positive 検証)

依存追加は `npm install` を実行します。
雛形は `npx create-next-app` で作成します。
依存追加は `yarn add some-pkg` で行います。
高速化のため `pnpm install` を選びます。

コードブロック内のコマンドは検出対象外です。

```sh
npm install
yarn add some-pkg
pnpm install
```

Markdown link 内のラベルにあっても誤検知しません。詳細は [npm 公式](https://www.npmjs.com/) を参照します。

