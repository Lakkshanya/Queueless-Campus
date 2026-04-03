import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Search,
  User,
  Filter,
  ChevronRight,
  CheckCircle,
  XCircle,
  GraduationCap,
} from 'lucide-react-native';
import api from '../../services/api';

const StudentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchQuery) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/staff/students?query=${searchQuery}`);
      setStudents(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to search students');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedStudent) {
      return;
    }
    try {
      await api.put('/staff/students/academic', {
        studentId: selectedStudent._id,
        enrollmentStatus: status,
      });
      Alert.alert('Success', `Student marked as ${status}`);
      setSelectedStudent({
        ...selectedStudent,
        academicRecords: {
          ...selectedStudent.academicRecords,
          enrollmentStatus: status,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Update failed');
    }
  };

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      <Text className="text-textPrimary text-2xl font-bold mb-6">
        Student Management
      </Text>

      {/* Search Bar */}
      <View className="bg-card rounded-2xl px-4 py-3 flex-row items-center border border-stone-800 mb-6">
        <Search color="#78716C" size={20} />
        <TextInput
          placeholder="Search by ID or Name..."
          placeholderTextColor="#78716C"
          className="flex-1 ml-3 text-textPrimary text-base"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Text className="text-primary font-bold">Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#C2410C" />
        ) : selectedStudent ? (
          /* Student Detail View */
          <View className="bg-card rounded-3xl p-6 border border-stone-800">
            <TouchableOpacity
              onPress={() => setSelectedStudent(null)}
              className="mb-4">
              <Text className="text-primary">← Back to List</Text>
            </TouchableOpacity>

            <View className="flex-row items-center mb-6">
              <View className="w-16 h-16 bg-stone-900 rounded-full items-center justify-center mr-4 border border-stone-800">
                <User color="#C2410C" size={32} />
              </View>
              <View>
                <Text className="text-textPrimary text-xl font-bold">
                  {selectedStudent.name}
                </Text>
                <Text className="text-textSecondary text-xs">
                  {selectedStudent.email}
                </Text>
                <Text className="text-stone-500 text-[10px] mt-1 uppercase font-bold tracking-widest">
                  {selectedStudent.collegeId}
                </Text>
              </View>
            </View>

            <View className="space-y-4">
              <Text className="text-textPrimary font-bold mb-2">
                Enrollment Status
              </Text>
              <View className="flex-row space-x-2 mb-6">
                {['Active', 'Inactive', 'Pending'].map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => updateStatus(s)}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                      selectedStudent.academicRecords?.enrollmentStatus === s
                        ? 'bg-primary border-primary'
                        : 'bg-transparent border-stone-800'
                    }`}>
                    <Text
                      className={`text-xs font-bold ${
                        selectedStudent.academicRecords?.enrollmentStatus === s
                          ? 'text-white'
                          : 'text-textSecondary'
                      }`}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="bg-background rounded-2xl p-4 border border-stone-800">
                <View className="flex-row items-center mb-2">
                  <GraduationCap color="#9A3412" size={16} />
                  <Text className="text-textPrimary font-bold ml-2">
                    Academic Data
                  </Text>
                </View>
                <Text className="text-textSecondary text-xs mt-1">
                  Department: {selectedStudent.department || 'N/A'}
                </Text>
                <Text className="text-textSecondary text-xs">
                  CGPA: {selectedStudent.academicRecords?.cgpa || '0.00'}
                </Text>
              </View>

              <TouchableOpacity className="bg-stone-800 py-4 rounded-2xl items-center mt-6">
                <Text className="text-textPrimary font-bold">
                  Approve Documents
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Student List */
          students.map(s => (
            <TouchableOpacity
              key={s._id}
              onPress={() => setSelectedStudent(s)}
              className="bg-card rounded-2xl p-4 mb-4 border border-stone-800 flex-row items-center">
              <View className="w-10 h-10 bg-stone-900 rounded-full items-center justify-center mr-4">
                <User color="#78716C" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary font-bold">{s.name}</Text>
                <Text className="text-textSecondary text-[10px]">
                  {s.collegeId}
                </Text>
              </View>
              <ChevronRight color="#44403C" size={20} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default StudentManagement;
