import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { getMe, verifyOtp, sendOtp as sendOtpApi } from '../api/authApi';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  hasOnboarded: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  hasOnboarded: false,
};

export const loadSession = createAsyncThunk('auth/loadSession', async (_, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    if (!token) return { token: null, user: null };
    const { data } = await getMe();
    return { token, user: data.user };
  } catch (e: unknown) {
    await SecureStore.deleteItemAsync('authToken');
    return rejectWithValue((e as Error).message);
  }
});

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (mobile: string, { rejectWithValue }) => {
    try {
      const { data } = await sendOtpApi(mobile);
      return data;
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const loginWithOtp = createAsyncThunk(
  'auth/loginWithOtp',
  async (
    payload: { mobile: string; otp: string; name?: string; role?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await verifyOtp(payload);
      await SecureStore.setItemAsync('authToken', data.token);
      return data;
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await SecureStore.deleteItemAsync('authToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setOnboarded: (state, action: PayloadAction<boolean>) => {
      state.hasOnboarded = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.token;
      })
      .addCase(loadSession.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginWithOtp.pending, (state) => {
        state.error = null;
      })
      .addCase(loginWithOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginWithOtp.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setOnboarded, clearError } = authSlice.actions;
export default authSlice.reducer;
