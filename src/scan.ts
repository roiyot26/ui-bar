import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

export type Finding = { file: string; line: number; smell: string };

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "coverage", ".next"]);
const CODE = /\.(tsx|ts|jsx|js|css)$/;

export function scan(target: string): Finding[] {
  const files = listFiles(resolve(target));
  const findings: Finding[] = [];
  const inter: Finding[] = [];
  const purple: Finding[] = [];
  const cards: Finding[] = [];

  for (const abs of files) {
    const rel = displayPath(abs);
    const text = readFileSync(abs, "utf8");
    const lines = text.split(/\r?\n/);
    const hasUnsplash = /unsplash\.com/i.test(text);
    const hasGradient = /bg-gradient|from-black\/|to-black\/|overlay/i.test(text);

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

      if (hasUnsplash && hasGradient && /unsplash\.com/i.test(line)) {
        findings.push({ file: rel, line: n, smell: "Unsplash-hero-with-gradient" });
      }
    }
  }

  if (inter.length && purple.length && cards.length) {
    findings.push(cards[0]);
  }

  return dedupe(findings).sort((a, b) =>
    a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file),
  );
}

export function formatReport(findings: Finding[]): string {
  if (!findings.length) return "clean";
  return findings.map((f) => `${f.file}:${f.line}  ${f.smell}`).join("\n");
}

function displayPath(abs: string): string {
  return relative(process.cwd(), abs).split(sep).join("/") || abs;
}

function listFiles(target: string): string[] {
  const st = statSync(target);
  if (st.isFile()) return CODE.test(target) ? [target] : [];
  const out: string[] = [];
  for (const name of readdirSync(target)) {
    if (SKIP_DIRS.has(name)) continue;
    const abs = resolve(target, name);
    const child = statSync(abs);
    if (child.isDirectory()) out.push(...listFiles(abs));
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
