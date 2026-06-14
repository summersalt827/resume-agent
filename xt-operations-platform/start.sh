#!/bin/bash
echo "🚀 Starting XT Operations Platform..."
echo ""
echo "Starting backend server..."
cd "$(dirname "$0")/backend"
npx tsx src/index.ts &
BACKEND_PID=$!
sleep 2

echo "Starting frontend dev server..."
cd "$(dirname "$0")/frontend"
npx vite --host &
FRONTEND_PID=$!

echo ""
echo "✅ Backend:  http://localhost:3001"
echo "✅ Frontend: http://localhost:5173"
echo "📊 Health:   http://localhost:3001/api/health"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
