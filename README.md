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



https://github.com/user-attachments/assets/725e34d6-2c34-456b-a177-3e744de81392


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

## Deployed at Netlify

 **Link**:
   ```link
   https://jade-heliotrope-fdd823.netlify.app
   ```
## 📝Note
   - If you didn't receieve a confirmation mail after Sing up, no issuues (it might be due to server side issues) you can simply Sign in with your Sign up credentials after you see the account has been created message on screen.

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
