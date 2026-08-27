import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { scan } from "../src/scan.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SMELLS = [
  "Inter+purple+3 cards",
  "mesh/blobs",
  "fake testimonials",
  "random Tailwind spacing",
  '"use client" sprayed on layouts',
  "Unsplash-hero-with-gradient",
  "landing-template section order",
];

describe("ui-bar", () => {
  it("flags the generated landing", () => {
    const findings = scan(join(root, "fixtures/generated-landing"));
    const names = new Set(findings.map((f) => f.smell));
    for (const smell of SMELLS) {
      assert.ok(names.has(smell), `missing ${smell}: ${JSON.stringify(findings)}`);
    }
    for (const f of findings) {
      assert.ok(f.line >= 1, "line is 1-based");
      assert.ok(f.file.length > 0);
    }
  });

  it("leaves the ok page clean", () => {
    const findings = scan(join(root, "fixtures/ok-page"));
    assert.deepEqual(findings, []);
  });
});
