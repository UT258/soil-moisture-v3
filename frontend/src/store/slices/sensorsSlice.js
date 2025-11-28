import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sensorsAPI } from '../../services/api';

export const fetchSensors = createAsyncThunk('sensors/fetchAll', async (params) => {
  const response = await sensorsAPI.getAll(params);
  return response.data.data;
});

export const fetchSensorById = createAsyncThunk('sensors/fetchById', async (id) => {
  const response = await sensorsAPI.getById(id);
  return response.data.data;
});

const sensorsSlice = createSlice({
  name: 'sensors',
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    updateSensorStatus: (state, action) => {
      const index = state.list.findIndex(s => s.sensorId === action.payload.sensorId);
      if (index !== -1) {
        state.list[index].status = { ...state.list[index].status, ...action.payload.status };
      }
    },
    addSensor: (state, action) => {
      state.list.push(action.payload);
    },
    updateSensor: (state, action) => {
      const index = state.list.findIndex(s => s._id === action.payload._id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    removeSensor: (state, action) => {
      state.list = state.list.filter(s => s._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSensors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSensors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSensors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchSensorById.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  },
});

export const { updateSensorStatus, addSensor, updateSensor, removeSensor } = sensorsSlice.actions;
export default sensorsSlice.reducer;
