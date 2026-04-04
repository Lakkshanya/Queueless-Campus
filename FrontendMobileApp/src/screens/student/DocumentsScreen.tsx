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
  Clock,
  ShieldCheck,
} from 'lucide-react-native';
import {useAppSelector, useAppDispatch} from '../../store';
import api from '../../services/api';
import DocumentPicker from 'react-native-document-picker';

const DocumentsScreen = () => {
  const navigation = useNavigation<any>();
  const {user} = useAppSelector(state => state.auth);
  const [uploadingReqId, setUploadingReqId] = useState<string | null>(null);
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

      setUploadingReqId(requirementId);
      
      const formData = new FormData();
      formData.append('requirementId', requirementId);
      formData.append('document', {
        uri: pickerResult.uri,
        type: pickerResult.type,
        name: pickerResult.name,
      } as any);

      await api.post('/auth/documents/upload', formData, {
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
      setUploadingReqId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'verified':
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', icon: <CheckCircle2 color="#10b981" size={24} />, textDisplay: 'Verified' };
      case 'rejected':
        return { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500', icon: <XCircle color="#f43f5e" size={24} />, textDisplay: 'Rejected' };
      case 'pending':
        return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', icon: <Clock color="#f59e0b" size={24} />, textDisplay: 'Pending Review' };
      default:
        return { bg: 'bg-stone-800/50', border: 'border-stone-700', text: 'text-stone-400', icon: <XCircle color="#78716C" size={24} />, textDisplay: 'Not Uploaded' };
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

      <View className="bg-[#1C1917] p-8 rounded-[32px] border border-stone-800 mb-8 shadow-xl relative overflow-hidden">
        <View className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mb-16" />
        <View className="flex-row items-center mb-6">
          <View className="bg-stone-900 border border-stone-800 p-3 rounded-2xl">
            <ShieldCheck color="#C2410C" size={24} />
          </View>
          <Text className="text-textPrimary font-black ml-4 text-xl tracking-tight">Verification Portal</Text>
        </View>
        <Text className="text-stone-400 text-xs leading-6">
          Upload mandatory documents assigned to your Department ({user?.department || 'N/A'}) and Year ({user?.yearOfStudy || 'N/A'}). 
          Verified documents grant you priority queuing access and prevent token cancellation.
        </Text>
      </View>

      <View className="space-y-6 mb-12">
        {requirements.length === 0 ? (
          <View className="py-20 items-center bg-stone-900/50 rounded-[32px] border border-stone-800 border-dashed">
            <View className="w-20 h-20 bg-stone-900 rounded-full items-center justify-center border border-stone-800 mb-4">
              <AlertCircle color="#78716C" size={32} />
            </View>
            <Text className="text-textPrimary mt-4 font-black uppercase tracking-widest text-[12px]">No Pending Requests</Text>
            <Text className="text-stone-500 mt-2 text-[10px] uppercase tracking-widest text-center px-8 leading-5">
              The administration hasn't assigned any documents for your profile.
            </Text>
          </View>
        ) : (
          requirements.map(req => {
            const status = req.submissionStatus || 'not_uploaded';
            const config = getStatusConfig(status);
            const isUploading = uploadingReqId === req._id;

            return (
              <View key={req._id} className="bg-card rounded-[32px] p-6 border border-stone-800 mb-6 shadow-lg">
                <View className="flex-row justify-between items-start mb-6">
                   <View className="flex-1 pr-4">
                      <Text className="text-stone-500 text-[9px] font-black uppercase tracking-widest mb-1.5 font-bold">Requirement Title</Text>
                      <Text className="text-textPrimary font-black text-xl tracking-tight">{req.title}</Text>
                      {req.isRequired && (
                        <View className="self-start bg-red-500/10 px-2 py-0.5 rounded-sm border border-red-500/20 mt-2">
                          <Text className="text-red-500 text-[8px] font-black uppercase tracking-[2px]">Mandatory</Text>
                        </View>
                      )}
                   </View>
                   <View className={`px-4 py-1.5 rounded-full border ${config.bg} ${config.border}`}>
                      <Text className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}>
                        {config.textDisplay}
                      </Text>
                   </View>
                </View>

                {status === 'not_uploaded' || status === 'rejected' ? (
                  <TouchableOpacity 
                    onPress={() => handleUpload(req._id)}
                    disabled={isUploading}
                    className={`h-32 bg-stone-900/50 border-2 border-dashed border-stone-800 rounded-3xl items-center justify-center active:scale-95 transition-transform ${isUploading ? 'opacity-50' : ''}`}
                  >
                    {isUploading ? (
                      <View className="items-center">
                        <ActivityIndicator color="#C2410C" size="large" />
                        <Text className="text-primary text-[10px] font-black mt-3 uppercase tracking-widest">Encrypting Array...</Text>
                      </View>
                    ) : (
                      <>
                        <View className="w-12 h-12 bg-stone-900 rounded-full items-center justify-center border border-stone-800 mb-3">
                          <Upload color="#C2410C" size={20} />
                        </View>
                        <Text className="text-stone-400 text-[10px] font-black mb-1 uppercase tracking-widest">Tap to Upload File</Text>
                        <Text className="text-stone-600 text-[8px] font-bold uppercase tracking-widest">PDF, JPG, PNG Supported</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View className={`p-5 rounded-3xl flex-row items-center border ${config.bg} ${config.border}`}>
                    {config.icon}
                    <View className="ml-4 flex-1">
                      <Text className={`font-black text-xs uppercase tracking-widest mb-1 ${config.text}`}>
                        {status === 'verified' ? 'Document Verified' : 'Awaiting Review'}
                      </Text>
                      <Text className="text-stone-500 text-[10px] leading-4 pr-4">
                        {status === 'verified' 
                          ? 'This document has been accepted by the faculty office and is now locked.'
                          : 'Your document is in the validation queue. The staff will review it shortly.'}
                      </Text>
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

export default DocumentsScreen;
