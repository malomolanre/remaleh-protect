#!/bin/bash

echo "🛡️ Remaleh Protect - Setup Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Setting up Remaleh Protect..."

# Setup backend
echo "🔧 Setting up backend..."
cd remaleh-protect-backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Backend setup complete!"

# Setup frontend
echo "🎨 Setting up frontend..."
cd ../remaleh-protect-frontend

echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete!"

# Back to root
cd ..

echo ""
echo "🎉 Setup complete! Here's how to run the application:"
echo ""
echo "🔧 Start Backend:"
echo "   cd remaleh-protect-backend"
echo "   source venv/bin/activate"
echo "   python src/main.py"
echo ""
echo "🎨 Start Frontend (in new terminal):"
echo "   cd remaleh-protect-frontend"
echo "   npm run dev"
echo ""
echo "🐳 Or use Docker:"
echo "   docker-compose up -d"
echo ""
echo "📱 For mobile development:"
echo "   cd remaleh-protect-frontend"
echo "   npx cap init 'Remaleh Protect' 'com.remaleh.protect'"
echo "   npx cap add ios"
echo "   npx cap add android"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5001"
echo ""
echo "📚 Check README.md for detailed deployment instructions!"
echo ""
echo "🛡️ Happy protecting! 🚀"

