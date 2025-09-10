import axios from 'axios';

// Get API URL from environment variable (default to localhost for safety)
const API_BASE = process.env.REACT_APP_API_URL;

// ---------- USERS ----------
export const getAllUsers = () => axios.get(`${API_BASE}/users`);
export const getUserById = (id) => axios.get(`${API_BASE}/users/${id}`);
export const addUser = (userData) => axios.post(`${API_BASE}/users`, userData);
export const updateUser = (id, data) => axios.patch(`${API_BASE}/users/${id}`, data);
export const deleteUser = (id) => axios.delete(`${API_BASE}/users/${id}`);

// ---------- ITEMS ----------
export const getItems = () => axios.get(`${API_BASE}/items`);
export const addItem = (itemData) => axios.post(`${API_BASE}/items`, itemData);
export const updateItem = (id, data) => axios.patch(`${API_BASE}/items/${id}`, data);
export const deleteItem = (id) => axios.delete(`${API_BASE}/items/${id}`);

// ---------- ITEMS OF DAY ----------
export const getItemsOfDay = () => axios.get(`${API_BASE}/itemsOfDay`);
export const addItemOfDay = (itemData) => axios.post(`${API_BASE}/itemsOfDay`, itemData);
export const updateItemOfDay = (id, data) => axios.patch(`${API_BASE}/itemsOfDay/${id}`, data);
export const deleteItemOfDay = (id) => axios.delete(`${API_BASE}/itemsOfDay/${id}`);

// ---------- TRANSACTIONS ----------
export const getTransactions = () => axios.get(`${API_BASE}/transactions`);
export const addTransaction = (txnData) => axios.post(`${API_BASE}/transactions`, txnData);
export const deleteTransaction = (id) => axios.delete(`${API_BASE}/transactions/${id}`);

// ---------- AUTH ----------
export const loginUser = async (employeeId, password) => {
  const res = await axios.get(`${API_BASE}/users?employeeId=${employeeId}`);
  const user = res.data.find(u => u.password === password);
  if (!user) throw new Error('Invalid credentials');
  return user;
};

// OPTIONAL: Check for existing employeeId when adding new user
export const checkEmployeeIdExists = async (employeeId) => {
  const res = await axios.get(`${API_BASE}/users?employeeId=${employeeId}`);
  return res.data.length > 0;
};
