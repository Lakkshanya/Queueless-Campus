# QueueLess Campus Office - Getting Started

This project consists of three main modules:
1. **Backend**: Express API with Socket.io & MongoDB.
2. **Mobile App**: React Native CLI (Student App).
3. **Admin Panel**: React/Vite Dashboard (Admin & Staff).

---

## 🛠️ Prerequisites
- **Node.js**: v18+ 
- **MongoDB**: Local installation or MongoDB Atlas URI.
- **Android Studio**: Configured with SDK and Emulator (for Mobile App).
- **Git**: (Optional)

---

## 🚀 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `backend/` and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   EMAIL_USER=queuelesscampus@gmail.com
   EMAIL_PASS=oqmf olcg qaxw nnby
   ```
4. Start the server:
   ```bash
   npm start
   ```

---

## 🖥️ 2. Admin Panel Setup
1. Navigate to the admin-panel directory:
   ```bash
   cd admin-panel
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```
4. Access at `http://localhost:5173`.

---

## 📱 3. Mobile App (Student)
1. Navigate to the mobileapp directory:
   ```bash
   cd mobileapp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Android**: Ensure your emulator is running or device is connected.
   ```bash
   npx react-native run-android
   ```
   *Note: On Windows, use a separate terminal to keep the Metro Bundler running.*

---

## 🔑 Default Credentials (For Testing)
- **Role**: Admin
- **Email**: admin@campus.com
- **Password**: admin123

- **Role**: Staff
- **Email**: counter1@campus.com
- **Password**: staff123

---

## 📂 Project Structure
- `/backend`: API and logic.
- `/mobileapp`: React Native Source (NativeWind styling).
- `/admin-panel`: React Web Source (Tailwind styling).
