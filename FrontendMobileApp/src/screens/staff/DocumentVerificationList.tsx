import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  FileText,
  ChevronRight,
  User,
  AlertCircle,
  Clock,
} from 'lucide-react-native';
import api from '../../services/api';

const DocumentVerificationList = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  const fetchPendingSubmissions = async () => {
    try {
      // Fetch students with pending documents
      const response = await api.get('/staff/pending-verifications');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingSubmissions();
  };

  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('StudentDetailVerification', {student: item})}
      className="bg-card rounded-[24px] p-5 mb-4 border border-stone-800 flex-row items-center">
      <View className="w-12 h-12 bg-stone-900 rounded-full items-center justify-center mr-4 border border-stone-800">
        <User color="#9A3412" size={24} />
      </View>
      <View className="flex-1">
        <Text className="text-textPrimary font-bold text-base">{item.name}</Text>
        <Text className="text-textSecondary text-[10px] tracking-widest uppercase">
          {item.collegeId} • {item.section?.name || 'N/A'}
        </Text>
        <View className="flex-row items-center mt-2">
           <Clock color="#C2410C" size={10} />
           <Text className="text-primary text-[10px] font-bold ml-1 uppercase">
             {item.documents?.filter((d: any) => d.status === 'pending').length} Pending Requirements
           </Text>
        </View>
      </View>
      <ChevronRight color="#44403C" size={20} />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <View className="mb-8">
        <Text className="text-textPrimary text-2xl font-black uppercase tracking-tighter">
          Verification Center
        </Text>
        <Text className="text-stone-600 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
          Pending Student Submissions
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#9A3412" size="large" className="mt-10" />
      ) : (
        <FlatList
          data={students}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#9A3412"
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 bg-stone-900/20 rounded-[40px] border border-stone-800 border-dashed">
              <AlertCircle color="#44403C" size={48} />
              <Text className="text-textSecondary text-sm mt-4 text-center font-bold">
                No Pending Submissions Found
              </Text>
              <Text className="text-stone-600 text-[10px] mt-2 uppercase tracking-widest">
                System is currently up to date
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default DocumentVerificationList;
