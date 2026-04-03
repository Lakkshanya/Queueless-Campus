import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  Users,
  FileCheck,
  AlertCircle,
  ChevronRight,
  GraduationCap,
} from 'lucide-react-native';
import api from '../../services/api';
import {useAppSelector} from '../../store';

const SectionDashboard = () => {
  const navigation = useNavigation<any>();
  const [sectionData, setSectionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSectionData = async () => {
    try {
      const response = await api.get('/sections/my-section');
      setSectionData(response.data);
    } catch (error) {
      console.error('Error fetching section data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSectionData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSectionData();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#C2410C" size="large" />
      </View>
    );
  }

  const pendingDocs =
    sectionData?.students?.reduce((total: number, student: any) => {
      const pending =
        student.documents?.filter((d: any) => d.status === 'pending').length ||
        0;
      return total + pending;
    }, 0) || 0;

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <View className="mb-8">
        <Text className="text-stone-500 text-[10px] items-center uppercase font-black tracking-[4px] mb-1">
          Faculty Advisor
        </Text>
        <Text className="text-textPrimary text-3xl font-bold">My Section</Text>
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
        <View className="bg-card rounded-[32px] p-8 border border-stone-800 mb-6">
          <View className="flex-row items-center mb-6">
            <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center border border-primary/20">
              <GraduationCap color="#9A3412" size={24} />
            </View>
            <View className="ml-4">
              <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-widest">
                {sectionData?.year || '---'}
              </Text>
              <Text className="text-textPrimary text-xl font-bold">
                {sectionData?.name || 'No Section Assigned'}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between pt-6 border-t border-stone-800">
            <View className="items-center flex-1">
              <Text className="text-primary text-2xl font-black">
                {sectionData?.students?.length || 0}
              </Text>
              <Text className="text-textSecondary text-[10px] uppercase font-bold mt-1">
                Students
              </Text>
            </View>
            <View className="w-[1px] h-10 bg-stone-800 self-center" />
            <View className="items-center flex-1">
              <Text className="text-buttonSecondary text-2xl font-black">
                {pendingDocs}
              </Text>
              <Text className="text-textSecondary text-[10px] uppercase font-bold mt-1">
                Pending Docs
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-textSecondary text-xs uppercase font-bold tracking-widest mb-4 ml-2">
          Quick Actions
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('SectionStudentList', {
              students: sectionData?.students,
            })
          }
          className="bg-card rounded-2xl p-6 flex-row items-center justify-between border border-stone-800 mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-500/10 rounded-xl items-center justify-center mr-4">
              <Users color="#3b82f6" size={20} />
            </View>
            <View>
              <Text className="text-textPrimary font-bold">
                Student Directory
              </Text>
              <Text className="text-textSecondary text-[10px]">
                View all students in {sectionData?.name}
              </Text>
            </View>
          </View>
          <ChevronRight color="#44403C" size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('BulkVerification', {
              students: sectionData?.students,
            })
          }
          className="bg-card rounded-2xl p-6 flex-row items-center justify-between border border-stone-800 mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-green-500/10 rounded-xl items-center justify-center mr-4">
              <FileCheck color="#10b981" size={20} />
            </View>
            <View>
              <Text className="text-textPrimary font-bold">
                Document Verification
              </Text>
              <Text className="text-textSecondary text-[10px]">
                {pendingDocs} pending reviews
              </Text>
            </View>
          </View>
          <ChevronRight color="#44403C" size={20} />
        </TouchableOpacity>

        <View className="bg-orange-950/20 p-6 rounded-2xl border border-orange-900/30 mt-4">
          <View className="flex-row items-center mb-2">
            <AlertCircle color="#FDBA74" size={16} />
            <Text className="text-orange-200 text-xs font-bold ml-2 uppercase">
              Advisor Responsibility
            </Text>
          </View>
          <Text className="text-stone-400 text-xs leading-5">
            As a Faculty Advisor, you are responsible for the first-level
            verification of all students in {sectionData?.name}. Ensure document
            validity before approval.
          </Text>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default SectionDashboard;
