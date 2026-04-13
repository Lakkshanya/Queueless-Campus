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
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
          priority: 'max',
          visibility: 'public'
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

export const broadcastNotification = async (target, title, body, data = {}) => {
  try {
    let query = { fcmToken: { $ne: null } };
    
    if (target === 'students') {
      query.role = 'student';
    } else if (target === 'staff') {
      query.role = 'staff';
    } else if (target !== 'all') {
      query.role = target; // fallback for specific roles
    }

    const users = await User.find(query);
    const tokens = users.map(u => u.fcmToken);

    if (tokens.length === 0) {
      console.log('No eligible users with FCM tokens found for target:', target);
      return;
    }

    const message = {
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      tokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
          priority: 'max',
          visibility: 'public'
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`${response.successCount} messages were sent successfully to ${target}`);
    return response;
  } catch (error) {
    console.error('Error broadcasting message:', error);
  }
};
