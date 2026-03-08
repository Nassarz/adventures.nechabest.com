# 🌱 Nechabest Sustainable Initiatives

![Nechabest Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

> Building a Sustainable Future for People and Nature in Uganda

A modern, responsive web platform showcasing Nechabest's sustainable development initiatives, eco-tourism offerings, and community impact across Uganda.

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.10-orange)](https://firebase.google.com/)

---

## ✨ Features

### 🎨 **Modern Design**
- Stunning hero section with image slideshow
- Smooth scroll animations with Motion (Framer Motion)
- Glassmorphism and modern UI patterns
- Fully responsive design (mobile-first)
- Dark mode optimized

### 🚀 **Performance**
- Next.js 15 with App Router
- Server-side rendering (SSR)
- Image optimization with Next/Image
- Code splitting and lazy loading
- Error boundaries for reliability

### 🔐 **Authentication**
- Firebase Authentication integration
- Google OAuth sign-in
- Email/password authentication
- User profile management
- Protected routes

### ♿ **Accessibility**
- ARIA labels and landmarks
- Keyboard navigation support
- Focus states and indicators
- Semantic HTML structure
- Screen reader optimized

### 📊 **SEO Optimized**
- Meta tags for social sharing
- Open Graph protocol
- Twitter Cards
- Structured data ready
- Sitemap generation

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15.4 |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS 4.1 |
| **Animation** | Motion (Framer Motion) 12.23 |
| **Backend** | Firebase (Auth + Firestore) |
| **Icons** | Lucide React |
| **Fonts** | Google Fonts (Inter, Alfa Slab One) |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control
- A **Firebase** project ([Create one](https://console.firebase.google.com/))

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/walusansanassar-art/NECHABEST-2.0.git
cd "NECHABEST 2.0"
```

### 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

### 3️⃣ Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Optional: Gemini API Key (for AI features)
GEMINI_API_KEY="your-gemini-api-key-here"

# App URL
APP_URL="http://localhost:3000"
```

> **Note:** Firebase configuration is stored in `firebase-applet-config.json`

### 4️⃣ Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Authentication** (Google & Email/Password)
4. Enable **Firestore Database**
5. Update `firebase-applet-config.json` with your credentials

### 5️⃣ Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser 🎉

---

## 📁 Project Structure

```
NECHABEST 2.0/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── Hero.tsx             # Hero section with slideshow
│   ├── Navbar.tsx           # Navigation bar
│   ├── AboutSlideshow.tsx   # About section carousel
│   ├── FocusAreas.tsx       # Core focus areas grid
│   ├── Tours.tsx            # Eco-tourism packages
│   ├── Impact.tsx           # Impact statistics
│   ├── FeaturedProjects.tsx # Project showcase
│   ├── Footer.tsx           # Footer component
│   ├── AuthModal.tsx        # Authentication modal
│   ├── ErrorBoundary.tsx    # Error handling
│   └── OptimizedImage.tsx   # Image with loading states
├── lib/                     # Utility functions
│   ├── firebase.ts          # Firebase configuration
│   └── utils.ts             # Helper functions
├── hooks/                   # Custom React hooks
├── public/                  # Static assets
└── firebase-applet-config.json  # Firebase credentials
```

---

## 🎯 Key Sections

### 🏠 Hero Section
- Dynamic image slideshow (6s intervals)
- Animated text reveals
- Dual CTA buttons
- Scroll indicator

### 📖 About Section
- Interactive slideshow with manual controls
- Company vision, mission, and values
- Smooth slide transitions
- Progress indicator

### 🎯 Focus Areas
- 4 core pillars of sustainable development
- Hover effects with image overlays
- Icon-based visual hierarchy
- Call-to-action on hover

### 🏞️ Eco-Tourism
- Featured tour packages
- Pricing and ratings
- Badge system (Adventure, Cultural, Educational)
- Quick feature highlights

### 📊 Impact Metrics
- Live statistics
- Animated counters
- Icon-based data visualization
- Photo gallery

### 📰 Featured Projects
- Case study highlights
- Research publications
- Category tags
- External links

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run clean` | Clean build cache |

---

## 🎨 Customization

### Colors

Edit [app/globals.css](app/globals.css):

```css
@theme {
  --color-primary: #1a4d2e;    /* Dark green */
  --color-secondary: #4f6f52;  /* Medium green */
  --color-accent: #e8dfca;     /* Cream */
  --color-nature: #2d5a27;     /* Nature green */
}
```

### Fonts

Modify [app/layout.tsx](app/layout.tsx):

```typescript
const inter = Inter({ subsets: ['latin'] });
const display = Alfa_Slab_One({ weight: '400' });
```

### Content

- **Hero Images**: `components/Hero.tsx` → `HERO_IMAGES`
- **Menu Links**: `components/Navbar.tsx` → `navLinks`
- **Tour Packages**: `components/Tours.tsx` → `tours`
- **Statistics**: `components/Impact.tsx` → `stats`

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy! 🚀

```bash
npm run build
# Vercel will automatically detect Next.js
```

### Deploy to Other Platforms

The app is configured for `standalone` output mode. See [next.config.ts](next.config.ts).

---

## 🐛 Troubleshooting

### Font Loading Issues

If you see font timeout errors:
- Fonts fallback to system fonts automatically
- Configure `display: 'swap'` in layout.tsx
- Use local fonts as alternative

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Firebase Connection

- Verify `firebase-applet-config.json` credentials
- Check Firebase project rules
- Enable required authentication methods

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 🌍 Contact & Links

- **Website**: [View App](https://ai.studio/apps/3354a7a3-59a1-49a8-b045-803d08b86f4b)
- **GitHub**: [walusansanassar-art](https://github.com/walusansanassar-art)
- **Location**: Kasese, Uganda

---

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Vercel** for deployment infrastructure
- **Firebase** for backend services
- **Tailwind CSS** for styling utilities
- **Motion (Framer Motion)** for animations

---

<div align="center">
  <p><strong>Built with 💚 for a Sustainable Future</strong></p>
  <p><em>Nechabest Sustainable Initiatives © 2024-2026</em></p>
</div>
