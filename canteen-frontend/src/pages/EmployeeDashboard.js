import React, { useState } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Grid
} from '@mui/material';
import EmployeeNavbar from '../components/navbar/EmployeeNavbar';
import MenuOfTheDay from '../components/employee/MenuOfTheDay';
import Passbook from '../components/employee/Passbook';
import AddMoney from '../components/employee/AddMoney';
import BuyItem from '../components/employee/BuyItem';
import ViewBalance from '../components/employee/ViewBalance';

// TabPanel helper
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

export default function EmployeeDashboard() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      <EmployeeNavbar />
      <Container maxWidth="lg">
        {/* Heading + Balance side by side */}
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h4">Employee Dashboard</Typography>
          <ViewBalance />
        </Grid>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Menu of the Day" />
          {/* <Tab label="Buy Item" />
          <Tab label="Add Money" /> */}
          <Tab label="Passbook" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <MenuOfTheDay />
        </TabPanel>        
        <TabPanel value={tabValue} index={1}>
          <Passbook />
        </TabPanel>
      </Container>
    </>
  );
}
