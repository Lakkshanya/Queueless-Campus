# QueueLess Campus - Getting Started

This project consists of three main modules:
1. **Backend**: Express API with Socket.io, MongoDB, and Redis.
2. **Mobile App**: React Native Student & Staff Application.
3. **Admin Panel**: React/Vite Dashboard for Admin & Staff operations.

---

## 🛠️ Prerequisites
- **Node.js**: v18+ 
- **MongoDB**: Local installation or Atlas URI.
- **Redis**: Required for queue management.
- **Android Studio**: Configured with SDK and Emulator.

---

## 🚀 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in `backend/` (see `setup guide.md` for full config):
   ```env
   PORT=8989
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   REDIS_URL=redis://localhost:6379
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

---

## 🖥️ 2. Admin Panel Setup
1. Navigate to the admin-panel directory:
   ```bash
   cd admin-panel
   npm install
   ```
2. Run in development mode:
   ```bash
   npm run dev
   ```
3. Access at `http://localhost:5173`.

---

## 📱 3. Mobile App (Student & Staff)
1. Navigate to the FrontendMobileApp directory:
   ```bash
   cd FrontendMobileApp
   npm install
   ```
2. **Setup**: Update `src/constants/config.ts` with your local IP or Tunnel URL.
3. **Run**: 
   ```bash
   npx react-native start
   npx react-native run-android
   ```

---

## 🔑 Default Credentials (Testing)
- **Role**: Admin
  - **Email**: admin@campus.com
  - **Password**: admin123

- **Role**: Staff
  - **Email**: counter1@campus.com
  - **Password**: staff123

---

## 📂 Project Structure
- `/backend`: Core API and Socket logic.
- `/FrontendMobileApp`: React Native Source (NativeWind styling).
- `/admin-panel`: React Web Source (Tailwind styling).
