# Work Ledger - Activity Tracker

A simple, clean mobile-first PWA for tracking daily activities with start/stop functionality.

## Features

- 🎯 **One-tap Start/Stop** - Simple activity tracking
- ⏱️ **Real-time Timer** - Live duration tracking
- 📊 **Daily Summary** - See time spent on each activity
- ✏️ **Manual Edits** - Add entries if you forget to start/stop
- 💾 **Local Storage** - All data stored on device
- 📤 **Export Options** - TXT for WhatsApp, CSV for analysis
- 🌙 **Dark Mode** - Comfortable viewing in any light
- 📱 **PWA Ready** - Install as mobile app
- 🏗️ **Modular Architecture** - Easy to extend and maintain

## Quick Start
Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/work-ledger.git
cd work-ledger

# Install dependencies
npm install

# Start development server
npm run dev
```

Deployment to Vercel

1. **One-click Deploy:**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/work-ledger)

2. **Manual Deployment:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

GitHub Setup
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Work Ledger MVP"

# Add remote and push
git remote add origin https://github.com/yourusername/work-ledger.git
git branch -M main
git push -u origin main
```

## Project Structure

```
work-ledger/
├── public/           # Static files
├── src/             # Source code
│   ├── js/          # JavaScript modules
│   ├── css/         # Stylesheets
│   └── components/  # Reusable components
├── docs/            # Documentation
└── tests/           # Test files
```

## Technologies Used

- **Frontend:** Vanilla JavaScript (ES6+), CSS3, HTML5
- **Storage:** LocalStorage API
- **PWA:** Service Worker, Web App Manifest
- **Deployment:** Vercel
- **Build:** NPM scripts

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.
let make it awesome 
