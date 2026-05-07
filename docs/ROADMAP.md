# Roadmap

> 本 preset の将来計画。「予定」ではなく「**候補 (tentative)**」として扱い、quarterly review で更新する。
> 過去のリリース内容は [CHANGELOG.md](../CHANGELOG.md) を参照。

## 現在の状態

- v1.2.0 (2026-05-07): AI grep 最適化 Phase 2 — `no-vague-heading` 独自ルール
- v1.1.0 (2026-05-07): AI grep 最適化 Phase 1 — `abbr-within-parentheses` / `ja-no-mixed-period` / `ja-no-successive-word` / `ja-no-weak-phrase` / `ja-no-abusage` / `no-unbacktick-identifier` を統合

## v1.3.0 候補 (運用シグナル待ち)

### `no-vague-heading` の default 拡張

`vagueWords` の default を空配列 `[]` から推奨セット例 `['TIPS', 'Tips', 'TBD', 'FYI', 'WIP']` に拡張するか判断する。

判断基準:
- v1.2.0 利用者の Issue / 採用報告から「default 値があった方が便利」というシグナルが顕在化した場合
- 一方、Keep a Changelog 規約の `### Notes` 等、一般的な見出し慣習との衝突報告が多ければ default 空維持

### `no-duplicate-heading` (新規候補)

同一文書内で同じ見出しが複数回出現する場合に警告。AI grep の起点として「どの section の話か」が確定できないため。

### `no-broken-anchor` (新規候補)

Markdown 内の `[text](#anchor)` 形式リンクで、参照先見出しが存在しない場合に警告。AI が文書内ナビゲーションで follow できないリンクを検出。

## v1.4.0+ 検討中

### 指示語排除 (これ / それ / あれ)

false positive 過多のため見送り中。文脈条件 (見出し直下のみ等) を限定する手法が確立できれば再検討。

### 主語省略検出

kuromoji フル活用で工数特大、効果不明。形態素ベースで主語省略の害が定量化されれば再検討。

### 段落内 paraphrase 禁止

同義語辞書が必須で実装特大。軽量な同義語辞書による方式が確立できれば再検討。

## 不採用 (現時点)

### preset-ai-writing 取り込み

責務分離のため独立維持。利用者の声を見て統合需要が顕在化したら再検討。
詳細: [docs/RATIONALE.md](./RATIONALE.md) §5

## コントリビュート

新規ルール候補や Phase 3 提案は Issue で歓迎します。
[CONTRIBUTING.md](../CONTRIBUTING.md) の dogfood 規約と test 整備チェックリストを参照してください。
