import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  ArrowLeft,
  Upload,
  FileCheck,
  Search,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react-native';
import {useAppSelector, useAppDispatch} from '../../store';
import api from '../../services/api';
import DocumentPicker from 'react-native-document-picker';

const DocumentsScreen = () => {
  const navigation = useNavigation<any>();
  const {user} = useAppSelector(state => state.auth);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requirements, setRequirements] = useState<any[]>([]);

  const fetchRequirements = async () => {
    try {
      const res = await api.get('/auth/documents/requirements');
      setRequirements(res.data);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequirements();
    setRefreshing(false);
  };

  const handleUpload = async (requirementId: string) => {
    try {
      const pickerResult = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });

      setUploading(true);
      
      // REAL DATA FLOW: As per Spec v14
      // We upload to the server's static folder
      const formData = new FormData();
      formData.append('requirementId', requirementId);
      formData.append('document', {
        uri: pickerResult.uri,
        type: pickerResult.type,
        name: pickerResult.name,
      } as any);

      // Sending to specific alignment endpoint
      await api.post('/auth/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchRequirements();
      Alert.alert('Success', 'Document uploaded successfully and is now pending verification!');
      
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error(err);
        Alert.alert('Error', 'Failed to upload document');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-12"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C2410C" />
      }>
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft color="#D6D3D1" size={24} />
        </TouchableOpacity>
        <Text className="text-textPrimary text-2xl font-bold">Document Vault</Text>
      </View>

      <View className="bg-card p-6 rounded-3xl border border-stone-800 mb-8">
        <View className="flex-row items-center mb-4">
          <Shield color="#9A3412" size={20} />
          <Text className="text-primary font-bold ml-2 text-lg italic">Verification Portal</Text>
        </View>
        <Text className="text-textSecondary text-xs leading-5">
          Upload mandatory documents assigned to your Department ({user?.department}) and Year ({user?.yearOfStudy}). 
          Once verified, you'll gain priority queuing access.
        </Text>
      </View>

      <View className="space-y-6">
        {requirements.length === 0 ? (
          <View className="py-20 items-center opacity-30">
            <AlertCircle color="#D6D3D1" size={48} />
            <Text className="text-textPrimary mt-4 font-bold uppercase tracking-widest text-[10px]">No pending requirements</Text>
          </View>
        ) : (
          requirements.map(req => {
            const status = req.submissionStatus || 'not_uploaded';
            return (
              <View key={req._id} className="bg-card rounded-2xl p-6 border border-stone-800 mb-6">
                <View className="flex-row justify-between items-start mb-4">
                   <View className="flex-1">
                      <Text className="text-textPrimary font-bold text-lg">{req.title}</Text>
                      {req.isRequired && <Text className="text-red-500 text-[8px] font-black uppercase tracking-widest mt-1">Mandatory</Text>}
                   </View>
                   <View className={`px-3 py-1 rounded-full ${status === 'verified' ? 'bg-emerald-500/20' : 'bg-stone-800'}`}>
                      <Text className={`text-[10px] font-bold uppercase ${status === 'verified' ? 'text-emerald-500' : 'text-stone-400'}`}>
                        {status.toUpperCase()}
                      </Text>
                   </View>
                </View>

                {status === 'not_uploaded' ? (
                  <TouchableOpacity 
                    onPress={() => handleUpload(req._id)}
                    className="h-24 bg-stone-900/50 border-2 border-dashed border-stone-800 rounded-xl items-center justify-center"
                  >
                    <Upload color="#78716C" size={24} />
                    <Text className="text-textSecondary text-[10px] font-bold mt-2 uppercase tracking-widest">Select File</Text>
                  </TouchableOpacity>
                ) : (
                  <View className="bg-stone-900/50 p-4 rounded-xl flex-row items-center border border-stone-800">
                    <CheckCircle2 color={status === 'verified' ? '#10b981' : '#f59e0b'} size={24} />
                    <View className="ml-4">
                      <Text className="text-textPrimary font-bold text-xs uppercase tracking-widest">File Submitted</Text>
                      <Text className="text-textSecondary text-[9px] mt-1 italic">Awaiting final administrative review...</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const Shield = ({color, size}: any) => (
    <View className="bg-stone-900 p-2 rounded-lg">
        <FileCheck color={color} size={size} />
    </View>
);

export default DocumentsScreen;
