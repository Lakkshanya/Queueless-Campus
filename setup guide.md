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
- **Cloudflared**: (Optional) Recommended for creating public tunnels for mobile testing.
- **Git**: For version control.

---

## 📂 Project Structure

- `/backend`: Node.js/Express API with Socket.io.
- `/admin-panel`: React/Vite Administrative & Staff Dashboard (Dual Role).
- `/FrontendMobileApp`: React Native Student & Staff Application (Dual Role).

---

## 🏗️ 1. Backend Setup

The backend serves as the core API and manages real-time updates.

1. **Navigate to the directory**:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Configuration**:
   Create a `.env` file in the `backend/` directory:
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
   - Ensure the server account JSON file is placed at `backend/config/queuelesscampus-6246c-firebase-adminsdk-fbsvc-9543351b31.json`.
   - *Note: This is required for FCM notifications to function.*
5. **Start the server**:
   ```bash
   # Development Mode
   npm run dev
   ```
6. **Start Tunnel (Optional for Mobile Testing)**:
   If you are test on a physical device, run the PowerShell script to create a tunnel:
   ```powershell
   ./start-tunnel.ps1
   ```
   *Copy the generated `.trycloudflare.com` URL for the Mobile App config.*

---

## 🖥️ 2. Admin Panel Setup

The admin panel serves **Admins** (for management) and **Staff** (for queue operations).

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
   Open [http://localhost:5173](http://localhost:5173). Log in as Admin or Staff.

---

## 📱 3. Mobile App (Student & Staff) Setup

The mobile app supports both **Student** and **Staff** interfaces via role-based navigation.

1. **Navigate to the directory**:
   ```bash
   cd FrontendMobileApp
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Update API Configuration**:
   Edit `src/constants/config.ts`:
   ```typescript
   export const API_URL = 'https://YOUR_TUNNEL_URL.trycloudflare.com/api';
   export const BASE_URL = 'https://YOUR_TUNNEL_URL.trycloudflare.com';
   ```
4. **Start the Metro Bundler**:
   ```bash
   npx react-native start
   ```
5. **Run on Android**:
   ```bash
   npx react-native run-android
   ```

---

## 🔑 Operational Flow

1. **Admin Setup**: Create Services and Staff accounts via the Admin Panel.
2. **Staff Activation**: Staff must log in and click **"Start Session"** to begin accepting students.
3. **Student Flow**: Students join the queue via the Mobile App and receive real-time notifications (Serving, Next, Prepare).

---

## 🗄️ 4. Version Control

This project is a monorepo. 

- **Root Git**: Only one `.git` folder exists at the project root.
- **Gitignore**: Pre-configured to ignore all `node_modules`, `.env` files, and build artifacts.
- **Pushing**: Use `git push origin main` from the root folder.

---

## 💡 Troubleshooting

> [!TIP]
> **Metro Bundler Issues**: If the app fails to load, try clearing the cache:
> `npx react-native start --reset-cache`

> [!IMPORTANT]
> **MongoDB & Redis**: Both services must be running for the backend to start. 
> Default ports: MongoDB (27017), Redis (6379).

> [!WARNING]
> **Notification Failures**: If notifications aren't arriving, verify that the `backend/config` JSON file is valid and the device has an active internet connection.

