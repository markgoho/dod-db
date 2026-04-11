#!/usr/bin/env bash
#
# Start DoD Tools
# Runs API server and static file server concurrently
#

set -e

echo "🚀 Starting DoD Tools..."
echo ""

# Start API server in background
echo "📡 Starting API server on port 3001..."
bun run src/scripts/tools-server.ts &
API_PID=$!

# Wait for API server to be ready
sleep 2

# Start static file server
echo "📄 Starting static file server on port 3000..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Both servers running!"
echo "   • API: http://localhost:3001"
echo "   • UI:  http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd tools && bun \
  index.html \
  jingle-extractor/index.html \
  tag-vocabulary/index.html \
  segment-verification/index.html \
  review-corrections/index.html \
  validate-timestamps/index.html \
  episode/index/index.html \
  episode/segments/index.html \
  episode/tags/index.html \
  episode/scriptures/index.html

# Cleanup on exit
trap "kill $API_PID 2>/dev/null" EXIT
