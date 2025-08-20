
# Time Tracker PWA

A simple, reliable, and mobile-first time tracking application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ⏱️ **Instant Start/Stop** - Zero friction time tracking
- 📱 **Mobile-First PWA** - Installable app with offline support
- 🏠 **Local-First** - All data stored locally in IndexedDB
- 🕒 **AM/PM Native** - User-friendly time display
- 📊 **Daily Summaries** - Track work, breaks, and productivity
- ✨ **Smooth Animations** - Delightful micro-interactions
- 🎯 **Quick Actions** - Fast logging for breaks, lunch, tech issues

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Storage**: IndexedDB via IDB
- **PWA**: next-pwa
- **Time Handling**: date-fns with timezone support

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Build for Production

```bash
npm run build
npm start
```

## PWA Installation

The app can be installed on mobile devices and desktop browsers for a native app experience.

## Data Storage

All data is stored locally in your browser's IndexedDB. Your time tracking data never leaves your device unless you explicitly export it.

## Features Roadmap

- [x] Basic time tracking
- [x] Daily summaries  
- [x] Timeline view
- [x] PWA support
- [ ] History & Reports
- [ ] Export/Import data
- [ ] Idle detection
- [ ] Tags & Projects
- [ ] Backup & Sync

## License

MIT License - feel free to use for personal or commercial projects.
