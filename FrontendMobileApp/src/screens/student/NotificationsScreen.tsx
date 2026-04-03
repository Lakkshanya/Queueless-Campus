import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Bell,
  Clock,
  AlertTriangle,
  Calendar,
  Info,
  Inbox,
} from 'lucide-react-native';
import api from '../../services/api';
import {useAppSelector} from '../../store';
import {socketService} from '../../services/socket';
import {FileText, GraduationCap} from 'lucide-react-native';

const NotificationsScreen = () => {
  const {user} = useAppSelector(state => state.auth);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!user) {return;}
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (user?.token) {
      socketService.connect(user.token);
      socketService.onTurnApproaching(() => {
        fetchNotifications();
      });
      // We can also listen for a generic 'notification' event if we add it to backend
    }

    return () => {
      socketService.off('turnApproaching');
    };
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'turn':
        return <Bell color="#9A3412" size={20} />;
      case 'alert':
        return <AlertTriangle color="#f59e0b" size={20} />;
      case 'academic':
        return <GraduationCap color="#10B981" size={20} />;
      case 'document':
        return <FileText color="#3b82f6" size={20} />;
      default:
        return <Info color="#D6D3D1" size={20} />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / 1000,
    );
    if (seconds < 60) {return 'Just now';}
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {return `${minutes}m ago`;}
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {return `${hours}h ago`;}
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <Text className="text-textPrimary text-3xl font-bold mb-8">
        Notifications
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C2410C"
          />
        }>
        {loading && (
          <ActivityIndicator color="#C2410C" size="large" className="mt-10" />
        )}

        {notifications.map(notif => (
          <TouchableOpacity
            key={notif._id}
            className={`bg-card rounded-xl p-4 mb-4 flex-row border ${
              notif.isRead ? 'border-stone-800' : ' '
            }`}>
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                notif.type === 'turn'
                  ? ' '
                  : notif.type === 'alert'
                  ? ' '
                  : 'bg-stone-700'
              }`}>
              {getIcon(notif.type)}
            </View>
            <View className="flex-1 ml-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-textPrimary font-bold text-base">
                  {notif.title}
                </Text>
                <Text className="text-textSecondary text-[10px]">
                  {getTimeAgo(notif.createdAt)}
                </Text>
              </View>
              <Text className="text-textSecondary text-xs leading-5">
                {notif.message}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {!loading && notifications.length === 0 && (
          <View className="mt-20 items-center bg-card/50 p-10 rounded-[40px] border border-stone-800 border-dashed">
            <Inbox color="#44403C" size={64} />
            <Text className="text-textPrimary text-lg font-black mt-6 uppercase tracking-widest">
              Inbox Zero
            </Text>
            <Text className="text-textSecondary text-xs mt-2 text-center leading-5 uppercase tracking-[2px]">
              You're all caught up! No new office alerts or token updates.
            </Text>
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
