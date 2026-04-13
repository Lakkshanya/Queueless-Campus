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

    let getToken,
      requestPermission,
      onMessage,
      onTokenRefresh,
      AuthorizationStatus;
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      const m = messaging();
      getToken = () => m.getToken();
      requestPermission = () => m.requestPermission();
      onMessage = (cb: any) => m.onMessage(cb);
      onTokenRefresh = (cb: any) => m.onTokenRefresh(cb);
      AuthorizationStatus = messaging.AuthorizationStatus;
    } catch (e) {
      console.warn(
        'Firebase Messaging Native Module not found. Please rebuild the app.',
      );
      return;
    }

    const setupNotifications = async () => {
      try {
        const authStatus = await requestPermission();
        const enabled =
          authStatus === AuthorizationStatus.Authorized ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          const token = await getToken();
          console.log('FCM Token:', token);
          await api.post('/auth/fcm-token', {fcmToken: token});
        }
      } catch (e) {
        console.error('Failed to setup notifications', e);
      }
    };

    setupNotifications();

    const unsubscribe = onMessage(async (remoteMessage: any) => {
      Alert.alert(
        remoteMessage.notification?.title || 'Notification',
        remoteMessage.notification?.body || '',
        [{text: 'OK'}],
      );
    });

    const unsubscribeToken = onTokenRefresh((token: string) => {
      api.post('/auth/fcm-token', {fcmToken: token});
    });

    return () => {
      unsubscribe();
      unsubscribeToken();
    };
  }, [user]);
};
