<!-- 本ドキュメントは技術的根拠説明書として「である」調で書く方針 -->
<!-- textlint-disable no-mix-dearu-desumasu -->

# 本 preset の設計根拠 (Rationale)

> このドキュメントは、textlint-rule-preset-ja-aifirst が「AI grep 最適化」をコア責務に据える根拠と、各ルールの採用判断を記録する。新規ルール追加・既存ルール変更時に、本ドキュメントの該当セクションを更新する。

## 1. 背景: LLM コーディングアシスタントの検索アルゴリズム

主要 LLM コーディングアシスタント (Claude Code / Cursor / Devin 等) は、ripgrep ベースの Agentic search を採用している。これはベクトル検索 (RAG) ではなく keyword 検索ベースの手法である。本セクションでは、その経緯と検証された根拠を整理する。

### 1.1 Anthropic 公式の見解 (Boris Cherny, Claude Code lead)

- 出典: [Latent Space podcast (2025-05)](https://www.latent.space/p/claude-code)
- 主要引用 (意訳): 初期 Claude Code は RAG とローカルベクトル DB を試したが、Agentic search が圧倒的に上回った
- 文脈: 初期は RAG を試したが、コードベースに対する精度・freshness・privacy のいずれも Agentic search が優位だったため、ripgrep ベースに舵を切った

### 1.2 学術的検証 (Amazon Science, 2026-02)

- 出典: [Beyond Embeddings: Agentic Search for Code (2026-02)](https://www.amazon.science/publications/agentic-search-without-embeddings)
<!-- 引用文 (Amazon Science 原文 "keyword search via agentic tool use") を保護するため prh を局所 disable -->
<!-- textlint-disable prh -->
- 主張: keyword search via agentic tool use が RAG の 90% 以上の性能をベクトル DB なしで達成
<!-- textlint-enable prh -->
- 検証データセット: コード検索タスクの retrieval ベンチマークにおいて、index 構築不要のまま keyword 検索が semantic 検索に匹敵する精度を示した

### 1.3 業界実装の傾向

主要 LLM コーディングアシスタントが同様に grep ベースを採用している。

- [Why Cursor, Claude Code, and Devin Use grep, Not Vectors (MindStudio)](https://www.mindstudio.ai/blog/is-rag-dead-what-ai-agents-use-instead)
- [Claude Code Doesn't Index Your Codebase (Vadim's blog)](https://vadim.blog/claude-code-no-indexing)
- [On the Lost Nuance of Grep vs. Semantic Search](https://www.nuss-and-bolts.com/p/on-the-lost-nuance-of-grep-vs-semantic)
- [Why Claude Code Chose ripgrep Over Vector Search (rust-trends)](https://rust-trends.com/posts/ripgrep-claude-code/)

## 2. なぜ grep が vector search を上回るのか (4 軸詳細)

| 軸 | RAG (ベクトル検索) | Agentic grep |
|---|---|---|
| Precision | 類似度で誤 hit (fuzzy positive) | 完全一致のみ、失敗が明示 (0 件) |
| Freshness | index 再構築が必要、編集中はズレる | 現在のファイル状態を直接検索 |
| Privacy | エンベディング 計算で外部送信 | ローカル完結 |
| Structural relationships | imports / function calls / type definitions が エンベディング で表現困難 | 完全一致で structural な関係を取れる |

### 2.1 Precision (完全一致 vs 類似度)

ベクトル検索は cosine 類似度で「似た意味のチャンク」を返すため、本来の対象とは異なるチャンクを誤って返すことがある (fuzzy positive)。grep は完全一致のみを返し、ヒットしない場合は明示的に 0 件となる。AI agent は「ヒットしなかった」という事実を次のアクションの根拠にできる。

### 2.2 Freshness (index の鮮度)

ベクトル検索は事前の index 構築を要する。コードベースが編集されると index がズレ、結果が陳腐化する。grep は呼び出しのたびに現在のファイル状態を直接走査するため、常に最新の状態を反映する。

### 2.3 Privacy (データ移動の有無)

エンベディングを計算するには、コード片をエンベディング API に送信する必要がある。grep はローカルマシン内で完結するため、機密コードを外部に送らない。

### 2.4 Structural relationships (構造的関係の表現)

コードには imports / function calls / type definitions のような構造的関係が存在する。エンベディングは意味の類似を捉えるが、こうした構造的関係を厳密に表現することは難しい。grep は識別子の完全一致で構造的関係を直接たどれる。

## 3. Iterative refinement の重要性

Agentic search の核心は「Query → Result → 不十分 → Refined Query → Better Result」の対話的検索にある。これは単発 RAG では実現できない。日本語ドキュメントにも次の要件を課す。

- 関連語の併記 (略語の展開、同義語のカバー)
- 見出しの具体化 (refinement の手がかり）
- 弱表現の排除 (言明確定で次の query を組み立てやすく）

## 4. 各ルールと根拠の対応関係

<!-- textlint-disable ja-no-weak-phrase -->

| ルール | 対応する AI grep の特性 | 根拠 (Rationale) |
|---|---|---|
| `prh` (内蔵 52 ルール) | 完全一致のみ hit | 表記揺れがあると同一概念に対する grep が部分的 hit にとどまる |
| `ja-no-mixed-period` | chunk 分割なし、文単位読み | 句点欠落で文境界が曖昧化し、AI が文単位で意味独立に解析できない |
| `abbr-within-parentheses` | 失敗が「0 件」 | 略語のみだと展開形での grep が 0 件 hit となる。初出で `Open Source Software (OSS)` と展開すれば両形式で hit |
| `ja-no-weak-phrase` | Iterative refinement | 「と思います」のような弱表現は AI が次の query を組み立てる際に確定情報として使えない |
| `no-unbacktick-identifier` (独自) | 識別子の完全一致 hit | バッククォートなしの `npm install` は文中の `npm` 一般語と区別できず、grep の精度が低下する |
| `ja-no-successive-word` | (補助) 文の品質保証 | AI 出力での重複ノイズを除去し、文の意味独立性を向上 |
| `ja-no-abusage` | (補助) 用語の正確性 | 誤用は同義語との混同を招き、grep の精度を低下させる |

<!-- textlint-enable ja-no-weak-phrase -->

## 5. スコープ外と判断した観点 (将来の再評価候補)

| 観点 | 判断 | 再評価条件 |
|---|---|---|
| 指示語排除 (これ / それ / あれ) | false positive 過多のため見送り | 文脈条件 (見出し直下のみ等) を限定する手法が確立できれば再検討 |
| 主語省略検出 | kuromoji フル活用で工数特大、効果不明 | 形態素ベースで主語省略の害が定量化されれば再検討 |
| 段落内 paraphrase 禁止 | 同義語辞書が必須で実装特大 | 軽量な同義語辞書による方式が確立できれば再検討 |
| preset-ai-writing 取り込み | 責務分離のため独立維持 | 利用者の声を見て統合需要が顕在化したら再検討 |
| 曖昧見出し検出 (no-vague-heading) | Phase 2 (v1.2.0) で導入予定 | minLength 検査のみのデフォルトで運用評価 |

## 6. 参考文献

### 一次資料 (公式・学術)

- [Anthropic Claude Code on Latent Space podcast (2025-05)](https://www.latent.space/p/claude-code)
- [Amazon Science: Beyond Embeddings (2026-02)](https://www.amazon.science/publications/agentic-search-without-embeddings)
- [Keyword search is all you need (arXiv 2602.23368)](https://arxiv.org/html/2602.23368v1)
- [GrepRAG: Empirical Study of Grep-Like Retrieval (arXiv 2601.23254)](https://arxiv.org/html/2601.23254v2)

### 二次資料 (技術ブログ・解説)

- [Why Cursor, Claude Code, and Devin Use grep, Not Vectors (MindStudio)](https://www.mindstudio.ai/blog/is-rag-dead-what-ai-agents-use-instead)
- [Claude Code Doesn't Index Your Codebase (Vadim's blog)](https://vadim.blog/claude-code-no-indexing)
- [On the Lost Nuance of Grep vs. Semantic Search](https://www.nuss-and-bolts.com/p/on-the-lost-nuance-of-grep-vs-semantic)
- [Why Claude Code Chose ripgrep Over Vector Search (rust-trends)](https://rust-trends.com/posts/ripgrep-claude-code/)
- [The RAG Obituary (Nicolas Bustamante)](https://www.nicolasbustamante.com/p/the-rag-obituary)
- [Why Claude Code is special for not doing RAG/Vector Search (Aram on Medium)](https://zerofilter.medium.com/why-claude-code-is-special-for-not-doing-rag-vector-search-agent-search-tool-calling-versus-41b9a6c0f4d9)
- [Vector Search Vs. Filesystem Tools: 2026 Benchmarks (LlamaIndex)](https://www.llamaindex.ai/blog/did-filesystem-tools-kill-vector-search)
- [Agentic Retrieval Guide (LlamaIndex)](https://www.llamaindex.ai/blog/rag-is-dead-long-live-agentic-retrieval)

### 反対意見 (バランス確保)

- [Why I'm Against Claude Code's Grep-Only Retrieval (Milvus Blog)](https://milvus.io/blog/why-im-against-claude-codes-grep-only-retrieval-it-just-burns-too-many-tokens.md)
- [Is RAG Dead? Long Context, Grep, and the End of the Mandatory Vector DB (AkitaOnRails)](https://akitaonrails.com/en/2026/04/06/rag-is-dead-long-context/)

### textlint プラグイン関連 (採用ルール出典)

- [textlint Rule Authoring Guide](https://github.com/textlint/textlint/blob/master/docs/rule.md)
- [textlint-rule-abbr-within-parentheses (azu)](https://github.com/azu/textlint-rule-abbr-within-parentheses)
- [textlint-rule-ja-no-mixed-period (textlint-ja)](https://github.com/textlint-ja/textlint-rule-ja-no-mixed-period)
- [textlint-rule-ja-no-successive-word (textlint-ja)](https://github.com/textlint-ja/textlint-rule-ja-no-successive-word)
- [textlint-rule-ja-no-weak-phrase (textlint-ja)](https://github.com/textlint-ja/textlint-rule-ja-no-weak-phrase)
- [textlint-rule-ja-no-abusage (textlint-ja)](https://github.com/textlint-ja/textlint-rule-ja-no-abusage)
- [textlint-rule-preset-ai-writing (textlint-ja)](https://github.com/textlint-ja/textlint-rule-preset-ai-writing) — 併用推奨

## 7. 改訂履歴 (Changelog)

このドキュメントは preset の設計判断を追跡するため、新規ルール追加・既存ルール変更時の該当セクション (§4) を更新する。

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-05-07 | 初版 (v1.1.0 リリースに合わせて作成) | AI grep 最適化を core 責務に据える根拠を永続化 |

### 運用ルール

- 新規ルール追加時: §4 (各ルールと根拠の対応関係) に行追加し、§7 (Changelog) で記録
- 既存ルール変更や削除時: §4 該当行を更新、§5 (スコープ外) と一緒に再評価条件を整理、§7 で記録
- 出典 URL の dead link は四半期に 1 回チェック (運用負荷を考えて Wayback Machine スナップショット URL を併記する案も検討)
