import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import transactionReducer from './slices/transactionSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    transactions: transactionReducer,
  },
});
