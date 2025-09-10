import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { getUserById } from '../../services/api';

const API_BASE = process.env.REACT_APP_API_URL;

export default function ViewBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await getUserById(user.id);
        setBalance(res.data.balance);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  });

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">Your Balance</Typography>
      {loading ? (
        <CircularProgress sx={{ mt: 2 }} />
      ) : (
        <Typography variant="h4" sx={{ mt: 2 }}>₹ {balance}</Typography>
      )}
    </Box>
  );
}
