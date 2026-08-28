#!/bin/sh
# Invoke the built CLI on the bundled fixtures.
cd "$(dirname "$0")/.." || exit 1
echo "== fixtures/generated-landing =="
node dist/cli.js fixtures/generated-landing
echo "exit $?"
echo
echo "== fixtures/ok-page =="
node dist/cli.js fixtures/ok-page
echo "exit $?"
