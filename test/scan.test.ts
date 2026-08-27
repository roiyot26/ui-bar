import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { formatReport, scan } from "../src/scan.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const COSTUMES = [
  "Inter+purple+3 cards",
  "mesh/blobs",
  "Unsplash-hero-with-gradient",
];

describe("ui-bar", () => {
  it("flags the three costumes once each", () => {
    const findings = scan(join(root, "fixtures/generated-landing/app/page.tsx"));
    assert.equal(findings.length, 3);
    assert.deepEqual(
      findings.map((f) => f.smell).sort(),
      [...COSTUMES].sort(),
    );
    const report = formatReport(findings);
    assert.equal(report.split("\n").length, 3);
    assert.doesNotMatch(report, /^\d+\. /m);
    for (const f of findings) assert.ok(f.line >= 1);
  });

  it("leaves the ok page clean", () => {
    assert.deepEqual(scan(join(root, "fixtures/ok-page")), []);
  });
});
