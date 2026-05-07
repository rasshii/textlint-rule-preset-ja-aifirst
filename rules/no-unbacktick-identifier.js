// AI grep 最適化のための独自ルール
// 文中で識別子 (npm/yarn/pnpm/npx コマンド) がバッククォート未使用のときに警告する
// バッククォートで囲むことで AI が識別子を完全一致 grep できる

const DEFAULT_PATTERNS = [
  { source: "\\b(?:npm|npx|yarn|pnpm)\\s+\\w[\\w-]*", flags: "g", label: "コマンド" },
];

function isInsideCode(node) {
  let current = node.parent;
  while (current) {
    if (current.type === "Code" || current.type === "CodeBlock") return true;
    current = current.parent;
  }
  return false;
}

function buildPatterns(options) {
  if (!options || !Array.isArray(options.patterns) || options.patterns.length === 0) {
    return DEFAULT_PATTERNS.map((p) => ({
      regex: new RegExp(p.source, p.flags),
      label: p.label,
    }));
  }
  return options.patterns.map((p) => {
    const userFlags = p.flags || "g";
    // g フラグを強制 (`while (regex.exec(...))` で lastIndex が進まず無限ループになる事故を防ぐ)
    const safeFlags = userFlags.includes("g") ? userFlags : userFlags + "g";
    return {
      regex: new RegExp(p.source, safeFlags),
      label: p.label || "識別子",
    };
  });
}

const reporter = (context, options = {}) => {
  const { Syntax, RuleError, report, getSource, locator, fixer } = context;
  const patterns = buildPatterns(options);

  return {
    [Syntax.Str](node) {
      if (isInsideCode(node)) return;
      const text = getSource(node);
      for (const { regex, label } of patterns) {
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const start = match.index;
          const end = start + match[0].length;
          report(
            node,
            new RuleError(
              `${label} "${match[0]}" はバッククォートで囲んでください (例: \`${match[0]}\`) — AI grep の精度向上`,
              {
                padding: locator.range([start, end]),
                fix: fixer.replaceTextRange([start, end], "`" + match[0] + "`"),
              }
            )
          );
        }
      }
    },
  };
};

module.exports = {
  linter: reporter,
  fixer: reporter,
};
