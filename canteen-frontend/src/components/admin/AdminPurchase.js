import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';

import {
  getAllUsers,
  getItemsOfDay,
  updateUser,
  updateItemOfDay,
  addTransaction
} from '../../services/api';

export default function AdminPurchase() {
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ empId: '', itemId: '', quantity: '' });
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, itemRes] = await Promise.all([getAllUsers(), getItemsOfDay()]);
      const nonAdmins = userRes.data.filter((u) => u.employeeId.startsWith('EMP'));
      setEmployees(nonAdmins);
      setItems(itemRes.data.filter(i => i.quantity > 0));
    } catch (err) {
      console.error('Data fetch error:', err);
      setAlert({ open: true, message: 'Failed to load data.', severity: 'error' });
    }
  };

  const validateBeforeConfirm = () => {
    const { empId, itemId, quantity } = form;
    const employee = employees.find(e => e.id === empId);
    const item = items.find(i => i.id === itemId);
    const qty = Number(quantity);
    const total = item?.price * qty;

    if (!employee || !item || qty <= 0) {
      return setAlert({ open: true, message: "Invalid input", severity: "error" });
    }
    if (item.quantity < qty) {
      return setAlert({ open: true, message: "Not enough stock", severity: "warning" });
    }
    if (employee.balance < total) {
      return setAlert({ open: true, message: "Insufficient balance", severity: "warning" });
    }

    setConfirmationOpen(true);
  };

  const handlePurchase = async () => {
    const { empId, itemId, quantity } = form;
    const employee = employees.find(e => e.id === empId);
    const item = items.find(i => i.id === itemId);
    const qty = Number(quantity);
    const total = item.price * qty;

    try {
      await updateUser(employee.id, { balance: employee.balance - total });
      await updateItemOfDay(item.id, { quantity: item.quantity - qty });

      await addTransaction({
        id: Date.now().toString(),
        employeeId: employee.employeeId,
        employeeName: employee.name,
        itemName: item.name,
        price: item.price,
        quantity: qty,
        totalAmount: total,
        source: "Admin",
        timestamp: new Date().toISOString()
      });

      setAlert({ open: true, message: "Purchase successful!", severity: "success" });
      setForm({ empId: '', itemId: '', quantity: '' });
      setConfirmationOpen(false);
      fetchData();
    } catch (err) {
      console.error("Purchase error:", err);
      setAlert({ open: true, message: "Purchase failed", severity: "error" });
      setConfirmationOpen(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>Admin Purchase Panel</Typography>

      <TextField
        label="Select Employee"
        select
        fullWidth
        value={form.empId}
        onChange={e => setForm({ ...form, empId: e.target.value })}
        margin="normal"
      >
        {employees.map(e => (
          <MenuItem key={e.id} value={e.id}>
            {e.name} ({e.employeeId}) — ₹{e.balance}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Select Item"
        select
        fullWidth
        value={form.itemId}
        onChange={e => setForm({ ...form, itemId: e.target.value })}
        margin="normal"
      >
        {items.map(i => (
          <MenuItem key={i.id} value={i.id}>
            {i.name} (₹{i.price}) — Qty: {i.quantity}
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

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={validateBeforeConfirm}
      >
        Process Purchase
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to process this purchase?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)} color="primary">
            Go Back
          </Button>
          <Button onClick={handlePurchase} variant="contained" color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

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
