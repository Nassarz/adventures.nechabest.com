# 🚀 Quick Start Guide - Nechabest 2.0

Get the site running in 5 minutes!

## Prerequisites
- Node.js 20+ installed
- Git installed

## Installation

```bash
# 1. Clone the repo
git clone https://github.com/walusansanassar-art/NECHABEST-2.0.git
cd "NECHABEST 2.0"

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

## 🎉 That's it!

Open [http://localhost:3000](http://localhost:3000)

---

## Optional Configuration

### Environment Variables (Optional)

Create `.env.local` if you want to use Gemini AI:

```env
GEMINI_API_KEY="your-key-here"
APP_URL="http://localhost:3000"
```

### Firebase (Already Configured)

Firebase is pre-configured in `firebase-applet-config.json`. No additional setup needed!

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Check code quality |

---

## 🐛 Troubleshooting

### Port 3000 already in use?

```bash
# Kill the process
npx kill-port 3000
# Then run again
npm run dev
```

### Dependencies error?

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Build fails?

```bash
# Clear Next.js cache
npm run clean
npm run build
```

---

## 📖 Full Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete guide.

---

## 🌟 Features Overview

- **Hero Section** - Dynamic slideshow with CTAs
- **About** - Interactive about slideshow
- **Focus Areas** - 4 sustainability pillars
- **Eco-Tourism** - Tour packages showcase
- **Impact Stats** - Real-time metrics
- **Projects** - Featured case studies
- **Authentication** - Firebase auth with Google

---

## 🎨 Customization Quick Tips

### Change Colors
Edit `app/globals.css`:
```css
@theme {
  --color-primary: #1a4d2e;    /* Main green */
  --color-nature: #2d5a27;     /* Nature green */
}
```

### Update Content
- **Hero images**: `components/Hero.tsx` line 7
- **Tour packages**: `components/Tours.tsx` line 8
- **Navigation links**: `components/Navbar.tsx` line 25

---

## 🚢 Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# Then:
# 1. Go to vercel.com
# 2. Import your GitHub repo
# 3. Deploy!
```

---

**Need help?** Check the full [DOCUMENTATION.md](./DOCUMENTATION.md)

**Quality Report:** See [QUALITY_ASSURANCE.md](./QUALITY_ASSURANCE.md)
