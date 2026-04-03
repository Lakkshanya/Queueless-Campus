import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  Search,
  ChevronRight,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';
import api from '../../services/api';

const SectionStudentList = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [students, setStudents] = useState<any[]>(route.params?.students || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(!route.params?.students);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!route.params?.students) {
      fetchStudents();
    }
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/sections/my-section');
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const filteredStudents = students.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.collegeId?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getDocStatus = (docs: any[]) => {
    if (!docs || docs.length === 0) {
      return {label: 'No Docs', color: 'text-stone-500'};
    }
    const pending = docs.filter(d => d.status === 'pending').length;
    if (pending > 0) {
      return {label: `${pending} Pending`, color: 'text-buttonSecondary'};
    }
    const rejected = docs.filter(d => d.status === 'rejected').length;
    if (rejected > 0) {
      return {label: 'Rejected', color: 'text-red-400'};
    }
    return {label: 'Approved', color: 'text-green-500'};
  };

  const renderStudent = ({item}: {item: any}) => {
    const status = getDocStatus(item.documents);

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('StudentDetailVerification', {student: item})
        }
        className="bg-card rounded-2xl p-4 mb-4 flex-row items-center border border-stone-800">
        <View className="w-12 h-12 bg-stone-800 rounded-xl items-center justify-center mr-4">
          <User color="#D6D3D1" size={24} />
        </View>

        <View className="flex-1">
          <Text className="text-textPrimary font-bold text-base">
            {item.name}
          </Text>
          <Text className="text-textSecondary text-xs">
            {item.collegeId || 'No ID'}
          </Text>
          <View className="flex-row items-center mt-2">
            <Text
              className={`text-[10px] font-bold uppercase tracking-widest ${status.color}`}>
              {status.label}
            </Text>
            <Text className="text-stone-600 text-[10px] mx-2">•</Text>
            <Text className="text-stone-400 text-[10px] uppercase font-bold">
              {item.academicRecords?.enrollmentStatus || 'Pending'}
            </Text>
          </View>
        </View>

        <ChevronRight color="#44403C" size={20} />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <View className="flex-row items-center justify-between mb-8">
        <Text className="text-textPrimary text-2xl font-bold">
          Student Directory
        </Text>
        <Text className="text-primary font-bold">
          {filteredStudents.length} Students
        </Text>
      </View>

      <View className="bg-card border border-stone-800 rounded-2xl flex-row items-center px-4 mb-6">
        <Search color="#78716C" size={20} />
        <TextInput
          placeholder="Search by name or ID..."
          placeholderTextColor="#78716C"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-textPrimary h-14 ml-4 font-medium"
        />
      </View>

      {loading ? (
        <ActivityIndicator color="#C2410C" size="large" className="mt-10" />
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={item => item._id}
          renderItem={renderStudent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#C2410C"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 opacity-40">
              <AlertCircle color="#44403C" size={64} />
              <Text className="text-textPrimary font-bold mt-4 uppercase tracking-widest">
                No Students Found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default SectionStudentList;
