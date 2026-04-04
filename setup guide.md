# 🚀 Queueless-Campus - Setup Guide

Welcome to the **Queueless-Campus** platform setup guide. This document provides step-by-step instructions to get the backend, admin panel, and mobile application running in your local environment.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **MongoDB**: Local installation or MongoDB Atlas URI ([Setup Guide](https://www.mongodb.com/docs/manual/installation/))
- **Redis Server**: Required for real-time queuing ([Download](https://redis.io/download/))
- **Android Studio**: Configured with Android SDK and Emulator ([Setup Guide](https://developer.android.com/studio))
- **Java Development Kit (JDK)**: v17+ (Required for Android builds)
- **Git**: For version control (Optional)

---

## 📂 Project Structure

- `/backend`: Node.js/Express API.
- `/admin-panel`: React/Vite Administrative & Staff Dashboard.
- `/FrontendMobileApp`: React Native CLI Student Application.

---

## 🏗️ 1. Backend Setup

The backend serves as the core API and manages real-time updates via Socket.io.

1. **Navigate to the directory**:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Configuration**:
   Create a `.env` file in the `backend/` directory and add the following:
   ```env
   PORT=8989
   MONGO_URI=mongodb://localhost:27017/queueless-campus
   JWT_SECRET=your_super_secret_jwt_key
   REDIS_URL=redis://localhost:6379
   
   # Email Service (for OTPs)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Captcha Security
   CAPTCHA_SECRET=campus_smart_token_2024
   ```
4. **Firebase Configuration**:
   - Ensure the server account JSON file is placed at `backend/config/queuelesscampus-6246c-firebase-adminsdk-fbsvc-7fc783d062.json`.
   - *Note: If this file is missing, FCM notifications will be disabled.*
5. **Start the server**:
   ```bash
   # Development Mode
   npm run dev
   
   # Production Mode
   npm start
   ```

---

## 🖥️ 2. Admin Panel Setup

The admin panel is a React-based web dashboard.

1. **Navigate to the directory**:
   ```bash
   cd admin-panel
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. **Access the dashboard**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 3. Mobile App (Student) Setup

The mobile app is built with React Native CLI.

1. **Navigate to the directory**:
   ```bash
   cd FrontendMobileApp
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the Metro Bundler**:
   In a dedicated terminal window:
   ```bash
   npx react-native start
   ```
4. **Run on Android**:
   Ensure an emulator is running or a physical device is connected via USB:
   ```bash
   npx react-native run-android
   ```

---

## 🗄️ 4. Version Control & Contributions

This project is configured as a **monorepo**. To ensure a clean contribution process:

1. **Single Git Repository**: The entire project uses a single `.git` directory at the absolute root folder (`Queueless-Campus/`). Ensure there are no nested `.git` folders in any of the subdirectories (such as `FrontendMobileApp/`).
2. **Global `.gitignore`**: The root `.gitignore` is pre-configured to handle all dependencies comprehensively. When you push code, it will automatically ignore:
   - `node_modules/` across all projects
   - Environment variables (`.env`, `.env.local`)
   - Logs, caches, and crash reports (`npm-debug.log`, etc.)
   - Platform-specific build artifacts (`.expo/`, `android/app/build/`, `ios/Pods/`, `.next`, `dist/`)
   - Sensitive Firebase configurations (`backend/config/*.json`)
3. **Environment Secrets**: Never commit sensitive configuration files. Provide `.env.example` equivalents instead.

---

## 💡 Troubleshooting

> [!TIP]
> **Metro Bundler Issues**: If the app fails to load, try clearing the cache:
> `npx react-native start --reset-cache`

> [!IMPORTANT]
> **MongoDB Connection**: Ensure your MongoDB service is running before starting the backend. If using Atlas, replace the `MONGO_URI` in `.env` with your string.

> [!WARNING]
> **Redis Connection**: If the backend crashes with "Could not connect to Redis", ensure the Redis server is started on port 6379.
