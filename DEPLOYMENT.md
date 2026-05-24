# Reconcile Pro - Deployment Guide

## 🚀 Live Demo
Your app will be available at: **https://munfilih.github.io/atm/**

## 📋 Deployment Steps

### 1. Enable GitHub Pages
1. Go to your repository: https://github.com/Munfilih/atm
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. The deployment will start automatically

### 2. Automatic Deployment
- Every push to the `master` branch will trigger automatic deployment
- The GitHub Actions workflow will:
  - Install dependencies
  - Build the project
  - Deploy to GitHub Pages

### 3. Environment Variables
For Firebase integration, you'll need to add your Firebase config:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### 4. Custom Domain (Optional)
To use a custom domain:
1. Add a `CNAME` file to the repository root
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## 🔧 Local Development
```bash
npm install
npm run dev
```

## 🏗️ Build for Production
```bash
npm run build
```

## 📱 Features
- ✅ Responsive design for mobile and desktop
- ✅ Offline functionality with local storage
- ✅ Firebase integration for data sync
- ✅ Print-friendly reports
- ✅ Excel export functionality
- ✅ Real-time search and filtering

## 🔒 Security
- Firebase authentication
- Firestore security rules
- Environment variable protection

## 📞 Support
For issues or questions, please create an issue in the GitHub repository.