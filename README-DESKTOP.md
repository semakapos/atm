# ReconcilePro - Desktop Application

## 🎯 Overview
ReconcilePro is a portable Windows desktop application for card machine reconciliation, built with Electron.

## 📋 Prerequisites
- Windows 10 or later
- Node.js 18+ (for development only - not needed for the .exe)

## 🚀 Quick Start

### Development Mode
1. **Install Dependencies**
   ```powershell
   npm install
   ```

2. **Run in Development Mode**
   ```powershell
   npm run electron:dev
   ```
   This will start both the Vite dev server and Electron window.

### Production Build

1. **Build the Windows Executable**
   ```powershell
   npm run electron:build:portable
   ```

2. **Find Your Portable .exe**
   - The portable executable will be located at:
     ```
     release/ReconcilePro-1.0.0-Portable.exe
     ```
   - This is a SINGLE FILE that you can copy anywhere!

## 📦 Build Options

### Portable .exe (Recommended)
```powershell
npm run electron:build:portable
```
Creates: `release/ReconcilePro-1.0.0-Portable.exe`
- Single executable file
- No installation required
- Run from any location
- Perfect for USB drives

### Windows Installer
```powershell
npm run electron:build
```
Creates: `release/ReconcilePro-1.0.0-win-x64.exe`
- Traditional Windows installer
- Installs to Program Files
- Creates desktop shortcuts
- Adds to Start Menu

## 💻 Using the Portable Version

### On the Build Computer:
1. Run the build command (see above)
2. Navigate to `release/` folder
3. Find `ReconcilePro-1.0.0-Portable.exe`

### On Any Other Windows PC:
1. Copy `ReconcilePro-1.0.0-Portable.exe` to the target PC
2. Double-click to run - that's it!
3. No installation needed
4. No internet required
5. Works offline completely

## 🔧 Technical Details

### Window Configuration
- Size: 1200x800 pixels
- Resizable: Yes
- Title: "ReconcilePro - Card Machine Reconciliation"

### Offline Capabilities
- All dependencies bundled locally
- No CDN requests
- Works without internet connection
- Firebase and AI features work if configured

### Technologies Used
- **Electron**: Native Windows wrapper
- **React 19.2.0**: UI framework
- **React Router DOM 7.9.6**: Navigation
- **TailwindCSS**: Styling
- **Recharts 3.4.1**: Charts
- **Lucide React**: Icons
- **Firebase 12.6.0**: Backend (optional)
- **Google GenAI**: AI features (optional)

## 📁 Project Structure
```
RPRO/
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # Preload script
├── build/
│   └── icon.ico         # Application icon
├── dist/                # Built web app (after npm run build)
├── release/             # Final .exe files (after electron:build)
├── src/
│   ├── components/
│   ├── contexts/
│   ├── services/
│   └── ...
├── index.html
├── index.tsx
├── App.tsx
├── package.json
└── vite.config.ts
```

## 🐛 Troubleshooting

### "Module not found" errors
```powershell
npm install
```

### Build fails
1. Delete `node_modules` and `dist` folders
2. Run: `npm install`
3. Try building again

### .exe doesn't start on another PC
- Make sure Windows Defender isn't blocking it
- Right-click > Properties > Unblock

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start Vite dev server only |
| `npm run build` | Build web app to dist/ |
| `npm run electron` | Run Electron (after build) |
| `npm run electron:dev` | Development mode (auto-reload) |
| `npm run electron:build` | Build installer .exe |
| `npm run electron:build:portable` | Build portable .exe |
| `npm run pack` | Build without packaging (for testing) |

## ⚙️ Configuration

### Environment Variables
Create a `.env.local` file for configuration:
```
GEMINI_API_KEY=your_api_key_here
```

### Firebase Configuration
Update your Firebase config in the relevant service files.

## 📦 Distribution

### Portable Version (Recommended for USB/Network drives)
1. Build: `npm run electron:build:portable`
2. Copy `release/ReconcilePro-1.0.0-Portable.exe`
3. Share with users
4. They just double-click to run

### Installer Version (Recommended for permanent installation)
1. Build: `npm run electron:build`
2. Share `release/ReconcilePro Setup 1.0.0.exe`
3. Users run installer
4. App gets installed to Program Files

## 🎨 Customization

### Change Window Size
Edit `electron/main.js`:
```javascript
width: 1200,
height: 800,
```

### Change App Icon
Replace `build/icon.ico` with your own icon file

### Update App Name
Edit `package.json`:
```json
"productName": "Your App Name"
```

## 📄 License
Private - Internal Use Only

## 🆘 Support
For issues or questions, contact your development team.
