# textlint-rule-preset-ja-aifirst

[textlint](https://github.com/textlint/textlint) preset for AI-friendly Japanese writing.

AI 時代の高品質な日本語文書を書くための textlint preset。以下の 3 つを 1 つにまとめています:

1. **用語表記の統一** — AI による grep 検索の精度を上げるため、固有名詞・専門用語の表記揺れを排除 (内蔵 prh 辞書: AI モデル名・AI 概念・AI 企業・開発ツールの約 50 ルール)
2. **文体の品質** — AI 生成文書で頻発する問題 (です・ます混在、冗長表現、文長過多、読点濫用、助詞重複) を検出
3. **日本語の規範性** — JTF 日本語スタイルガイド準拠 (技術文書慣習に合わせて一部ルールは無効化)

## 他の preset との違い

| preset | 目的 |
|---|---|
| `textlint-rule-preset-ja-aifirst` (本 preset) | **AI 時代の高品質日本語文書 — 表記統一 + 文体品質 + 規範性** |
| [`textlint-rule-preset-ai-writing`](https://github.com/textlint-ja/textlint-rule-preset-ai-writing) | AI が書いた文章を人間らしく直す (AI 風文体・冗長リスト等の検出) |
| [`textlint-rule-preset-ja-technical-writing`](https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing) | 技術文書全般のスタイルガイド (本 preset の文体ルール部分の参照元) |
| [`textlint-rule-preset-jtf-style`](https://github.com/textlint-ja/textlint-rule-preset-jtf-style) | JTF 日本語標準スタイルガイド準拠 (本 preset 内蔵) |

## インストール (利用側)

```sh
npm install --save-dev textlint github:rasshii/textlint-rule-preset-ja-aifirst
```

特定バージョンに固定したい場合:

```sh
npm install --save-dev textlint github:rasshii/textlint-rule-preset-ja-aifirst#v1.0.1
```

## 使い方 (`.textlintrc.json`)

最小設定 (preset を全部有効化):

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

独自 prh.yml をマージ (プロジェクト固有辞書を追加):

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

### 表記統一

| ルール | 用途 |
|---|---|
| `prh` | **AI モデル名 / AI 概念 / AI 企業 / 開発ツールの表記揺れ統一** (`prh.yml` 内蔵、約 50 ルール) |
| `no-mixed-zenkaku-and-hankaku-alphabet` | 全角・半角英字の混在検出 (例: ＣｈａｔＧＰＴ → ChatGPT) |

### 文体品質 (AI 生成文の頻出問題対策)

| ルール | 用途 | デフォルト設定 |
|---|---|---|
| `no-mix-dearu-desumasu` | です・ます と である の混在検出 | 本文「ですます」、リスト「である」 |
| `ja-no-redundant-expression` | 冗長表現検出 (「することができる」→「できる」等) | enabled |
| `sentence-length` | 一文の長さ制限 | `max: 100` 文字 |
| `max-ten` | 一文中の読点濫用検出 | `max: 4` 個 |
| `no-doubled-joshi` | 同一文内の助詞重複検出 (「が…が」等) | enabled |
| `max-kanji-continuous-len` | 連続漢字制限 | `max: 6` 文字 |

### 規範性 (日本語スタイル)

| ルール | 用途 |
|---|---|
| `preset-jtf-style` | JTF 日本語スタイルガイド準拠 (一部無効化、後述) |
| `no-dropping-the-ra` | ら抜き言葉検出 (例: 食べれる → 食べられる) |
| `ja-hiragana-fukushi` | 副詞のひらがな化推奨 |
| `ja-hiragana-hojodoushi` | 補助動詞のひらがな化推奨 |
| `ja-hiragana-daimeishi` | 指示代名詞のひらがな化推奨 |
| `ja-keishikimeishi` | 形式名詞のひらがな化推奨 (`detection_hou_kata: false`, `detection_ue: false`) |

### Filter

| Filter | 用途 |
|---|---|
| `comments` | `<!-- textlint-disable -->` / `<!-- textlint-enable -->` でルールを部分無効化 |

## 主な無効化ルール

AI 文書 / 技術文書慣習に合わせて、`preset-jtf-style` の以下のルールはデフォルトで **無効化** しています。

| ルール | 無効化の理由 |
|---|---|
| `3.1.1.全角文字と半角文字の間` | 「ChatGPT は OpenAI が」のような半角スペース表記を許容 (Vue/Nuxt 公式日本語、Zenn、Qiita など技術文書慣習に合わせる) |
| `4.2.7.コロン(：)` | AI prompt で頻出する半角 `:` (例: `Note:`、`Example:`) を許容 |

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

このリポジトリの `prh.yml` を直接編集するか、利用側で独自 `project-prh.yml` を作って `rulePaths` に追加する。

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

`specs:` のテストケースが失敗すると `prh.yml` 全体の load が失敗する。追加時は必ずテストケースを書く。

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
│   ├── programming-langs.md     # JavaScript, jQuery, ECMAScript (既存ルール)
│   ├── ja-hiragana.md           # ら抜き / 副詞 / 補助動詞ひらがな化
│   ├── jtf-style.md             # JTF style guide 違反
│   ├── style-mix.md             # です・ます と である の混在
│   ├── redundant.md             # 冗長表現
│   ├── sentence-length.md       # 文長過多
│   ├── max-ten.md               # 読点濫用
│   ├── doubled-joshi.md         # 助詞重複
│   ├── kanji-continuous.md      # 連続漢字過多
│   └── mixed-alphabet.md        # 全角・半角英字混在
└── ok/
    └── correct-usage.md         # 正例 (false positive 検証用)
```

要件: Node.js 18+ (prh.yml 内の lookbehind regex を使用)

## ライセンス

ISC
