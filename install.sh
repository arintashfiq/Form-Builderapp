#!/bin/bash

echo "🚀 Setting up Form Builder Application..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Installation complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up MySQL database:"
echo "   mysql -u root -p"
echo "   CREATE DATABASE form_builder;"
echo "   exit"
echo ""
echo "2. Configure backend environment:"
echo "   cd backend"
echo "   cp .env.example .env"
echo "   # Edit backend/.env and set DB_PASSWORD=your_mysql_password"
echo "   # (Leave DB_PASSWORD= empty if MySQL has no password)"
echo "   cd .."
echo ""
echo "3. Start the application:"
echo "   npm run dev"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"