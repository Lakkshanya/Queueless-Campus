import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';

if (fs.existsSync(serviceAccountPath)) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')))
  });
  console.log('Firebase Admin SDK Initialized');
} else {
  console.warn('Firebase Service Account file not found. Push notifications will be mocked.');
}

export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!admin.apps.length) return { success: false, message: 'Firebase not initialized' };

  const message = {
    notification: { title, body },
    data,
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
};

export default admin;
