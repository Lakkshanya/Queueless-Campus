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
  FileText,
  GraduationCap,
  Activity,
  Zap,
  ShieldCheck,
} from 'lucide-react-native';
import api from '../../services/api';
import {useAppDispatch, useAppSelector, updateUser} from '../../store';
import {socketService} from '../../services/socket';
const NotificationsScreen = () => {
  const {user} = useAppSelector(state => state.auth);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchNotifications = async () => {
    if (!user) {
      return;
    }
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
        prev.map(n => (n._id === id ? {...n, isRead: true} : n)),
      );
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };
  const getIconConfig = (type: string) => {
    switch (type) {
      case 'turn':
        return {
          bg: 'bg-orange-600/10',
          color: '#EA580C',
          icon: <Bell size={20} />,
        };
      case 'staff_alert':
        return {
          bg: 'bg-blue-600/10',
          color: '#3b82f6',
          icon: <ShieldCheck size={20} />,
        };
      case 'academic':
        return {
          bg: 'bg-emerald-600/10',
          color: '#10b981',
          icon: <GraduationCap size={20} />,
        };
      case 'system_broadcast':
        return {bg: 'bg-primary/10', color: '#EA580C', icon: <Zap size={20} />};
      default:
        return {bg: 'bg-stone-900', color: '#78716C', icon: <Info size={20} />};
    }
  };
  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / 1000,
    );
    if (seconds < 60) {
      return 'Just now';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return new Date(dateStr).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  };
  const unreadCount = notifications.filter(n => !n.isRead).length;
  return (
    <View className="flex-1 bg-[#0C0A09]"><View className="px-6 pt-16 mb-12"><View className="flex-row items-center gap-2 mb-4"><Activity color="#EA580C" size={12} strokeWidth={3} /><Text className="text-orange-600 text-xs font-bold tracking-tight">
            Network_Alerts
          </Text></View><View className="flex-row justify-between items-end"><Text className="text-textPrimary text-4xl font-bold tracking-tight leading-none">
            
            Inbox
          </Text><View className="shadow-lg shadow-orange-950/40 elevation-8"><View className="bg-orange-600 px-4 py-1.5 rounded-full border border-orange-600/20"><Text className="text-white text-xs font-bold tracking-tight leading-none">
                
                {unreadCount} NEW
              </Text></View></View></View></View><ScrollView
        className="px-6"
        contentContainerStyle={{paddingBottom: 120}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
          />
        }>
        
        {loading && (
          <ActivityIndicator color="#EA580C" size="large" className="mt-20" />
        )}
        {notifications.map((notif, idx) => {
          const config = getIconConfig(notif.type || 'system_broadcast');
          return (
            <View
              key={notif._id || idx}
              className={!notif.isRead ? "shadow-2xl shadow-orange-600/20 elevation-12" : ""}><TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleMarkAsRead(notif._id, notif.isRead)}
                className={`rounded-[32px] p-6 flex-row border transition-all mb-6 ${
                  notif.isRead
                    ? 'bg-stone-900/20 border-stone-800/40 opacity-40'
                    : 'bg-[#171412] border-orange-600/20'
                }`}><View className="absolute top-0 right-0 w-24 h-24 bg-orange-600/[0.01] rounded-full -mr-12 -mt-12 pointer-events-none" /><View
                  className={`w-12 h-12 rounded-[18px] items-center justify-center border ${
                    notif.isRead ? 'border-transparent' : 'border-orange-600/10'
                  } ${config.bg}`}>
                  
                  {React.cloneElement(config.icon as React.ReactElement, {
                    color: config.color,
                    strokeWidth: 2.5,
                  })}
                </View><View className="flex-1 ml-6"><View className="flex-row justify-between items-start mb-2"><Text
                      className={`font-bold tracking-tight text-sm pr-6 flex-1 ${
                        notif.isRead ? 'text-stone-600' : 'text-textPrimary'
                      }`}>
                      
                      {notif.title}
                    </Text><Text className="text-stone-800 text-xs font-bold tracking-tight mt-1">
                      
                      {getTimeAgo(notif.createdAt)}
                    </Text></View><Text
                    className={`text-xs leading-5 font-medium ${
                      notif.isRead ? 'text-stone-700' : 'text-stone-500'
                    }`}>
                    
                    {notif.message}
                  </Text>
                  {!notif.isRead && (
                    <View className="mt-5 flex-row items-center bg-orange-600/5 px-3 py-1.5 rounded-full border border-orange-600/10 w-fit"><CheckCheck
                        color="#EA580C"
                        size={12}
                        strokeWidth={3}
                      /><Text className="text-orange-600 font-bold tracking-tight text-xs ml-2">
                        ACKNOWLEDGE PROTOCOL
                      </Text></View>
                  )}
                </View></TouchableOpacity></View>
          );
        })}
        {!loading && notifications.length === 0 && (
          <View className="mt-20 shadow-xl shadow-black/30 elevation-8"><View className="items-center bg-[#171412] p-10 rounded-[32px] border border-stone-800/60 border-dashed relative overflow-hidden"><View className="absolute top-0 left-0 w-full h-full bg-orange-600/[0.01] pointer-events-none" /><Inbox color="#292524" size={72} strokeWidth={1} /><Text className="text-stone-700 text-xl font-bold tracking-tight mt-8 uppercase">
                Comms_Idle
              </Text><Text className="text-stone-800 text-xs mt-6 text-center leading-5 font-bold tracking-tight px-8 uppercase">
                Operational grid is quiet. No administrative broadcasts pending
                at this time.
              </Text></View></View>
        )}
        <View className="h-40" /></ScrollView></View>
  );
};
export default NotificationsScreen;
