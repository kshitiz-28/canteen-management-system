import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL;

export default function BuyItem() {
  const { user, login } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ itemId: '', quantity: '' });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_BASE}/itemsOfDay`);
        setItems(res.data.filter(i => i.quantity > 0));
      } catch (err) {
        console.error('Error loading items:', err);
      }
    };
    fetchItems();
  }, []);

  const handleBuy = async () => {
    const item = items.find(i => i.id === form.itemId);
    const qty = Number(form.quantity);
    const total = item.price * qty;

    if (!item || qty <= 0) {
      return setAlert({ open: true, message: "Invalid input", severity: "error" });
    }
    if (item.quantity < qty) {
      return setAlert({ open: true, message: "Not enough stock", severity: "warning" });
    }
    if (user.balance < total) {
      return setAlert({ open: true, message: "Insufficient balance", severity: "warning" });
    }

    try {
      // 1. Update balance
      const updatedBalance = user.balance - total;
      await axios.patch(`${API_BASE}/users/${user.id}`, { balance: updatedBalance });
      login({ ...user, balance: updatedBalance }); // Update context too

      // 2. Update item quantity
      await axios.patch(`${API_BASE}/itemsOfDay/${item.id}`, {
        quantity: item.quantity - qty
      });

      // 3. Add transaction
      await axios.post(`${API_BASE}/transactions`, {
        id: Date.now().toString(),
        employeeId: user.employeeId,
        employeeName: user.name,
        itemName: item.name,
        price: item.price,
        quantity: qty,
        totalAmount: total,
        source: "Employee",
        timestamp: new Date().toISOString()
      });

      setAlert({ open: true, message: "Purchase successful!", severity: "success" });
      setForm({ itemId: '', quantity: '' });
    } catch (err) {
      console.error("Purchase error:", err);
      setAlert({ open: true, message: "Purchase failed", severity: "error" });
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>Buy Item</Typography>

      <TextField
        label="Select Item"
        select
        fullWidth
        value={form.itemId}
        onChange={e => setForm({ ...form, itemId: e.target.value })}
        margin="normal"
      >
        {items.map(item => (
          <MenuItem key={item.id} value={item.id}>
            {item.name} (₹{item.price}) — Available: {item.quantity}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Quantity"
        type="number"
        fullWidth
        value={form.quantity}
        onChange={e => setForm({ ...form, quantity: e.target.value })}
        margin="normal"
      />

      <Button variant="contained" sx={{ mt: 2 }} fullWidth onClick={handleBuy}>
        Purchase
      </Button>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
}
