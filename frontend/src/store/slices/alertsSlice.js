import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { alertsAPI } from '../../services/api';

export const fetchAlerts = createAsyncThunk('alerts/fetchAll', async (params) => {
  const response = await alertsAPI.getAll(params);
  return response.data.data;
});

export const fetchActiveAlerts = createAsyncThunk('alerts/fetchActive', async () => {
  const response = await alertsAPI.getActive();
  return response.data.data;
});

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    list: [],
    active: [],
    loading: false,
    error: null,
  },
  reducers: {
    addAlert: (state, action) => {
      state.list.unshift(action.payload);
      if (action.payload.status === 'active') {
        state.active.unshift(action.payload);
      }
    },
    updateAlert: (state, action) => {
      const index = state.list.findIndex(a => a._id === action.payload._id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      const activeIndex = state.active.findIndex(a => a._id === action.payload._id);
      if (activeIndex !== -1) {
        if (action.payload.status === 'active') {
          state.active[activeIndex] = action.payload;
        } else {
          state.active.splice(activeIndex, 1);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchActiveAlerts.fulfilled, (state, action) => {
        state.active = action.payload;
      });
  },
});

export const { addAlert, updateAlert } = alertsSlice.actions;
export default alertsSlice.reducer;
