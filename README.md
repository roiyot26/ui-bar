# ui-bar

MCP server and CLI that flags generated Next/React UI. Prints file:line and the smell. No scores.

Bin name is ui-bar. Pass a directory to scan. Pass --mcp for stdio.

## Example

fixtures/generated-landing/app/layout.tsx:1  "use client" sprayed on layouts
fixtures/generated-landing/app/page.tsx:8  Unsplash-hero-with-gradient
fixtures/generated-landing/app/page.tsx:14  mesh/blobs

Exit 1 if anything matched. MIT.
