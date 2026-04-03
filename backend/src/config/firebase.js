import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.join(process.cwd(), 'config', 'queuelesscampus-6246c-firebase-adminsdk-fbsvc-7fc783d062.json');

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin initialized with service account file');
} catch (error) {
  console.warn('Firebase Service Account file not found or invalid. FCM disabled.', error.message);
}

export default admin;
