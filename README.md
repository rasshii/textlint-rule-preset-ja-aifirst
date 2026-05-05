# original-text-lint

[textlint](https://github.com/textlint/textlint) で日本語文書の表記揺れ・スタイル違反をチェックする個人設定リポジトリ。

AI による grep 検索の精度を上げるため、固有名詞や専門用語の表記揺れを排除することを目的とする。

## 使い方

```sh
npm install
npm run lint           # test/ 配下の Markdown をチェック
npm run fix            # 自動修正できるルールは fix
npx textlint <path>    # 任意ファイルをチェック
```

## 含まれるルール

| ルール | 用途 |
|---|---|
| `prh` | 表記揺れ辞書 (`prh.yml`)。固有名詞の正規化 |
| `preset-jtf-style` | JTF 日本語スタイルガイド準拠 |
| `no-dropping-the-ra` | ら抜き言葉検出 (例: 食べれる → 食べられる) |
| `ja-hiragana-fukushi` | 副詞のひらがな化推奨 |
| `ja-hiragana-hojodoushi` | 補助動詞のひらがな化推奨 |
| `ja-hiragana-daimeishi` | 指示代名詞のひらがな化推奨 |
| `ja-keishikimeishi` | 形式名詞のひらがな化推奨 |

## 表記揺れルールの追加

`prh.yml` の `rules:` 配列に追加する。

```yaml
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

## チェックの除外

行コメントで textlint を範囲指定で無効化できる (`textlint-filter-rule-comments`)。

```markdown
<!-- textlint-disable -->
この範囲は表記揺れチェック対象外。
<!-- textlint-enable -->
```

## 他リポからの利用 (Phase 1 以降)

GitHub Actions の reusable workflow から呼び出して、各 docs リポで PR ごとに自動チェックする運用を想定している。

## ライセンス

ISC
