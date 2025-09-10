import React, { useEffect, useState } from 'react';
import {
  Button, TextField, Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Paper, TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser
} from '../../services/api'; // adjust if your file path differs

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    employeeId: '',
    balance: 0,
    password: 'emp123'
  });
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [openAddMoney, setOpenAddMoney] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [amount, setAmount] = useState(0);

  const [openDeductMoney, setOpenDeductMoney] = useState(false);
  const [deductEmployee, setDeductEmployee] = useState(null);
  const [deductAmount, setDeductAmount] = useState(0);
  const [deductError, setDeductError] = useState('');

  const [pendingDelete, setPendingDelete] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchEmployees = async () => {
    try {
      const res = await getAllUsers();
      const filtered = res.data.filter(user => user.employeeId.startsWith('EMP'));
      setEmployees(filtered);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async () => {
    if (!/^EMP\d+$/.test(newEmployee.employeeId)) {
      setError('Employee ID must start with "EMP" and be followed by numbers (e.g., EMP001)');
      return;
    }
    if (!newEmployee.name) {
      setError('Name is required');
      return;
    }
    if (!newEmployee.password) {
      setError('Password is required for the new employee');
      return;
    }

    try {
      const res = await getAllUsers();
      const exists = res.data.find(emp => emp.employeeId === newEmployee.employeeId);
      if (exists) {
        setError('Employee ID already exists. Please use a unique ID.');
        return;
      }

      const newEmp = {
        id: Date.now().toString(),
        name: newEmployee.name,
        employeeId: newEmployee.employeeId,
        password: newEmployee.password,
        role: 'employee',
        balance: Number(newEmployee.balance) || 0
      };

      await addUser(newEmp);

      setEmployees([...employees, newEmp]);
      setNewEmployee({ name: '', employeeId: '', password: '', balance: 0 });
      setError('');
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
      setError('Failed to add employee. Please try again.');
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await deleteUser(id);
      fetchEmployees();
    } catch (err) {
      console.error('Failed to delete employee:', err);
    }
  };

  const handleOpenAddMoney = (employee) => {
    setSelectedEmployee(employee);
    setAmount(0);
    setOpenAddMoney(true);
  };

  const handleAddMoney = async () => {
    if (selectedEmployee && amount > 0) {
      try {
        await updateUser(selectedEmployee.id, {
          balance: selectedEmployee.balance + amount
        });
        setOpenAddMoney(false);
        setSelectedEmployee(null);
        setAmount(0);
        fetchEmployees();
      } catch (err) {
        console.error('Failed to add money:', err);
      }
    }
  };

  const handleOpenDeductMoney = (employee) => {
    setDeductEmployee(employee);
    setDeductAmount(0);
    setDeductError('');
    setOpenDeductMoney(true);
  };

  const handleDeductMoney = async () => {
    if (deductEmployee && deductAmount > 0) {
      if (deductEmployee.balance < deductAmount) {
        setDeductError('Cannot deduct more than current balance');
        return;
      }

      try {
        await updateUser(deductEmployee.id, {
          balance: deductEmployee.balance - deductAmount
        });

        setOpenDeductMoney(false);
        setDeductEmployee(null);
        setDeductAmount(0);
        setDeductError('');
        fetchEmployees();
      } catch (err) {
        console.error('Failed to deduct money:', err);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredEmployees = employees.filter(emp =>
    searchTerm === '' ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Employee Management
      </Typography>
      <TextField
        label="Search by ID or Name"
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
          setPage(0); // Reset to first page when search changes
        }}
        size="small"
        sx={{ mb: 2, width: 300 }}
      />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 2, ml: 2 }}
      >
        Add Employee
      </Button>

      {/* Add Employee Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
          />
          <TextField
            label="Employee ID"
            fullWidth
            margin="dense"
            value={newEmployee.employeeId}
            onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
            helperText='Must start with "EMP" and be followed by numbers'
          />
          <TextField
            label="Password"
            fullWidth
            margin="dense"
            type="password"
            value={newEmployee.password}
            onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
          />
          <TextField
            label="Balance"
            type="number"
            fullWidth
            margin="dense"
            value={newEmployee.balance}
            onChange={(e) => setNewEmployee({ ...newEmployee, balance: Number(e.target.value) })}
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEmployee} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Employee Table + Pagination */}
      <TableContainer component={Paper} sx={{ maxWidth: 750 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell align="center">Add Money</TableCell>
              <TableCell align="center">Deduct Money</TableCell>
              <TableCell align="center">Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.employeeId}</TableCell>
                <TableCell>₹{employee.balance}</TableCell>
                <TableCell align="center">
                  <IconButton color="success" onClick={() => handleOpenAddMoney(employee)}>
                    <AttachMoneyIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <IconButton color="error" onClick={() => handleOpenDeductMoney(employee)}>
                    <RemoveCircleIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => setPendingDelete(employee)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <TablePagination
          component="div"
          count={filteredEmployees.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page"
        />
      </TableContainer>

      {/* Add Money Dialog */}
      <Dialog open={openAddMoney} onClose={() => setOpenAddMoney(false)}>
        <DialogTitle>Add Money to {selectedEmployee?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddMoney(false)}>Cancel</Button>
          <Button onClick={handleAddMoney} variant="contained" disabled={amount <= 0}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deduct Money Dialog */}
      <Dialog open={openDeductMoney} onClose={() => setOpenDeductMoney(false)}>
        <DialogTitle>Deduct Money from {deductEmployee?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            value={deductAmount}
            onChange={e => setDeductAmount(Number(e.target.value))}
            fullWidth
            sx={{ mt: 2 }}
          />
          {deductError && <Typography color="error" sx={{ mt: 1 }}>{deductError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeductMoney(false)}>Cancel</Button>
          <Button onClick={handleDeductMoney} variant="contained" color="error" disabled={deductAmount <= 0}>
            Deduct
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
      >
        <DialogTitle>Are you sure you want to delete the entry?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)} color="primary">
            Go Back
          </Button>
          <Button
            onClick={async () => {
              await handleDeleteEmployee(pendingDelete.id);
              setPendingDelete(null);
            }}
            color="error"
            variant="contained"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
