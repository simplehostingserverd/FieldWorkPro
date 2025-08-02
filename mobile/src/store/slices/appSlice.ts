import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isOnline: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
  lastSync: string | null;
  syncInProgress: boolean;
  firstLaunch: boolean;
}

const initialState: AppState = {
  isOnline: true,
  theme: 'system',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
  },
  lastSync: null,
  syncInProgress: false,
  firstLaunch: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<AppState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    setLastSync: (state, action: PayloadAction<string>) => {
      state.lastSync = action.payload;
    },
    setSyncInProgress: (state, action: PayloadAction<boolean>) => {
      state.syncInProgress = action.payload;
    },
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.firstLaunch = action.payload;
    },
  },
});

export const {
  setOnlineStatus,
  setTheme,
  updateNotificationSettings,
  setLastSync,
  setSyncInProgress,
  setFirstLaunch,
} = appSlice.actions;

export default appSlice.reducer;
