import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  ArrowLeft,
  GraduationCap,
  FileText,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import {useAppSelector, useAppDispatch} from '../../store';
import {updateUser} from '../../store/slices/authSlice';
import api from '../../services/api';

const RecordsScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.auth);
  const recordsData = user?.academicRecords || {};
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const profileRes = await api.get('/auth/me');
      dispatch(updateUser(profileRes.data));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const documentsStatus =
    user?.documents?.length > 0
      ? user.documents.every((d: any) => d.status === 'verified')
        ? 'Verified'
        : 'Pending'
      : 'Not Started';

  const records = [
    {
      title: 'Enrollment Status',
      desc: user?.collegeId
        ? `Student ID: ${user.collegeId}`
        : 'ID Mapping Required',
      detail: `Section: ${user?.section?.name || 'Not Assigned'}\nAdvisor: ${
        user?.section?.facultyAdvisor?.name || 'Assigning...'
      }\nYear: ${user?.yearOfStudy || 'N/A'}`,
      status: user?.academicRecords?.enrollmentStatus || 'Active',
      icon: <GraduationCap color="#9A3412" />,
    },
    {
      title: 'Academic Progress',
      desc: `CGPA: ${user?.academicRecords?.cgpa || '0.00'}`,
      detail:
        recordsData.academicProgress ||
        'All courses in current semester are tracked.',
      status: user?.academicRecords?.cgpa ? 'Updated' : 'Pending',
      icon: <CheckCircle color="#10B981" />,
    },
    {
      title: 'Document Records',
      desc: user?.documents?.length
        ? `${user.documents.length} documents uploaded`
        : 'Official transcripts & validations',
      detail: 'View and upload your mandatory documents.',
      status: documentsStatus,
      icon: <FileText color="#C2410C" />,
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-12"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#C2410C"
        />
      }>
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft color="#D6D3D1" size={24} />
        </TouchableOpacity>
        <Text className="text-textPrimary text-2xl font-bold">
          Academic Records
        </Text>
      </View>

      <View className="bg-card p-6 rounded-3xl border border-stone-800 mb-8">
        <View className="flex-row items-center mb-4">
          <FileText color="#9A3412" size={24} />
          <Text className="text-primary font-bold ml-2 text-lg">
            Student Dossier
          </Text>
        </View>
        <Text className="text-textSecondary text-sm leading-6">
          Access your digital academic footprint, certificates, and enrollment
          validations directly from the campus office database.
        </Text>
      </View>

      <View className="space-y-6 mb-12">
        {/* Enrollment Status Card */}
        <View className="bg-card rounded-[32px] p-8 border border-stone-800 shadow-2xl relative overflow-hidden">
           <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
           <View className="flex-row justify-between items-center mb-6">
              <View className="w-12 h-12 bg-stone-900 rounded-2xl items-center justify-center border border-stone-800">
                 <GraduationCap color="#9A3412" size={24} />
              </View>
              <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                 <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                   {user?.academicRecords?.enrollmentStatus || 'Active'}
                 </Text>
              </View>
           </View>
           <Text className="text-textSecondary text-[10px] font-black uppercase tracking-[0.3em] mb-2">Enrollment Identity</Text>
           <Text className="text-textPrimary text-3xl font-black uppercase tracking-tighter mb-4">{user?.name}</Text>
           <View className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-800/50">
              <View>
                 <Text className="text-stone-600 text-[8px] font-black uppercase tracking-widest mb-1">Student ID</Text>
                 <Text className="text-textPrimary font-bold text-xs">{user?.collegeId || 'N/A'}</Text>
              </View>
              <View>
                 <Text className="text-stone-600 text-[8px] font-black uppercase tracking-widest mb-1">Section</Text>
                 <Text className="text-textPrimary font-bold text-xs">{user?.section?.name || 'Not Assigned'}</Text>
              </View>
           </View>
        </View>

        {/* CGPA Card */}
        <View className="bg-[#1C1917] rounded-[32px] p-8 border border-stone-800 shadow-2xl relative overflow-hidden">
           <View className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -ml-16 -mb-16" />
           <View className="flex-row justify-between items-center mb-6">
              <View className="w-12 h-12 bg-stone-900 rounded-2xl items-center justify-center border border-stone-800">
                 <CheckCircle color="#10B981" size={24} />
              </View>
              <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                 <Text className="text-primary text-[10px] font-black uppercase tracking-widest">Official Score</Text>
              </View>
           </View>
           <Text className="text-stone-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Academic Performance</Text>
           <View className="flex-row items-baseline">
              <Text className="text-textPrimary text-6xl font-black tracking-tighter">{user?.academicRecords?.cgpa || '0.00'}</Text>
              <Text className="text-stone-600 text-xl font-bold ml-2 uppercase tracking-widest">CGPA</Text>
           </View>
           <Text className="text-stone-600 text-[10px] font-bold uppercase mt-4 tracking-widest leading-relaxed">
             {recordsData.academicProgress || 'All courses in current semester are tracked and verified.'}
           </Text>
        </View>

        {/* Documents Snapshot */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Documents')}
          className="bg-stone-900/50 rounded-[32px] p-8 border border-stone-800 border-dashed flex-row items-center justify-between active:scale-95 transition-all">
           <View className="flex-row items-center gap-6">
              <View className="w-12 h-12 bg-stone-900 rounded-2xl items-center justify-center border border-stone-800">
                 <FileText color="#C2410C" size={24} />
              </View>
              <View>
                 <Text className="text-textPrimary font-bold text-base uppercase tracking-tighter">Document Vault</Text>
                 <Text className="text-stone-600 text-[10px] font-bold uppercase tracking-widest mt-1">
                    {user?.documents?.length || 0} Records Found
                 </Text>
              </View>
           </View>
           <ArrowLeft color="#44403C" size={20} style={{transform: [{rotate: '180deg'}]}} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RecordsScreen;
