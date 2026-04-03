import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {X, Download, ExternalLink} from 'lucide-react-native';
import {BASE_URL} from '../../constants/config';

const {width, height} = Dimensions.get('window');

const DocumentViewer = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const {url, title} = route.params;

  // Ensure absolute URL if relative
  const documentUrl = url.startsWith('http') 
    ? url 
    : `${BASE_URL.replace('/api', '')}${url}`;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 z-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 bg-stone-900/80 rounded-full items-center justify-center border border-stone-800">
          <X color="#FAFAF9" size={24} />
        </TouchableOpacity>
        
        <View className="items-center">
           <Text className="text-white font-black uppercase tracking-tighter text-base">{title || 'Document Protocol'}</Text>
           <Text className="text-stone-500 text-[8px] font-black uppercase tracking-widest mt-1">Classification: Secure Visual</Text>
        </View>

        <TouchableOpacity
          className="w-12 h-12 bg-stone-900/80 rounded-full items-center justify-center border border-stone-800">
          <ExternalLink color="#9A3412" size={20} />
        </TouchableOpacity>
      </View>

      {/* Image Viewer */}
      <View className="flex-1 items-center justify-center">
        <Image
          source={{uri: documentUrl}}
          className="w-full h-full"
          resizeMode="contain"
          style={{width: width, height: height * 0.7}}
        />
      </View>

      {/* Footer Info */}
      <View className="p-10 items-center">
         <View className="bg-stone-900/50 px-6 py-3 rounded-full border border-stone-800 flex-row items-center">
            <View className="w-2 h-2 bg-[#9A3412] rounded-full animate-pulse mr-3" />
            <Text className="text-stone-400 text-[10px] font-black uppercase tracking-widest">
               Authentic System Copy • Encrypted Stream
            </Text>
         </View>
      </View>
    </SafeAreaView>
  );
};

export default DocumentViewer;
