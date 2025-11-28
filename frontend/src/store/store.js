import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sensorsReducer from './slices/sensorsSlice';
import alertsReducer from './slices/alertsSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sensors: sensorsReducer,
    alerts: alertsReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['socket/connected', 'socket/disconnected'],
      },
    }),
});
