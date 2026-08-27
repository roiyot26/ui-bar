#!/usr/bin/env node
import { resolve } from "node:path";
import { formatReport, scan } from "./scan.js";

const args = process.argv.slice(2);
if (args.includes("--mcp")) {
  await import("./mcp.js");
} else {
  const target = resolve(args[0] ?? ".");
  const findings = scan(target);
  const report = formatReport(findings);
  process.stdout.write(report + "\n");
  process.exit(findings.length ? 1 : 0);
}
