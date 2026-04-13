import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';
import api from './api';

class FCMService {
  async register() {
    this.checkPermission();
    this.createNotificationListeners();
  }

  async checkPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.Authorized ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      this.getToken();
    }
  }

  async getToken() {
    try {
      let fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        this.updateTokenOnServer(fcmToken);
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  }

  async updateTokenOnServer(token: string) {
    try {
      await api.post('/auth/fcm-token', {fcmToken: token});
    } catch (error) {
      console.log('Failed to update FCM token on server');
    }
  }

  createNotificationListeners() {
    // When the application is running, but in the background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });

    // When the application is opened from a quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });

    // Foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      Alert.alert(
        remoteMessage.notification?.title || 'Notification',
        remoteMessage.notification?.body || '',
      );
    });

    // Token refresh
    messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      this.updateTokenOnServer(token);
    });
  }

  async deleteToken() {
    try {
      await messaging().deleteToken();
    } catch (error) {
      console.log('Error deleting token:', error);
    }
  }
}

export const fcmService = new FCMService();
