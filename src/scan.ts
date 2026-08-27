import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export type Finding = { file: string; line: number; smell: string };

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "coverage", ".next"]);
const CODE = /\.(tsx|ts|jsx|js|css)$/;
const SCALE = new Set(["0", "1", "2", "4", "8", "12", "16", "24", "32", "48", "64"]);
const SPACING =
  /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y)-(\d+(?:\.\d+)?)\b/g;

export function scan(root: string): Finding[] {
  const files = listFiles(root);
  const findings: Finding[] = [];
  const inter: Finding[] = [];
  const purple: Finding[] = [];
  const cards: Finding[] = [];

  for (const abs of files) {
    const rel = relative(root, abs).split(sep).join("/");
    const text = readFileSync(abs, "utf8");
    const lines = text.split(/\r?\n/);

    if (/(^|\/)layout\.(t|j)sx?$/.test(rel)) {
      const idx = lines.findIndex((l) => /['"]use client['"]/.test(l));
      if (idx !== -1) {
        findings.push({
          file: rel,
          line: idx + 1,
          smell: '"use client" sprayed on layouts',
        });
      }
    }

    const hasUnsplash = /unsplash\.com/i.test(text);
    const hasGradient = /bg-gradient|from-black\/|to-black\/|gradient-to|overlay/i.test(
      text,
    );

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const n = i + 1;

      if (/\bInter\b/.test(line) && /font|next\/font/i.test(text)) {
        inter.push({ file: rel, line: n, smell: "Inter+purple+3 cards" });
      }
      if (
        /from-purple-|to-purple-|via-purple-|from-violet-|to-violet-|bg-purple-|from-indigo-|#7c3aed|#8b5cf6|#6366f1/.test(
          line,
        )
      ) {
        purple.push({ file: rel, line: n, smell: "Inter+purple+3 cards" });
      }
      if (/\bgrid-cols-3\b/.test(line)) {
        cards.push({ file: rel, line: n, smell: "Inter+purple+3 cards" });
      }

      if (
        /\bblob\b|\bblobs\b|mesh-gradient|mesh gradient|bg-\[radial-gradient/i.test(line) ||
        (/blur-(2|3)xl/.test(line) && /rounded-full/.test(line) && /absolute/.test(line))
      ) {
        findings.push({ file: rel, line: n, smell: "mesh/blobs" });
      }

      if (/\btestimonials?\b/i.test(line) || /★★★★★/.test(line)) {
        findings.push({ file: rel, line: n, smell: "fake testimonials" });
      }

      const off: string[] = [];
      SPACING.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = SPACING.exec(line))) {
        if (!SCALE.has(m[1])) off.push(m[1]);
      }
      if (off.length >= 2) {
        findings.push({ file: rel, line: n, smell: "random Tailwind spacing" });
      }

      if (hasUnsplash && hasGradient && /unsplash\.com/i.test(line)) {
        findings.push({ file: rel, line: n, smell: "Unsplash-hero-with-gradient" });
      }
    }

    const order = sectionOrder(lines);
    if (order) {
      findings.push({
        file: rel,
        line: order,
        smell: "landing-template section order",
      });
    }
  }

  if (inter.length && purple.length && cards.length) {
    findings.push(cards[0], purple[0], inter[0]);
  }

  return dedupe(findings).sort((a, b) =>
    a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file),
  );
}

export function formatReport(findings: Finding[]): string {
  if (!findings.length) return "clean";
  return findings.map((f) => `${f.file}:${f.line}  ${f.smell}`).join("\n");
}

function sectionOrder(lines: string[]): number | null {
  const hits: { key: string; line: number }[] = [];
  const rules: [string, RegExp][] = [
    ["hero", /\bhero\b/i],
    ["cards", /\b(features?|grid-cols-3)\b/i],
    ["testimonial", /\btestimonials?\b/i],
    ["pricing", /\bpricing\b/i],
    ["faq", /\bfaq\b|frequently asked/i],
  ];
  for (let i = 0; i < lines.length; i++) {
    for (const [key, re] of rules) {
      if (hits.some((h) => h.key === key)) continue;
      if (re.test(lines[i])) hits.push({ key, line: i + 1 });
    }
  }
  const keys = hits.map((h) => h.key).join(",");
  if (keys === "hero,cards,testimonial,pricing,faq") return hits[0].line;
  return null;
}

function listFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) out.push(...listFiles(abs));
    else if (CODE.test(name) && !name.endsWith(".d.ts")) out.push(abs);
  }
  return out;
}

function dedupe(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  const out: Finding[] = [];
  for (const f of findings) {
    const k = `${f.file}:${f.line}:${f.smell}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(f);
  }
  return out;
}
