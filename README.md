# DID Forge Explorer

A modern decentralized identity platform built with React, TypeScript, and Supabase.

## Features

- 🔐 Secure authentication with Supabase
- 🆔 DID (Decentralized Identifier) management
- 💼 Digital wallet functionality
- 🔍 DID exploration and verification
- 🎨 Modern glassmorphism UI design
- 📱 Responsive design

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Auth, Database, Functions)
- **3D Graphics**: Three.js, React Three Fiber
- **Routing**: React Router DOM

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or bun
- Supabase account

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd did-forge-explorer

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
# or
bun dev
```

## Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure Environment Variables** in Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Option 2: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. **Configure Environment Variables** in Netlify Dashboard

### Option 3: GitHub Pages

1. **Add GitHub Pages workflow**:
   ```bash
   # Create .github/workflows/deploy.yml
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

### Option 4: Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init hosting
   ```

3. **Deploy**:
   ```bash
   firebase deploy
   ```

## Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Configuration

1. **Authentication Settings**:
   - Enable Email provider
   - Configure Site URL: `https://your-domain.com`
   - Add redirect URLs: `https://your-domain.com/**`

2. **Email Configuration**:
   - Set up SMTP provider (Resend, Postmark, etc.)
   - Configure sender email
   - Test email delivery

## Build Commands

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── integrations/       # External integrations
├── pages/              # Page components
└── lib/                # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
