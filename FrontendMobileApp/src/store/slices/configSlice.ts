import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateApiBaseURL} from '../../services/api';
import {API_URL, BASE_URL} from '../../constants/config';

interface ConfigState {
  serverUrl: string;
  portalUrl: string;
}

const initialState: ConfigState = {
  portalUrl: 'https://queueless-campus-lakkhanya-apr-2026-v2.localtunnel.me',
  serverUrl:
    'https://queueless-campus-lakkhanya-apr-2026-v2.localtunnel.me/api',
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setServerUrl: (state, action: PayloadAction<string>) => {
      let finalUrl = action.payload;
      if (!finalUrl.endsWith('/api') && !finalUrl.endsWith('/api/')) {
        finalUrl = finalUrl.endsWith('/')
          ? `${finalUrl}api`
          : `${finalUrl}/api`;
      }

      state.serverUrl = finalUrl;
      updateApiBaseURL(finalUrl);

      // Also update portal URL if it's a standard IP change
      if (finalUrl.includes(':5000/api')) {
        const base = finalUrl.split(':5000/api')[0];
        state.portalUrl = `${base}:5173`;
      } else {
        // For Cloudflare, portal usually doesn't have /api
        state.portalUrl = finalUrl.replace('/api', '');
      }

      AsyncStorage.setItem('serverUrl', state.serverUrl);
      AsyncStorage.setItem('portalUrl', state.portalUrl);
    },
    loadConfig: (
      state,
      action: PayloadAction<{serverUrl: string; portalUrl: string}>,
    ) => {
      state.serverUrl = action.payload.serverUrl;
      state.portalUrl = action.payload.portalUrl;
    },
  },
});

export const {setServerUrl, loadConfig} = configSlice.actions;
export default configSlice.reducer;
