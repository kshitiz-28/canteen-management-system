import React, { useState } from 'react';
import { TextField, Button, Snackbar, Alert, Box, Typography, Link } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    employeeId: '',
    password: '',
  });
  const [alert, setAlert] = useState({
    open: false,
    severity: 'info',
    message: '',
  });

  const handleLogin = async () => {
    const { employeeId, password } = credentials;

    if (!employeeId || !password) {
      return setAlert({ open: true, severity: 'error', message: 'Please fill all fields.' });
    }

    try {
      const res = await axios.get(`${API_BASE}/users?employeeId=${employeeId}&password=${password}`);
      if (res.data.length === 0) {
        return setAlert({ open: true, severity: 'error', message: 'Invalid credentials.' });
      }

      login(res.data[0]);

      if (res.data[0].employeeId.startsWith('ADM')) {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      console.error(err);
      setAlert({ open: true, severity: 'error', message: 'Login failed.' });
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>Login</Typography>
      <TextField
        label="Employee ID"
        name="employeeId"
        value={credentials.employeeId}
        onChange={(e) => setCredentials({ ...credentials, employeeId: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        fullWidth
        margin="normal"
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleLogin}
      >
        Login
      </Button>

      <Typography variant="body2" sx={{ mt: 2 }}>
        New Employee?{' '}
        <Link href="/signup">
          Sign Up
        </Link>
      </Typography>

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
