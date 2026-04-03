import admin from '../config/firebase.js';
import User from '../models/User.js';

export const sendNotification = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      console.log(`Notification skipped: User ${userId} has no FCM token.`);
      return;
    }

    const message = {
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      token: user.fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

export const broadcastNotification = async (role, title, body, data = {}) => {
  try {
    const users = await User.find({ role, fcmToken: { $ne: null } });
    const tokens = users.map(u => u.fcmToken);

    if (tokens.length === 0) return;

    const message = {
      notification: { title, body },
      data,
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`${response.successCount} messages were sent successfully`);
    return response;
  } catch (error) {
    console.error('Error broadcasting message:', error);
  }
};
