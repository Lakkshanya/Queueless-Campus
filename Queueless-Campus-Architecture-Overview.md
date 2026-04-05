# 🏗️ Queueless-Campus - Architecture & Project Overview

This document provides a comprehensive overview of the **Queueless-Campus** platform's architecture, including detailed documentation of the frontend pages, backend components, network architecture, and all recent major code updates and fixes performed.

---

## 📂 1. High-Level Project Structure

The project operates as a monorepo consisting of three main modules:

1. **`/backend`**: The Node.js / Express base that handles core business logic, real-time queues, database operations, and user authentication.
2. **`/admin-panel`**: A React application (built with Vite) that provides administrative control and a staff-facing dashboard for document verification and queue management.
3. **`/FrontendMobileApp`**: A React Native CLI application for both Students and Staff to access services, join queues, track their position, and verify documentation dynamically.

---

## 🖥️ 2. Admin Panel (Web)

The Admin Panel serves two main execution roles: System Administrators and Staff Members.

### Pages & Routing Structure (`/admin-panel/src/pages`)
* **`AdminDashboard.jsx`**: The core administrative hub. Provides high-level real-time analytics, queue monitoring, counter assignments, and platform configuration.
* **`StaffDashboard.jsx`**: The interface tailored for Staff members to manage their assigned sections, advance the queue, and process student requests.
* **`LiveMonitoring.jsx`**: A real-time view to track live terminal usages and active queues using WebSocket/polling connections.
* **`AnalyticsPage.jsx`**: Historical and live data visualizations for platform performance.
* **`DocumentVerification.jsx` & `RequirementManagement.jsx`**: Modules utilized by staff/admins to oversee required documents for specific services, establishing prerequisites for student requests.
* **`NotificationControl.jsx`**: Broadcast interface allowing admins to push updates to the mobile application via Firebase Cloud Messaging.
* **Auth Pages**: `Login.jsx`, `Signup.jsx`, `OTPVerify.jsx`, `RoleSelection.jsx` handle secure access using JWT validations.
* **Management Pages**: `StaffManagement.jsx`, `StudentManagement.jsx`, `SectionManagement.jsx`, `ServiceManagement.jsx` perform direct CRUD operations on the backing MongoDB database.

### Recent Interface Standardization
* **Aesthetic and Professional Cleanup**: Removal of jargon, sci-fi terms, and italic typography to ensure functional academic language.
* **Component-level Styling**: Removed CSS forced uppercase transformations (`text-transform: uppercase`) from inputs and text elements, resulting in standard, professional readability across data entry points.

---

## 📱 3. Mobile App (Student & Staff) 

The Mobile App serves as the primary end-user interface for the campus queuing system.

### Pages & Navigation (`/FrontendMobileApp/src/screens/`)

#### Authentication Module (`/auth`)
* `LoginScreen.tsx`, `SignupScreen.tsx`, `OTPScreen.tsx`, `ForgotPasswordScreen.tsx`: Manages onboarding and standardizes the user prior to assigning JWT tokens.
* `ProfileCompletionScreen.tsx`: Captures necessary baseline academic attributes.

#### Student Module (`/student`)
* **`StudentDashboard.tsx`**: The main hub for the student to select services, track estimated wait times, and view current assigned tokens.
* **`TokenBooking.tsx` & `LiveQueueScreen.tsx`**: Critical operational screens that interface with the queuing algorithm in the backend. They display real-time positioning and ETAs.
* **`DocumentsScreen.tsx`**: A repository where students upload or inspect requested system prerequisites.
* **`ServiceSelection.tsx`, `SectionInfoScreen.tsx`**: Navigation components guiding users to the correct queue.

#### Staff Module (`/staff`)
* **`StaffDashboard.tsx`**: Mobile counterpart to the web functionally (calling next numbers, halting queues, taking a break).
* **`DocumentVerificationList.tsx` & `StudentDetailVerification.tsx`**: Interface allowing staff to review and approve/reject documents sent by students dynamically.
* **`SectionStudentList.tsx` & `SectionDashboard.tsx`**: Provides granular overviews directly on a mobile device for floor staff.

### Network Integration
* Employs Axios mapped through dynamic internal network URL hooks (`/services/API.js` or similar configuration).
* UI built leveraging Tailwind/NativeWind based on `nativewind-env.d.ts` and style configurations.

---

## ⚙️ 4. Backend Engine

The backend runs an Express.JS routing pattern mapped to MongoDB.

### Directory Overview (`/backend/src/`)
* **`/models`**: Contains Mongoose Schemas (e.g., `User`, `Token`, `Counter`, `Section`, `Service`, `Notification`).
* **`/controllers`**: Core execution logic (e.g., creating tokens, assigning variables, advancing queue metrics).
* **`/routes`**: The Express APIs including `analyticsRoutes.js`, `authRoutes.js`, `counterRoutes.js`, `tokenRoutes.js` and `staffRoutes.js`.
* **`/middleware`**: Authorization (JWT validation, Role checks).
* **`/services`**: External API integrations (e.g., Email/OTP via SendGrid or Nodemailer, Firebase FCM setup).

---

## 🌐 5. Networking Architecture

* **Traffic Flow**: 
  - The Mobile App accesses `http://<local-network-ip>:8989` natively during dev (via Emulators running `10.0.2.2`).
  - Production deployments / live testing are bridged via robust cloud tunnels (like Cloudflared, Ngrok) connecting the outside world to the internal backend.
* **Database Alignment**: Connected strictly locally (`localhost:27017/queueless-campus`) but scalable via MongoDB Atlas string replacement.
* **Redis Queue Management**: Implemented for real-time memory handling so Socket bindings run fluidly during major campus events.

---

## 📋 6. Summary of Execution (Recent Modifications)

Below is an overview of the pivotal work implemented recently across the project architecture:

1. **Git Repository Hygiene & Flow Validation**
   - Tracked down "Large File Detected" GitHub rejection errors.
   - Fixed the root `.gitignore` to dynamically exclude `.apk` builds, cached resources, and localized executable binaries (e.g., `cloudflared.exe`).
   
2. **Hardcoded Mock Data Purge**
   - Conducted a full pass over the `admin-panel` and `FrontendMobileApp` to remove legacy placeholder strings and hardcoded arrays.
   - Refactored `Dashboard` metric tiles and Data tables so they process actual Axios fetching pipelines strictly resolving against database inputs.

3. **Restoration of Operational Networking**
   - Re-established missing Cloudflare routes/tunnels and corrected network URL errors to achieve true end-to-end communication from the Mobile App to the Database.
   - Re-activated "Add Terminal" logic and "Notification Broadcast" tools directly onto production-ready states on the Admin interface.

4. **Setup Documentation Delivery**
   - Mapped all underlying systems and bundled dependencies into a single accessible `setup guide.md` at the project trunk. Includes dependencies for Node, MongoDB, Redis, Android SDKs, and Environment Secrets.
