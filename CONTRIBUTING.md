# Contributing

`textlint-rule-preset-ja-aifirst` への貢献方法と運用規約。

## dogfood の textlint-disable 規約

本リポジトリの `README.md` / `docs/RATIONALE.md` / `CHANGELOG.md` は preset 自身で lint されます (`npm run lint:dogfood`)。

`<!-- textlint-disable rule-name -->` を使う場合、以下を遵守してください。

1. ファイル全体の `<!-- textlint-disable -->` (rule 名なし) は禁止
2. 必ず特定 rule 名を指定して局所化する: `<!-- textlint-disable ja-no-weak-phrase -->`
3. 範囲を `<!-- textlint-enable ... -->` で閉じる
4. 直前のコメントで「なぜ disable するのか」を 1 行で残す

例 (CHANGELOG.md):

```markdown
<!-- 弱表現の例 (「と思います」「かもしれない」) を引用するため一時 disable -->
<!-- textlint-disable ja-no-weak-phrase -->

- `ja-no-weak-phrase`: 弱表現 (「と思います」「かもしれない」等) を検出

<!-- textlint-enable ja-no-weak-phrase -->
```

PR 内で `textlint-disable` を増やす場合、PR description で理由を justify してください。本文を直せる箇所を disable で誤魔化すのは preset の主張を弱めます。

## ルール追加時のチェックリスト

新規ルール (npm 既成 / 独自) を追加する場合の手順。

1. `index.js` の `rules` / `rulesConfig` に登録 (preset 利用者向け)
2. `.textlintrc.json` の `rules` に追加 (dogfood 用、preset と同じオプションで揃える)
3. `README.md` の「含まれるルール」セクションに行を追加
4. `docs/RATIONALE.md` §4 (各ルールと根拠の対応関係) に行を追加 (どの AI grep 特性に対応するか明記)
5. (npm 既成 rule のみ) `test/ng/<rule-name>.md` の fixture を作成
6. (npm 既成 rule のみ) `tools/test-ng.mjs` の `EXPECTATIONS` に `mustHit` と `min` を登録
7. (独自 rule のみ) `tools/test-custom-rules.mjs` に `invalid` / `valid` ケースを追加
8. `CHANGELOG.md` の `### Added` に記載

独自 rule は textlint の rule resolver 仕様で `test:ng` の対象外です (`.textlintrc.json` には npm package 名でしか登録できないため)。代わりに `tools/test-custom-rules.mjs` で `@textlint/kernel` API 経由の inline テストを実行します。

## 動作確認

PR 作成前に以下を実行してください。

```sh
npm install
npm test
```

`npm test` は 4 stage:

- `lint:ok`: `test/ok/correct-usage.md` で false positive 検証
- `test:ng`: `tools/test-ng.mjs` で fixture が想定 rule で発火することを保証 (manifest ベース)
- `test:custom`: `tools/test-custom-rules.mjs` で独自 rule の inline unit test
- `lint:dogfood`: `README.md` / `docs/RATIONALE.md` / `CHANGELOG.md` を preset で lint

## コミット規約

- Conventional Commits を採用 (`feat` / `fix` / `chore(release)` / `test` / `docs` / `refactor` 等)
- 大きな変更は機能 commit と release commit に分割

## ライセンス

ISC (本リポジトリの LICENSE と同一)
