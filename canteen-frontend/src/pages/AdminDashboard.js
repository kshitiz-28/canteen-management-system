import React, { useState } from 'react';
import { Container, Typography, Tabs, Tab, Box } from '@mui/material';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import ItemPortal from '../components/admin/ItemPortal';
import AdminPurchase from '../components/admin/AdminPurchase';
import TransactionHistory from '../components/admin/TransactionHistory';
import CreditDetails from '../components/admin/CreditDetails';
import AdminNavbar from '../components/navbar/AdminNavbar';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      <AdminNavbar />
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
          Admin Dashboard
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Employee Management" />
          <Tab label="Item Portal" />
          <Tab label="Admin Purchase" />
          <Tab label="Transaction History" />          
        </Tabs>

        <TabPanel value={tabValue} index={0}><EmployeeManagement /></TabPanel>
        <TabPanel value={tabValue} index={1}><ItemPortal /></TabPanel>
        <TabPanel value={tabValue} index={2}><AdminPurchase /></TabPanel>
        <TabPanel value={tabValue} index={3}><TransactionHistory /></TabPanel>
        
      </Container>
    </>
  );
}
