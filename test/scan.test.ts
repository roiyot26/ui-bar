import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { formatReport, scan } from "../src/scan.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SMELLS = [
  "Inter-by-default",
  "gradient soup",
  "8px radius everywhere",
  "generic CTAs",
  "mesh/blobs",
  "fake testimonials",
  "random Tailwind spacing",
  "landing-template section order",
];

describe("ui-bar", () => {
  it("flags the generated landing file", () => {
    const findings = scan(join(root, "fixtures/generated-landing/app/page.tsx"));
    const names = new Set(findings.map((f) => f.smell));
    for (const smell of SMELLS) {
      assert.ok(names.has(smell), `missing ${smell}: ${JSON.stringify(findings)}`);
    }
    for (const f of findings) {
      assert.ok(f.line >= 1);
      assert.match(formatReport(findings), /^1\. /);
    }
  });

  it("leaves the ok page clean", () => {
    const findings = scan(join(root, "fixtures/ok-page"));
    assert.deepEqual(findings, []);
  });
});
