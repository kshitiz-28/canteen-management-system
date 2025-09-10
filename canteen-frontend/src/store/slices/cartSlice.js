
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const item = action.payload;
      const exists = state.items.find(i => i.id === item.id);
      if (exists) {
        exists.qty += 1;
      } else {
        state.items.push({ ...item, qty: 1 });
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    increaseQty(state, action) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) item.qty += 1;
    },
    decreaseQty(state, action) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        item.qty -= 1;
        if (item.qty <= 0) {
          state.items = state.items.filter(i => i.id !== action.payload);
        }
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, increaseQty, decreaseQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
