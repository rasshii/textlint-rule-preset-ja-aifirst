# textlint-rule-preset-ja-aifirst

[textlint](https://github.com/textlint/textlint) preset for AI-friendly Japanese writing.

AI 時代の高品質な日本語文書を書くための textlint preset。
**主要 LLM コーディングアシスタント (Claude Code / Cursor / Devin) は ripgrep ベースの agentic search で codebase を読みます**。本 preset は、AI grep の精度を最大化する日本語ドキュメント品質ガードを目的とします。

3 つの観点を 1 つの preset に統合しています:

1. **AI grep の最適化** — 表記揺れ排除 (内蔵 prh 辞書) + 略語の展開明示 + 弱表現排除 + 識別子のバッククォート徹底
2. **文体の品質** — AI 生成文書で頻発する問題 (です・ます混在、冗長表現、文長過多、読点濫用、助詞重複) を検出
3. **日本語の規範性** — JTF 日本語スタイルガイド準拠 (技術文書慣習に合わせて一部ルールは無効化）

## なぜ AI grep に最適化された日本語が必要か

主要な LLM コーディングアシスタントは、ベクトル検索（RAG）ではなく **ripgrep ベースの agentic search** で codebase を読みます。これは複数のソースで裏付けられています。

> "Initially, Claude Code experimented with RAG and a local vector database, but agentic search outperformed it overwhelmingly."
> — Boris Cherny, Anthropic, [Latent Space podcast (2025-05)](https://www.latent.space/p/claude-code)

> "Keyword search via agentic tool use achieves over 90% of RAG performance without a vector database."
> — Amazon Science, [Beyond Embeddings (2026-02)](https://www.amazon.science/publications/agentic-search-without-embeddings)

採用理由は次の 4 軸です。

| 軸 | RAG (ベクトル検索) | Agentic grep |
|---|---|---|
| Precision | 類似度で誤 hit (fuzzy positive) | 完全一致のみ、失敗が明示 (0 件) |
| Freshness | index 再構築要、編集中はズレる | 現在のファイル状態を直接検索 |
| Privacy | エンベディング 計算で外部送信 | ローカル完結 |
| Structural relationships | imports / function calls が エンベディング で表現困難 | 完全一致で structural な関係を取れる |

この特性は日本語ドキュメントの書き方にも要件を課します。本 preset はそれぞれに対応するルールを提供します。

| AI grep の特性 | 必要な日本語の性質 | 本 preset での対応ルール |
|---|---|---|
| 完全一致のみ hit | 表記揺れ排除 | `prh` (内蔵 52 ルール) |
| chunk 分割なし、文単位読み | 文の境界明示 | `ja-no-mixed-period` |
| 失敗が「0 件」 | 略語の展開明示 | `abbr-within-parentheses` |
| Iterative refinement | 弱表現排除で言明確定 | `ja-no-weak-phrase` |
| 識別子の完全一致 hit | 関数名やコマンドのバッククォート | `no-unbacktick-identifier` (独自) |
| 構造的関係を活用 | 見出し階層の意味化 | `no-vague-heading` (Phase 2 で導入予定) |

**詳細な根拠・全出典・各ルールと根拠の対応関係**: [docs/RATIONALE.md](./docs/RATIONALE.md) を参照してください。

## 他の preset との違い

| preset | 目的 | 本 preset との関係 |
|---|---|---|
| `textlint-rule-preset-ja-aifirst` (本 preset) | **AI grep 最適化 — 表記統一 + 文の独立性 + 構造的曖昧性の排除** | — |
| [`textlint-rule-preset-ai-writing`](https://github.com/textlint-ja/textlint-rule-preset-ai-writing) | AI が書いた文章を人間らしく直す (AI 風文体や冗長リスト等の検出) | **併用推奨**。本 preset が「読み手 (AI grep) 最適化」、ai-writing が「書き手 (AI) 検出」で役割分担 |
| [`textlint-rule-preset-ja-technical-writing`](https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing) | 技術文書全般のスタイルガイド (本 preset の文体ルール部分の参照元) | 文体ルールの参照元 |
| [`textlint-rule-preset-jtf-style`](https://github.com/textlint-ja/textlint-rule-preset-jtf-style) | JTF 日本語標準スタイルガイド準拠 (本 preset 内蔵) | 内蔵 |

## インストール (利用側)

```sh
npm install --save-dev textlint github:rasshii/textlint-rule-preset-ja-aifirst
```

特定バージョンに固定したい場合:

```sh
npm install --save-dev textlint github:rasshii/textlint-rule-preset-ja-aifirst#v1.1.0
```

## 使い方 (`.textlintrc.json`)

最小設定 (preset を全部有効化）:

```json
{
  "rules": {
    "preset-ja-aifirst": true
  }
}
```

特定ルールを無効化:

```json
{
  "rules": {
    "preset-ja-aifirst": {
      "no-dropping-the-ra": false
    }
  }
}
```

独自 `prh.yml` をマージ (プロジェクト固有辞書を追加):

```json
{
  "rules": {
    "preset-ja-aifirst": {
      "prh": {
        "rulePaths": [
          "./node_modules/textlint-rule-preset-ja-aifirst/prh.yml",
          "./project-prh.yml"
        ]
      }
    }
  }
}
```

実行:

```sh
npx textlint "docs/**/*.md"
npx textlint --fix "docs/**/*.md"   # 自動修正
```

## 含まれるルール

<!-- textlint-disable ja-no-weak-phrase -->

### AI grep 最適化 (Phase 1)

| ルール | 用途 | デフォルト設定 |
|---|---|---|
| `prh` | **AI モデル名 / AI 概念 / AI 企業 / 開発ツールの表記揺れ統一** (`prh.yml` 内蔵、52 ルール) | enabled |
| `abbr-within-parentheses` | 略語の括弧表記 (`OSS(Open Source Software)` → `Open Source Software (OSS)`) | enabled |
| `ja-no-mixed-period` | 文末句点の徹底 | `forceAppendPeriod: false` (検出のみ) |
| `ja-no-weak-phrase` | 弱表現 (「かもしれない」「と思います」) を検出 | enabled |
| `no-unbacktick-identifier` | コマンドや識別子をバッククォートで囲む (`npm install` → `` `npm install` ``) | enabled (デフォルトパターンは npm/npx/yarn/pnpm のみ) |
| `ja-no-successive-word` | 同一語の連続 (AI 出力のノイズ) を検出 | `allowOnomatopee: true` |
| `ja-no-abusage` | 日本語の誤用 (「値を返す」等) を検出 | enabled |

<!-- textlint-enable ja-no-weak-phrase -->

### 表記統一

| ルール | 用途 |
|---|---|
| `no-mixed-zenkaku-and-hankaku-alphabet` | 全角・半角英字の混在検出 (例: ChatGPT → ChatGPT) |

### 文体品質 (AI 生成文の頻出問題対策)

| ルール | 用途 | デフォルト設定 |
|---|---|---|
| `no-mix-dearu-desumasu` | です・ます と である の混在検出 | 本文「ですます」、リスト「である」 |
| `ja-no-redundant-expression` | 冗長表現検出 (「することができる」→「できる」等) | enabled |
| `sentence-length` | 一文の長さ制限 | `max: 100` 文字 |
| `max-ten` | 一文中の読点濫用検出 | `max: 4` 個 |
| `no-doubled-joshi` | 同一文内の助詞重複検出 (「が…が」等) | enabled |
| `max-kanji-continuous-len` | 連続漢字制限 | `max: 6` 文字 |

<!-- textlint-disable no-dropping-the-ra -->

### 規範性 (日本語スタイル)

| ルール | 用途 |
|---|---|
| `preset-jtf-style` | JTF 日本語スタイルガイド準拠 (一部無効化、後述) |
| `no-dropping-the-ra` | ら抜き言葉検出 (例: 食べれる → 食べられる) |
| `ja-hiragana-fukushi` | 副詞のひらがな化推奨 |
| `ja-hiragana-hojodoushi` | 補助動詞のひらがな化推奨 |
| `ja-hiragana-daimeishi` | 指示代名詞のひらがな化推奨 |
| `ja-keishikimeishi` | 形式名詞のひらがな化推奨 (`detection_hou_kata: false`, `detection_ue: false`) |

<!-- textlint-enable no-dropping-the-ra -->

### Filter

| Filter | 用途 |
|---|---|
| `comments` | `<!-- textlint-disable -->` / `<!-- textlint-enable -->` でルールを部分無効化 |

## 主な無効化ルール

AI 文書 / 技術文書慣習に合わせて、`preset-jtf-style` の以下のルールはデフォルトで **無効化** しています。

| ルール | 無効化の理由 |
|---|---|
| `3.1.1.全角文字と半角文字の間` | 「ChatGPT は OpenAI が」のような半角スペース表記を許容 (Vue/Nuxt 公式日本語、Zenn、Qiita など技術文書慣習に合わせる) |
| `4.2.7.コロン(：)` | AI プロンプトで頻出する半角 `:` (例: `Note:`、`Example:`) を許容 |
| `4.3.1.丸かっこ（）` | `abbr-within-parentheses` が要求する `Open Source Software (OSS)` 形式 (半角丸括弧) との矛盾解消。AI grep で参照する識別子・コマンド (例: `fetch(url)`、`Promise.all()`) は半角 `()` で書くのが慣習 |

利用側で再有効化したい場合:

```json
{
  "rules": {
    "preset-ja-aifirst": {
      "preset-jtf-style": {
        "3.1.1.全角文字と半角文字の間": true,
        "4.2.7.コロン(：)": true
      }
    }
  }
}
```

## 表記揺れルールの追加

このリポジトリの `prh.yml` を直接編集するか、利用側で独自 `project-prh.yml` を作って `rulePaths` に追加します。

```yaml
version: 1
rules:
  - expected: TypeScript
    patterns:
      - /typescript/i
      - /Type Script/i
    specs:
      - from: typescript
        to: TypeScript
      - from: TypeScript
        to: TypeScript
```

`specs:` のテストケースが失敗すると `prh.yml` 全体の load が失敗します。追加時は必ずテストケースを書いてください。

## 開発 (このリポを直接編集する場合)

```sh
git clone https://github.com/rasshii/textlint-rule-preset-ja-aifirst.git
cd textlint-rule-preset-ja-aifirst
npm install
npm test               # test/ok/ で false positive 検証 + test/ng/ でエラー検出を保証
```

テスト構成:

```text
test/
├── ng/                          # ルール違反を含む (textlint がエラーを出すべき)
│   ├── ai-models.md             # ChatGPT, GPT-4, Claude, Gemini, Copilot 等
│   ├── ai-concepts.md           # LLM, プロンプト, RAG, ファインチューニング 等
│   ├── ai-companies.md          # OpenAI, Anthropic, Hugging Face 等
│   ├── dev-tools.md             # Markdown, JSON, YAML, Docker, GitHub 等
│   ├── programming-langs.md     # JavaScript, jQuery, ECMAScript
│   ├── ja-hiragana.md           # ら抜き / 副詞 / 補助動詞ひらがな化
│   ├── jtf-style.md             # JTF style guide 違反
│   ├── style-mix.md             # です・ます と である の混在
│   ├── redundant.md             # 冗長表現
│   ├── sentence-length.md       # 文長過多
│   ├── max-ten.md               # 読点濫用
│   ├── doubled-joshi.md         # 助詞重複
│   ├── kanji-continuous.md      # 連続漢字過多
│   ├── mixed-alphabet.md        # 全角・半角英字混在
│   ├── abbr-parentheses.md      # 略語が括弧の前 (NG)
│   ├── missing-period.md        # 文末句点欠落
│   ├── successive-word.md       # 同一語の連続
│   ├── weak-phrase.md           # 弱表現
│   └── abusage.md               # 日本語の誤用
└── ok/
    └── correct-usage.md         # 正例 (false positive 検証用)
```

### 独自ルール (`no-unbacktick-identifier`) のローカル検証

独自ルールは preset 経由 (`preset-ja-aifirst/no-unbacktick-identifier`) で利用側で動作します。リポ自身の `.textlintrc.json` では textlint の rule resolver が node_modules 経由でしか個別ルールを解決できない仕様です。そのため独自ルールの fixture テストはローカル `npm test` の対象外です。preset 利用側で動作確認してください。

要件: Node.js 18+ (prh.YAML 内の lookbehind regex を使用）

## ライセンス

ISC
