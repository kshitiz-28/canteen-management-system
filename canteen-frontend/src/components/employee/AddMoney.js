import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL;

export default function AddMoney() {
  const { user, login } = useAuth();
  const [amount, setAmount] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  const handleAdd = async () => {
    const amt = Number(amount);
    if (amt <= 0) {
      return setAlert({ open: true, message: "Enter a valid amount", severity: "warning" });
    }

    try {
      const updatedBalance = user.balance + amt;
      await axios.patch(`${API_BASE}/users/${user.id}`, { balance: updatedBalance });
      login({ ...user, balance: updatedBalance }); // update context
      setAlert({ open: true, message: "Money added successfully", severity: "success" });
      setAmount('');
    } catch (err) {
      console.error(err);
      setAlert({ open: true, message: "Failed to add money", severity: "error" });
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>Add Money</Typography>

      <TextField
        label="Amount"
        type="number"
        fullWidth
        value={amount}
        onChange={e => setAmount(e.target.value)}
        margin="normal"
      />

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        fullWidth
        onClick={handleAdd}
      >
        Add Balance
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
