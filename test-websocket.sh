#!/bin/bash

# WebSocket Testing Script
# This script helps verify WebSocket functionality

echo "🧪 WebSocket Integration Test"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found${NC}"
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
else
    echo -e "${GREEN}✅ .env.local exists${NC}"
fi

# Check if backend is running
echo ""
echo "Checking backend server..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 3000${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    echo "Please start your NestJS backend server:"
    echo "  cd ../backend"
    echo "  npm run start:dev"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo ""
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
    echo "Installing dependencies..."
    npm install
fi

# Check for required dependencies
echo ""
echo "Checking dependencies..."
if grep -q '"socket.io-client"' package.json; then
    echo -e "${GREEN}✅ socket.io-client installed${NC}"
else
    echo -e "${RED}❌ socket.io-client not found${NC}"
    exit 1
fi

# Build check
echo ""
echo "Running type check..."
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript errors found (run 'npm run type-check' for details)${NC}"
fi

# Print test instructions
echo ""
echo "=============================="
echo "🎯 Manual Testing Instructions"
echo "=============================="
echo ""
echo "1. Start the development server:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "2. Open your browser to:"
echo "   ${GREEN}http://localhost:3001/auctions${NC}"
echo ""
echo "3. Test WebSocket Connection:"
echo "   - Open an auction detail page"
echo "   - Check browser console for:"
echo "     ${GREEN}✅ WebSocket connected to auction server${NC}"
echo "     ${GREEN}📍 Joined auction: [auction-id]${NC}"
echo ""
echo "4. Test Real-time Updates:"
echo "   - Open same auction in 2 browser windows"
echo "   - Place a bid in one window"
echo "   - Verify instant update in other window"
echo ""
echo "5. Expected Visual Indicators:"
echo "   ✅ Green 'Live' badge with pulsing dot"
echo "   ✅ Real-time price updates with animation"
echo "   ✅ Viewer count (e.g., '2 watching')"
echo "   ✅ Toast notifications on bid/status changes"
echo "   ✅ Red 'Ending Soon' alert (if < 5 min remaining)"
echo ""
echo "6. Browser Console Commands:"
echo "   - Check connection: localStorage.getItem('token')"
echo "   - Check WebSocket: window.io"
echo ""
echo "=============================="
echo "📚 Documentation"
echo "=============================="
echo ""
echo "- Quick Start: ${GREEN}QUICKSTART_WEBSOCKET.md${NC}"
echo "- Full Docs:   ${GREEN}WEBSOCKET.md${NC}"
echo "- Summary:     ${GREEN}WEBSOCKET_SUMMARY.md${NC}"
echo ""
echo "=============================="
echo "🐛 Troubleshooting"
echo "=============================="
echo ""
echo "If WebSocket doesn't connect:"
echo "1. Verify .env.local has NEXT_PUBLIC_WS_URL=http://localhost:3000"
echo "2. Check backend WebSocket is enabled (/auctions namespace)"
echo "3. Verify JWT token is valid (try logging in again)"
echo "4. Check browser console for connection errors"
echo "5. Test backend WebSocket directly (use Postman or wscat)"
echo ""
echo "Common Issues:"
echo "- CORS errors → Check backend CORS configuration"
echo "- 401 errors → Token expired, login again"
echo "- No updates → Check you joined the auction room"
echo "- Slow updates → Check network tab, should be instant"
echo ""
echo "=============================="
echo "✅ Setup Complete!"
echo "=============================="
echo ""
echo "Ready to test WebSocket integration! 🚀"
echo "Run: ${GREEN}npm run dev${NC}"
