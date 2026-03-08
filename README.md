<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NECHABEST 2.0

**National Environment Conservation Harmony Association for a Better Tomorrow**

A modern, full-stack web application for environmental conservation and eco-tourism management.

🌐 **Live Site:** [https://nechabest.vercel.app](https://nechabest.vercel.app)  
📦 **Repository:** [https://github.com/walusansanassar-art/NECHABEST-2.0](https://github.com/walusansanassar-art/NECHABEST-2.0)

## Features

- 🌿 **Eco-Tourism Management** - Browse and book sustainable tours
- 📝 **Blog Platform** - Environmental awareness articles with comments
- 👨‍💼 **Admin Dashboard** - Comprehensive CMS for content management
- 🔐 **Authentication** - Secure Clerk-based user authentication
- 📊 **Analytics** - Track views, bookings, and engagement
- 🎨 **Modern UI** - Built with Next.js 16, React 19, and Tailwind CSS 4
- 🗄️ **MongoDB Integration** - Robust data persistence

## Tech Stack

- **Framework:** Next.js 16.1.6 with Turbopack
- **React:** 19.2.1
- **Styling:** Tailwind CSS 4.1.11
- **Authentication:** Clerk 7.0.1
- **Database:** MongoDB Atlas
- **Animations:** Motion 12.23.24
- **Deployment:** Vercel
- **Language:** TypeScript 5.9.3

## Prerequisites

- Node.js 20+ 
- MongoDB Atlas account
- Clerk account (for authentication)

## Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/walusansanassar-art/NECHABEST-2.0.git
   cd "NECHABEST 2.0"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```env
   MONGODB_URI="your_mongodb_connection_string"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   ADMIN_EMAILS="admin@example.com"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run clean` - Clean Next.js cache

## Admin Dashboard

Access the admin dashboard at `/admin` (requires authentication and admin email authorization).

**Admin Features:**
- Blog post management
- Tour management
- Booking management
- Comment moderation
- Site content editor
- Media library
- Analytics dashboard
- Subscriber management

## Project Structure

```
├── app/                  # Next.js app router pages
│   ├── admin/           # Admin dashboard pages
│   ├── api/             # API routes
│   ├── blog/            # Blog pages
│   ├── booking/         # Booking pages
│   └── ...
├── components/          # React components
│   ├── admin/          # Admin-specific components
│   └── ...
├── lib/                # Utility libraries
│   ├── mongodb.ts      # MongoDB connection
│   ├── adminAuth.ts    # Admin authentication
│   └── ...
├── hooks/              # Custom React hooks
└── public/             # Static assets
```

## Deployment

The application is deployed on Vercel at [https://nechabest.vercel.app](https://nechabest.vercel.app).

To deploy your own instance:
1. Fork this repository
2. Connect to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `ADMIN_EMAILS` | Comma-separated admin emails | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

© 2026 NECHABEST. All rights reserved.

## Support

For issues or questions, please open an issue on GitHub.
