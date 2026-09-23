import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Thunks
export const loginThunk = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const registerThunk = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', userData);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const fetchProfileThunk = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/profile');
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true, // starts true for initial app load
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutAction: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    // Synchronous initializer from localStorage
    initAuthFromStorage: (state) => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 > Date.now()) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              state.user = JSON.parse(storedUser);
            }
          } else {
            // expired
            state.token = null;
            state.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (e) {
          state.token = null;
          state.user = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      // Register
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      // Fetch Profile
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchProfileThunk.rejected, (state) => {
        // App.jsx used to just rely on cached user in this case.
      });
  },
});

export const { logoutAction, initAuthFromStorage, setLoading } = authSlice.actions;
export default authSlice.reducer;
