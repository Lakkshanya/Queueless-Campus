import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import {useAppSelector} from '../../store';
import {
  Send,
  Users,
  ShieldCheck,
  Bell,
  Activity,
  Zap,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import api from '../../services/api';

const StaffNotificationScreen = ({navigation}: any) => {
  const {user} = useAppSelector(state => state.auth);
  const [target, setTarget] = useState('student'); // 'student' or 'admin'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('broadcast');
  const [history, setHistory] = useState<any[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      setFetchingHistory(true);
      const response = await api.get('/notifications');
      setHistory(response.data);
    } catch (e) {
      console.error('Failed to fetch history', e);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleDispatch = async () => {
    if (!message.trim()) {
      Alert.alert(
        'Alert Error',
        'Please enter a message before sending.',
      );
      return;
    }
    setLoading(true);
    try {
      if (target === 'student') {
        const serviceId =
          user?.assignedService?._id || user?.assignedServices?.[0]?._id;
        if (!serviceId) {
          Alert.alert(
            'Scope Error',
            'No assigned service node detected for targeted broadcast.',
          );
          return;
        }
        await api.post('/notifications/staff/broadcast', {
          serviceId,
          message,
        });
        Alert.alert(
          'Message Sent',
          'Your alert has been broadcast to all students in line.',
        );
      } else {
        await api.post('/notifications/admin/notify', {message});
        Alert.alert(
          'Alert Sent',
          'The administration has been notified of your request.',
        );
      }
      setMessage('');
      if (activeTab === 'history') fetchHistory();
    } catch (error: any) {
      Alert.alert(
        'Dispatch Failed',
        error.response?.data?.message || 'Network authorization error.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0A09]">
      <StatusBar barStyle="light-content" />
      <View className="flex-1 px-8 pt-4">
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-12">
          <View>
            <View className="flex-row items-center gap-3 mb-4">
              <Bell color="#EA580C" size={14} strokeWidth={3} />
              <Text className="text-orange-600 text-[10px] font-bold tracking-widest uppercase opacity-60">
                Staff Alert System
              </Text>
            </View>
            <Text className="text-white text-4xl font-bold tracking-tight leading-none">
              Inbox & Alerts
            </Text>
          </View>
          <View className="w-16 h-16 bg-[#171412] rounded-[24px] items-center justify-center border border-stone-800 shadow-xl">
            <Zap color="#EA580C" size={24} strokeWidth={2.5} />
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row bg-[#171412] p-2 rounded-[24px] border border-stone-800/60 mb-10">
          <TouchableOpacity 
            onPress={() => setActiveTab('broadcast')} 
            className={`flex-1 py-4 rounded-[18px] items-center ${activeTab === 'broadcast' ? 'bg-[#0C0A09] border border-stone-800' : ''}`}>
            <Text className={`font-bold tracking-tight text-[11px] uppercase ${activeTab === 'broadcast' ? 'text-white' : 'text-stone-600'}`}>
              Broadcast
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('history')} 
            className={`flex-1 py-4 rounded-[18px] items-center ${activeTab === 'history' ? 'bg-[#0C0A09] border border-stone-800' : ''}`}>
            <Text className={`font-bold tracking-tight text-[11px] uppercase ${activeTab === 'history' ? 'text-white' : 'text-stone-600'}`}>
              History / Inbox
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{paddingBottom: 150}}
          showsVerticalScrollIndicator={false}>

          {activeTab === 'broadcast' ? (
            <>
              <View style={styles.cardShadow}>
                <View className="bg-[#171412] rounded-[48px] p-10 border border-stone-800/60 relative overflow-hidden mb-12">
                  <View className="absolute top-0 right-0 w-32 h-32 bg-orange-600/[0.03] rounded-full -mr-12 -mt-12 pointer-events-none" />
                  
                  <Text className="text-stone-700 text-[10px] font-bold tracking-widest mb-6 uppercase opacity-60">
                    Active Matrix Link
                  </Text>
                  
                  <View className="bg-[#0C0A09] rounded-[32px] p-7 border border-stone-800/80 mb-12 flex-row items-center opacity-70">
                    <View className="w-12 h-12 bg-orange-600/5 rounded-2xl items-center justify-center border border-orange-600/20 mr-5 shadow-inner">
                      <Activity color="#EA580C" size={18} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold tracking-tight text-base mb-1">
                        {user?.assignedServices?.[0]?.name || 'N/A'}
                      </Text>
                      <Text className="text-stone-800 text-[9px] font-bold tracking-tight uppercase opacity-60">
                        Auto-linked to your service node
                      </Text>
                    </View>
                  </View>

                  <Text className="text-stone-700 text-[10px] font-bold tracking-widest mb-6 uppercase opacity-60">
                    Allocation Target
                  </Text>
                  <View className="flex-row gap-5 mb-12">
                    <TouchableOpacity
                      onPress={() => setTarget('student')}
                      className={`flex-1 p-6 rounded-[32px] border-2 flex-col items-center justify-center ${
                        target === 'student'
                          ? 'bg-orange-600/10 border-orange-600'
                          : 'bg-[#0C0A09] border-stone-800'
                      }`}>
                      <Users color={target === 'student' ? '#EA580C' : '#44403C'} size={24} className="mb-3" />
                      <Text
                        className={`font-bold tracking-tight text-[11px] uppercase ${
                          target === 'student' ? 'text-white' : 'text-stone-700'
                        }`}>
                        Students
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTarget('admin')}
                      className={`flex-1 p-6 rounded-[32px] border-2 flex-col items-center justify-center ${
                        target === 'admin'
                          ? 'bg-orange-600/10 border-orange-600'
                          : 'bg-[#0C0A09] border-stone-800'
                      }`}>
                      <ShieldCheck color={target === 'admin' ? '#EA580C' : '#44403C'} size={24} className="mb-3" />
                      <Text
                        className={`font-bold tracking-tight text-[11px] uppercase ${
                          target === 'admin' ? 'text-white' : 'text-stone-700'
                        }`}>
                        Admin
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="text-stone-700 text-[10px] font-bold tracking-widest mb-6 uppercase opacity-60">
                    Transmission Content
                  </Text>
                  <View className="bg-[#0C0A09] rounded-[32px] p-8 border border-stone-800 min-h-[180px] mb-12 shadow-inner">
                    <TextInput
                      multiline
                      numberOfLines={6}
                      placeholder="Compose transmission..."
                      placeholderTextColor="#292524"
                      className="text-white font-bold tracking-tight text-lg"
                      value={message}
                      onChangeText={setMessage}
                      textAlignVertical="top"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleDispatch}
                    disabled={loading}
                    activeOpacity={0.8}
                    className="bg-orange-600 py-8 rounded-[32px] flex-row items-center justify-center shadow-xl shadow-orange-600/30">
                    {loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Send color="#FFF" size={22} strokeWidth={3} />
                        <Text className="text-white font-bold tracking-tight ml-4 text-sm uppercase">
                          Broadcast Alert
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View className="bg-orange-600/5 border border-orange-600/10 rounded-[32px] p-8">
                <View className="flex-row items-center mb-4">
                  <Activity color="#EA580C" size={14} />
                  <Text className="text-orange-600 text-[10px] font-bold tracking-widest ml-3 uppercase">
                    Transmission Security
                  </Text>
                </View>
                <Text className="text-stone-600 text-[11px] font-bold tracking-tight leading-relaxed italic opacity-80">
                  Broadcast traffic is prioritized for the 3-level sequence (Serving, Next, Prepare) to ensure zero-latency arrival.
                </Text>
              </View>
            </>
          ) : (
            <View className="space-y-6">
              {fetchingHistory ? (
                <View className="py-20 items-center">
                  <ActivityIndicator color="#EA580C" />
                </View>
              ) : history.length > 0 ? (
                history.map((item, idx) => (
                  <View key={idx} className="bg-[#171412] p-10 rounded-[40px] border border-stone-800/60 mb-6 shadow-xl">
                    <View className="flex-row justify-between items-start mb-6">
                      <View className="flex-1 mr-4">
                        <Text className="text-white font-bold tracking-tight text-2xl mb-2">
                          {item.title || 'Broadcast Event'}
                        </Text>
                        <View className="flex-row items-center">
                          <Clock color="#44403C" size={10} />
                          <Text className="text-stone-700 text-[10px] font-bold tracking-widest ml-2 uppercase">
                            {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </Text>
                        </View>
                      </View>
                      <View className={`w-3 h-3 rounded-full ${item.status === 'delivered' ? 'bg-emerald-500' : 'bg-orange-600'}`} />
                    </View>
                    <Text className="text-stone-400 text-sm leading-relaxed mb-6 font-medium">
                      {item.message}
                    </Text>
                    <View className="flex-row justify-between items-center bg-[#0C0A09] p-5 rounded-[24px] border border-stone-800">
                      <Text className="text-stone-600 text-[9px] font-bold tracking-widest uppercase">
                        Target: {item.target || 'General'}
                      </Text>
                      <ChevronRight color="#292524" size={14} />
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-40 items-center opacity-10">
                  <Bell color="#292524" size={64} strokeWidth={1} />
                  <Text className="text-[10px] font-bold tracking-[0.8em] mt-8 text-center uppercase">
                    History_Clear
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 20},
        shadowOpacity: 0.2,
        shadowRadius: 30,
      },
      android: {
        elevation: 20,
      },
    }),
  },
});

export default StaffNotificationScreen;

