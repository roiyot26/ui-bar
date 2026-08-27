import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

export type Finding = { file: string; line: number; smell: string };

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "coverage", ".next"]);
const CODE = /\.(tsx|ts|jsx|js|css)$/;
const SCALE = new Set(["0", "1", "2", "4", "8", "12", "16", "24", "32", "48", "64"]);
const SPACING =
  /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y)-(\d+(?:\.\d+)?)\b/g;
const CTA =
  /unlock your potential|welcome to the future|get started|learn more|book a demo/i;

export function scan(target: string): Finding[] {
  const absTarget = resolve(target);
  const files = listFiles(absTarget);
  const findings: Finding[] = [];

  for (const abs of files) {
    const rel = displayPath(abs);
    const text = readFileSync(abs, "utf8");
    const lines = text.split(/\r?\n/);
    const radiusLines: number[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const n = i + 1;

      if (/\bInter\b/.test(line) && /font|next\/font/i.test(text)) {
        findings.push({ file: rel, line: n, smell: "Inter-by-default" });
      }

      if (
        /bg-gradient|from-purple-|to-purple-|via-purple-|from-violet-|to-violet-|from-indigo-|#7c3aed|#8b5cf6/.test(
          line,
        ) ||
        (/unsplash\.com/i.test(line) && /bg-gradient|from-black\/|overlay/i.test(text))
      ) {
        findings.push({ file: rel, line: n, smell: "gradient soup" });
      }

      if (/\brounded-lg\b|\brounded-\[8px\]/.test(line)) {
        radiusLines.push(n);
      }

      if (CTA.test(line)) {
        findings.push({ file: rel, line: n, smell: "generic CTAs" });
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
    }

    if (radiusLines.length >= 3) {
      for (const n of radiusLines) {
        findings.push({ file: rel, line: n, smell: "8px radius everywhere" });
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

  return dedupe(findings).sort((a, b) =>
    a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file),
  );
}

export function formatReport(findings: Finding[]): string {
  if (!findings.length) return "clean";
  return findings
    .map((f, i) => `${i + 1}. ${f.file}:${f.line}  ${f.smell}`)
    .join("\n");
}

function displayPath(abs: string): string {
  return relative(process.cwd(), abs).split(sep).join("/") || abs;
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
  if (hits.map((h) => h.key).join(",") === "hero,cards,testimonial,pricing,faq") {
    return hits[0].line;
  }
  return null;
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
