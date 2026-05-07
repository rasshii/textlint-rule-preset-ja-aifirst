# Changelog

すべての主要な変更はこのファイルに記載されます。

このプロジェクトは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) 形式を採用し、[Semantic Versioning](https://semver.org/lang/ja/) に従います。

## [1.1.0] - 2026-05-07

主要 LLM コーディングアシスタント (Claude Code / Cursor / Devin) が ripgrep ベースの agentic search を採用している事実を踏まえ、AI grep の精度を最大化する日本語ガードを preset の core 責務として明示化したリリース。

### Added

- AI grep 最適化ルール (Phase 1) を統合
  - `abbr-within-parentheses`: 略語の括弧表記 (`Open Source Software (OSS)` 形式) を強制
  - `ja-no-mixed-period`: 文末句点の徹底 (`forceAppendPeriod: false` で検出のみ)
  - `ja-no-successive-word`: 同一語の連続検出 (`allowOnomatopee: true`)
  - `ja-no-weak-phrase`: 弱表現 (「と思います」「かもしれない」等) を検出
  - `ja-no-abusage`: 日本語の誤用検出
- 独自ルール `no-unbacktick-identifier` を新規実装 ([rules/no-unbacktick-identifier.js](./rules/no-unbacktick-identifier.js))
  - npm / npx / yarn / pnpm コマンドのバッククォート未使用を検出 (デフォルト)
  - `patterns` オプションで独自パターン (関数名・型名等) を追加可能
- README.md に「なぜ AI grep に最適化された日本語が必要か」セクションを新設
  - 4 軸比較表 (RAG vs Agentic grep)
  - Boris Cherny (Anthropic, Claude Code lead) と Amazon Science からの一次引用
- [docs/RATIONALE.md](./docs/RATIONALE.md) を新規作成
  - 改善根拠と各ルールの対応関係 (§4) を永続化
  - 全出典 (一次資料・二次資料・反対意見) と運用ルール (§7) を整理
- `test/ng/` に 5 fixture を追加 (各 Phase 1 ルールの検出を保証)
- `test/ok/correct-usage.md` に Phase 1 対応の正例を追記

### Changed

- `package.json` の `files` フィールドに `rules/`, `docs/`, `CHANGELOG.md` を追加
  - 利用側で独自ルール (`no-unbacktick-identifier`) を解決するため `rules/` が必須
- `package.json` の `description` を AI grep 最適化文脈に更新

### Notes

- `prh.yml` は 52 ルール (AI モデル / AI 概念 / AI 企業 / 開発ツールの表記揺れ)
- 独自ルールの fixture テストは現状 `npm test` の対象外 (textlint の rule resolver は node_modules 経由でしか個別ルールを解決できないため、preset 利用側で動作検証する想定)。Phase 1.x で `tools/test-custom-rules.mjs` の整備を予定

## [1.0.1]

- 前バージョンまでの履歴は [git log](https://github.com/rasshii/textlint-rule-preset-ja-aifirst/commits/main) を参照
