import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action) {
      state.currentUser = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout(state) {
      state.currentUser = null;
      localStorage.removeItem('user');
    },
    updateBalance(state, action) {
      if (state.currentUser) {
        state.currentUser.balance = action.payload;
        localStorage.setItem('user', JSON.stringify(state.currentUser));
      }
    },
  },
});

export const { login, logout, updateBalance } = userSlice.actions;
export default userSlice.reducer;
