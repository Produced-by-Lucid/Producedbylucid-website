# Landing Page with Next.js and GSAP

A modern, animated landing page built with Next.js 15, GSAP, and Lenis smooth scroll.

## Features

- 🚀 **Next.js 15** with App Router and TypeScript
- 🎨 **GSAP Animations** for smooth, professional animations
- 📜 **Lenis Smooth Scroll** for buttery-smooth scrolling experience
- 💎 **Tailwind CSS** for modern, responsive styling
- ⚡ **Performance Optimized** with server-side rendering

## Animations Included

- Hero section with staggered text animations
- Scroll-triggered feature card animations
- Parallax background effects
- Smooth scroll behavior with Lenis
- Interactive hover effects

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `components/LandingPage.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure

```
├── app/
│   ├── page.tsx          # Main page component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   └── LandingPage.tsx   # Animated landing page component
└── package.json
```

## Technologies Used

- **Next.js** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **GSAP** - Professional-grade animation library
- **Lenis** - Smooth scroll library
- **Tailwind CSS** - Utility-first CSS framework

## Customization

You can customize the landing page by editing `components/LandingPage.tsx`:

- Modify colors in the gradient classes
- Adjust animation timing in the GSAP timelines
- Add or remove sections as needed
- Change text content and styling

## Learn More

To learn more about Next.js and the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [GSAP Documentation](https://greensock.com/docs/) - animation library docs
- [Lenis Smooth Scroll](https://github.com/studio-freight/lenis) - smooth scroll docs
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

