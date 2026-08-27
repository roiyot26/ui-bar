import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { formatReport, scan } from "./scan.js";

const server = new McpServer({
  name: "ui-bar",
  version: "1.0.0",
});

server.tool(
  "scan",
  "Flag generated Next/React UI smells in a directory. Returns file:line and the smell. No scores.",
  { path: z.string().describe("Directory to scan") },
  async ({ path }) => ({
    content: [
      {
        type: "text" as const,
        text: formatReport(scan(resolve(path))),
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
