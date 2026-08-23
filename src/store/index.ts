import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import movementReducer from './slices/movementSlice';
import providerReducer from './slices/providerSlice';
import clientReducer from './slices/clientSlice';
import quotationReducer from './slices/quotationSlice';
import saleReducer from './slices/saleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    movements: movementReducer,
    providers: providerReducer,
    clients: clientReducer,
    quotes: quotationReducer,
    sales: saleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
