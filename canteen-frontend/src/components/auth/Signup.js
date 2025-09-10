import React, { useState } from 'react';
import { TextField, Button, Snackbar, Alert, Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL;

export default function EmployeeSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
  });

  const [alert, setAlert] = useState({
    open: false,
    severity: 'info',
    message: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    const { name, employeeId, password, confirmPassword } = form;

    if (!name || !employeeId || !password || !confirmPassword) {
      return setAlert({ open: true, severity: 'warning', message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return setAlert({ open: true, severity: 'error', message: 'Passwords do not match.' });
    }

    try {
      // Check if employeeId is already taken
      const res = await axios.get(`${API_BASE}/users?employeeId=${employeeId}`);
      if (res.data.length > 0) {
        return setAlert({ open: true, severity: 'error', message: 'Employee ID already exists.' });
      }

      await axios.post(`${API_BASE}/users`, {
        id: Date.now().toString(),
        name,
        employeeId,
        password,
        role: 'employee',
        balance: 0,
      });

      setAlert({ open: true, severity: 'success', message: 'Signup successful! Redirecting to login...' });

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error(err);
      setAlert({ open: true, severity: 'error', message: 'Signup failed.' });
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>Employee Signup</Typography>
      <TextField
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Employee ID"
        name="employeeId"
        value={form.employeeId}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSignup}
      >
        Sign Up
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
