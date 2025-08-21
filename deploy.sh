#!/bin/bash

echo "🚀 DID Forge Explorer - Deployment Script"
echo "=========================================="

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "📦 Building project..."
    npm run build
fi

echo ""
echo "Choose your deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) GitHub Pages"
echo "4) Firebase Hosting"
echo "5) Build only"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=dist
        ;;
    3)
        echo "🚀 Deploying to GitHub Pages..."
        echo "Make sure you have:"
        echo "1. Pushed your code to GitHub"
        echo "2. Enabled GitHub Pages in repository settings"
        echo "3. Set up the GitHub Actions workflow"
        echo ""
        read -p "Press Enter to continue..."
        git add .
        git commit -m "Deploy to GitHub Pages"
        git push origin main
        ;;
    4)
        echo "🚀 Deploying to Firebase Hosting..."
        if ! command -v firebase &> /dev/null; then
            echo "Installing Firebase CLI..."
            npm install -g firebase-tools
        fi
        firebase deploy
        ;;
    5)
        echo "📦 Build completed successfully!"
        echo "You can find the built files in the 'dist' folder."
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment process completed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure environment variables in your hosting platform"
echo "2. Update Supabase authentication settings with your new domain"
echo "3. Test the application functionality"
echo ""
echo "🔗 Environment variables needed:"
echo "- VITE_SUPABASE_URL"
echo "- VITE_SUPABASE_ANON_KEY" 