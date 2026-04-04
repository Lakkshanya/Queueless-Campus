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
  CheckCheck,
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
    }

    return () => {
      socketService.off('turnApproaching');
    };
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'turn':
        return { bg: 'bg-primary/20', icon: <Bell color="#C2410C" size={20} /> };
      case 'alert':
        return { bg: 'bg-amber-500/20', icon: <AlertTriangle color="#f59e0b" size={20} /> };
      case 'academic':
        return { bg: 'bg-emerald-500/20', icon: <GraduationCap color="#10b981" size={20} /> };
      case 'document':
        return { bg: 'bg-blue-500/20', icon: <FileText color="#3b82f6" size={20} /> };
      default:
        return { bg: 'bg-stone-800', icon: <Info color="#D6D3D1" size={20} /> };
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <View className="flex-row justify-between items-end mb-8">
        <View>
          <Text className="text-textPrimary text-3xl font-black uppercase tracking-tighter">
            Alerts
          </Text>
          <Text className="text-stone-500 text-[10px] font-black uppercase tracking-widest mt-1">
            {unreadCount} Unread Message{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

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

        {notifications.map(notif => {
          const config = getIconConfig(notif.type || 'alert');
          return (
            <TouchableOpacity
              key={notif._id}
              activeOpacity={0.9}
              onPress={() => handleMarkAsRead(notif._id, notif.isRead)}
              className={`rounded-[24px] p-5 mb-4 flex-row border transition-all ${
                notif.isRead 
                  ? 'bg-stone-900/50 border-stone-800/50 opacity-60' 
                  : 'bg-[#1C1917] border-primary/30 shadow-lg shadow-primary/5 shadow-xl'
              }`}>
              <View
                className={`w-12 h-12 rounded-full items-center justify-center border ${
                  notif.isRead ? 'border-transparent' : 'border-primary/20'
                } ${config.bg}`}>
                {config.icon}
              </View>
              <View className="flex-1 ml-4 justify-center">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className={`font-black text-sm tracking-tight pr-4 flex-1 ${notif.isRead ? 'text-stone-400' : 'text-textPrimary'}`}>
                    {notif.title}
                  </Text>
                  <Text className="text-primary text-[9px] font-bold uppercase tracking-widest mt-1">
                    {getTimeAgo(notif.createdAt)}
                  </Text>
                </View>
                <Text className={`text-[11px] leading-5 ${notif.isRead ? 'text-stone-500' : 'text-stone-300'}`}>
                  {notif.message}
                </Text>
                
                {!notif.isRead && (
                  <View className="mt-3 flex-row items-center">
                    <CheckCheck color="#C2410C" size={14} />
                    <Text className="text-primary font-bold text-[9px] uppercase tracking-widest ml-1.5">Tap to acknowledge</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {!loading && notifications.length === 0 && (
          <View className="mt-20 items-center bg-stone-900/50 p-10 rounded-[40px] border border-stone-800 border-dashed shadow-2xl">
            <Inbox color="#78716C" size={64} />
            <Text className="text-textPrimary text-lg font-black mt-6 uppercase tracking-widest">
              Inbox Zero
            </Text>
            <Text className="text-textSecondary text-[10px] mt-2 text-center leading-5 uppercase tracking-[2px]">
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
