import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import movementReducer from './slices/movementSlice';
import providerReducer from './slices/providerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    movements: movementReducer,
    providers: providerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
