import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {
  User,
  FileText,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  GraduationCap,
  Info,
  Eye,
} from 'lucide-react-native';
import api from '../../services/api';

const StudentDetailVerification = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [student, setStudent] = useState<any>(route.params?.student);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/sections/my-section');
      const updatedStudent = response.data.students.find(
        (s: any) => s._id === student._id,
      );
      if (updatedStudent) {
        setStudent(updatedStudent);
      }
    } catch (error) {
      console.error('Error refreshing student:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fields for academic update
  const [cgpa, setCgpa] = useState(
    student?.academicRecords?.cgpa?.toString() || '0',
  );
  const [enrollmentStatus, setEnrollmentStatus] = useState(
    student?.academicRecords?.enrollmentStatus || 'Pending',
  );

  const handleUpdateAcademic = async () => {
    setLoading(true);
    try {
      await api.put('/staff/update-student-academic', {
        studentId: student._id,
        cgpa: parseFloat(cgpa),
        enrollmentStatus,
      });
      Alert.alert('Success', 'Student academic record updated');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async (
    docId: string,
    status: 'verified' | 'rejected',
  ) => {
    let remarks = '';
    
    const submitVerification = async (comments: string) => {
      try {
        const response = await api.put('/staff/verify-student-document', {
          studentId: student._id,
          documentId: docId,
          status,
          comments,
        });
        setStudent(response.data.student);
        Alert.alert('Success', `Document has been ${status}`);
      } catch (error: any) {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Verification failed',
        );
      }
    };

    if (status === 'rejected') {
      Alert.prompt(
        'Reject Document',
        'Please provide a reason for rejection:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            onPress: (comment) => submitVerification(comment || 'No remarks provided'),
            style: 'destructive'
          }
        ],
        'plain-text'
      );
    } else {
      Alert.alert(
        'Verify Document',
        'Are you sure you want to approve this document?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Confirm',
            onPress: () => submitVerification('Verified by Staff'),
          }
        ],
      );
    }
  };

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center">
          <ChevronLeft color="#D6D3D1" size={24} />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold ml-2">
          Verification Panel
        </Text>
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
        {/* Profile Card */}
        <View className="bg-card rounded-3xl p-6 border border-stone-800 mb-6 flex-row items-center">
          <View className="w-16 h-16 bg-stone-800 rounded-full items-center justify-center mr-4">
            <User color="#C2410C" size={32} />
          </View>
          <View>
            <Text className="text-textPrimary text-xl font-bold">
              {student?.name}
            </Text>
            <Text className="text-textSecondary text-xs">
              {student?.collegeId}
            </Text>
            <View className="bg-primary/10 px-2 py-0.5 rounded-full mt-1 border border-primary/20 self-start">
              <Text className="text-primary text-[8px] font-bold uppercase">
                {student?.yearOfStudy || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Academic Controls */}
        <View className="bg-card rounded-3xl p-6 border border-stone-800 mb-6">
          <Text className="text-textPrimary font-bold text-base mb-4 flex-row items-center">
            <GraduationCap color="#9A3412" size={18} className="mr-2" />{' '}
            Academic Status
          </Text>

          <View className="space-y-4">
            <View>
              <Text className="text-textSecondary text-[10px] uppercase font-bold mb-2 ml-1">
                Enrollment Status
              </Text>
              <View className="flex-row space-x-2">
                {['Active', 'Inactive', 'Pending'].map(status => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setEnrollmentStatus(status)}
                    className={`flex-1 py-3 rounded-xl border items-center ${
                      enrollmentStatus === status
                        ? 'bg-primary border-primary'
                        : 'bg-background border-stone-800'
                    }`}>
                    <Text
                      className={`text-[10px] font-bold uppercase ${
                        enrollmentStatus === status
                          ? 'text-white'
                          : 'text-textSecondary'
                      }`}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-textSecondary text-[10px] uppercase font-bold mb-2 ml-1">
                Current CGPA
              </Text>
              <TextInput
                value={cgpa}
                onChangeText={setCgpa}
                keyboardType="numeric"
                className="bg-background border border-stone-800 h-14 rounded-xl px-4 text-textPrimary font-bold"
              />
            </View>

            <TouchableOpacity
              onPress={handleUpdateAcademic}
              disabled={loading}
              className="bg-buttonPrimary h-14 rounded-xl items-center justify-center mt-4">
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-white font-bold uppercase tracking-widest">
                  Update Records
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Documents Section */}
        <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-widest mb-4 ml-2">
          Uploaded Documents
        </Text>

        {student?.documents?.map((doc: any) => (
          <View
            key={doc._id}
            className="bg-card rounded-2xl p-5 mb-4 border border-stone-800">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-row items-center">
                <FileText color="#3b82f6" size={20} />
                <Text className="text-textPrimary font-bold ml-3">
                  {doc.name}
                </Text>
              </View>
              <View
                className={`px-2 py-1 rounded-md ${
                  doc.status === 'verified'
                    ? 'bg-green-500/10'
                    : doc.status === 'rejected'
                    ? 'bg-red-500/10'
                    : 'bg-orange-500/10'
                }`}>
                <Text
                  className={`text-[8px] font-bold uppercase ${
                    doc.status === 'verified'
                      ? 'text-green-500'
                      : doc.status === 'rejected'
                      ? 'text-red-400'
                      : 'text-buttonSecondary'
                  }`}>
                  {doc.status}
                </Text>
              </View>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => navigation.navigate('DocumentViewer', { url: doc.url, title: doc.name })}
                className="w-12 h-14 bg-stone-900 border border-stone-800 rounded-xl items-center justify-center">
                <Eye color="#78716C" size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleVerifyDocument(doc._id, 'verified')}
                className="flex-1 bg-green-600/10 border border-green-600/30 py-3 rounded-xl flex-row items-center justify-center">
                <CheckCircle2 color="#10b981" size={16} />
                <Text className="text-green-500 font-bold text-xs ml-2">
                  VERIFY
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleVerifyDocument(doc._id, 'rejected')}
                className="flex-1 bg-red-600/10 border border-red-600/30 py-3 rounded-xl flex-row items-center justify-center">
                <XCircle color="#f87171" size={16} />
                <Text className="text-red-400 font-bold text-xs ml-2">
                  REJECT
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {(!student?.documents || student.documents.length === 0) && (
          <View className="bg-card/50 border border-stone-800 border-dashed rounded-2xl p-8 items-center">
            <Info color="#44403C" size={32} />
            <Text className="text-textSecondary text-xs mt-2 text-center">
              No documents uploaded by student yet.
            </Text>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default StudentDetailVerification;
