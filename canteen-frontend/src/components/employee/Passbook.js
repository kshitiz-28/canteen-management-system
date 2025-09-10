import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  TablePagination
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getTransactions } from '../../services/api';

const API_BASE = process.env.REACT_APP_API_URL;

export default function Passbook() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      const employeeTxns = res.data.filter(
        txn => txn.employeeId === user.employeeId
      );
      setTransactions(employeeTxns.reverse());
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sliced transactions for the current page
  const paginatedTxns = transactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Passbook (Transaction History)
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTxns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTxns.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{txn.itemName || '—'}</TableCell>
                    <TableCell>₹{txn.price}</TableCell>
                    <TableCell>{txn.quantity}</TableCell>
                    <TableCell>₹{txn.totalAmount}</TableCell>
                    <TableCell>{txn.source}</TableCell>
                    <TableCell>
                      {new Date(txn.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={transactions.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Rows per page"
          />
        </Paper>
      )}
    </Box>
  );
}
