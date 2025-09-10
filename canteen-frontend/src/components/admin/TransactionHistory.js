import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, TablePagination
} from '@mui/material';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL;

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filterSource, setFilterSource] = useState('All');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(`${API_BASE}/transactions`);
    setTransactions(res.data.reverse());
  };

  const filteredTxns = transactions.filter(txn =>
    filterSource === 'All' ? true : txn.source === filterSource
  );

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Slice transactions according to pagination
  const paginatedTxns = filteredTxns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Transaction History</Typography>

      <TextField
        label="Filter by Source"
        select
        value={filterSource}
        onChange={e => {
          setFilterSource(e.target.value);
          setPage(0); // Reset to first page on filter change
        }}
        sx={{ mb: 2, width: 300 }}
        size="small"
      >
        <MenuItem value="All">All</MenuItem>
        <MenuItem value="Admin">Admin</MenuItem>
        <MenuItem value="Employee">Employee</MenuItem>
      </TextField>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Total (₹)</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Date/Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTxns.map(txn => (
              <TableRow key={txn.id}>
                <TableCell>{txn.itemName || '—'}</TableCell>
                <TableCell>{txn.quantity}</TableCell>
                <TableCell>₹{txn.totalAmount}</TableCell>
                <TableCell>
                  {txn.employeeName} ({txn.employeeId})
                </TableCell>
                <TableCell>{txn.source}</TableCell>
                <TableCell>{new Date(txn.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {paginatedTxns.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination controls */}
        <TablePagination
          component="div"
          count={filteredTxns.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page"
        />
      </TableContainer>
    </Box>
  );
}
