import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import axios from 'axios';
import { getAllUsers,getTransactions } from '../../services/api';

const API_BASE = process.env.REACT_APP_API_URL;

export default function CreditDetails() {
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalSpent: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [usersRes, txnsRes] = await Promise.all([
      getAllUsers(),
      getTransactions()
    ]);

    const employees = usersRes.data.filter(u => u.employeeId.startsWith('EMP'));
    const totalBalance = employees.reduce((sum, emp) => sum + emp.balance, 0);

    const totalSpent = txnsRes.data.reduce((sum, txn) => sum + txn.totalAmount, 0);

    setStats({
      totalBalance,
      totalSpent,
      totalUsers: employees.length
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Credit Summary</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography>Total Employees: {stats.totalUsers}</Typography>
      <Typography>Total Money in Circulation: ₹{stats.totalBalance}</Typography>
      <Typography>Total Spent by Employees/Admin: ₹{stats.totalSpent}</Typography>
      <Typography>Estimated Revenue: ₹{stats.totalSpent}</Typography>
    </Paper>
  );
}
