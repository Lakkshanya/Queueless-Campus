import {useEffect} from 'react';
import {Alert, Platform} from 'react-native';
import api from '../services/api';
import {useAppSelector} from '../store';

export const useNotifications = () => {
  const {user} = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!user) {
      return;
    }

    let messaging: any;
    try {
      messaging = require('@react-native-firebase/messaging').default;
    } catch (e) {
      console.warn(
        'Firebase Messaging Native Module not found. Please rebuild the app.',
      );
      return;
    }

    const setupNotifications = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          const token = await messaging().getToken();
          console.log('FCM Token:', token);
          await api.post('/auth/fcm-token', {fcmToken: token});
        }
      } catch (e) {
        console.error('Failed to setup notifications', e);
      }
    };

    setupNotifications();

    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      Alert.alert(
        remoteMessage.notification?.title || 'Notification',
        remoteMessage.notification?.body || '',
        [{text: 'OK'}],
      );
    });

    const onTokenRefresh = messaging().onTokenRefresh((token: string) => {
      api.post('/auth/fcm-token', {fcmToken: token});
    });

    return () => {
      unsubscribe();
      onTokenRefresh();
    };
  }, [user]);
};
