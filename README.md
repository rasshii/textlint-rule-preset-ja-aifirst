# textlint-rule-preset-ja-aifirst

[textlint](https://github.com/textlint/textlint) preset for AI-friendly Japanese writing.

AI による grep 検索の精度を上げるため、固有名詞や専門用語の表記揺れを排除することを目的とした preset。 prh 辞書 + JTF スタイル + ja-hiragana 系ルールを 1 つの preset にまとめている。

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

| ルール | 用途 |
|---|---|
| `prh` | 表記揺れ辞書 (`prh.yml`)。固有名詞の正規化 |
| `preset-jtf-style` | JTF 日本語スタイルガイド準拠 (spread でマージ) |
| `no-dropping-the-ra` | ら抜き言葉検出 (例: 食べれる → 食べられる) |
| `ja-hiragana-fukushi` | 副詞のひらがな化推奨 |
| `ja-hiragana-hojodoushi` | 補助動詞のひらがな化推奨 |
| `ja-hiragana-daimeishi` | 指示代名詞のひらがな化推奨 |
| `ja-keishikimeishi` | 形式名詞のひらがな化推奨 (`detection_hou_kata: false`, `detection_ue: false`) |

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
npm test               # test/sample.md で動作確認
```

## ライセンス

ISC
