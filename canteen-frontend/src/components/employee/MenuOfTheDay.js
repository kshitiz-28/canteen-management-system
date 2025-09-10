import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL;

export default function MenuOfTheDay() {
  const { user, login } = useAuth();
  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [amount, setAmount] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [passbook, setPassbook] = useState([]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}/itemsOfDay`);
      setItems(res.data.filter(item => item.quantity > 0));
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  };

  const fetchPassbook = async () => {
    try {
      const res = await axios.get(`${API_BASE}/transactions?employeeId=${user.employeeId}`);
      setPassbook(res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchPassbook();
  }, []);

  const addToCart = (item) => {
    const exists = cartItems.find(ci => ci.id === item.id);
    const newTotal = cartTotal + item.price;
    if (newTotal > user.balance) {
      return setAlert({ open: true, message: "Insufficient balance!", severity: "warning" });
    }
    if (exists) {
      setCartItems(cartItems.map(ci =>
        ci.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci
      ));
    } else {
      setCartItems([...cartItems, { ...item, qty: 1 }]);
    }
  };

  const decreaseQty = (id) => {
    const item = cartItems.find(ci => ci.id === id);
    if (!item) return;
    if (item.qty === 1) {
      setCartItems(cartItems.filter(ci => ci.id !== id));
    } else {
      setCartItems(cartItems.map(ci =>
        ci.id === id ? { ...ci, qty: ci.qty - 1 } : ci
      ));
    }
  };

  const handlePurchase = async () => {
    if (cartItems.length === 0) return;
    const newBalance = user.balance - cartTotal;

    try {
      await axios.patch(`${API_BASE}/users/${user.id}`, { balance: newBalance });
      login({ ...user, balance: newBalance });

      for (const ci of cartItems) {
        const item = items.find(i => i.id === ci.id);
        if (item) {
          await axios.patch(`${API_BASE}/itemsOfDay/${ci.id}`, {
            quantity: item.quantity - ci.qty
          });
        }
      }

      for (const ci of cartItems) {
        await axios.post(`${API_BASE}/transactions`, {
          id: Date.now().toString() + Math.random(),
          employeeId: user.employeeId,
          employeeName: user.name,
          itemName: ci.name,
          price: ci.price,
          quantity: ci.qty,
          totalAmount: ci.price * ci.qty,
          source: "Employee",
          timestamp: new Date().toISOString()
        });
      }

      setCartItems([]);
      setAlert({ open: true, message: "Purchase successful!", severity: "success" });
      fetchItems();
      fetchPassbook();
    } catch (err) {
      setAlert({ open: true, message: "Purchase failed", severity: "error" });
    }
  };

  const handleAddMoney = async () => {
    const amt = Number(amount);
    if (amt <= 0) {
      return setAlert({ open: true, message: "Enter a valid amount", severity: "warning" });
    }
    try {
      const updatedBalance = user.balance + amt;
      await axios.patch(`${API_BASE}/users/${user.id}`, { balance: updatedBalance });
      login({ ...user, balance: updatedBalance });
      setAlert({ open: true, message: "Money added successfully", severity: "success" });
      setAmount('');
    } catch (err) {
      console.error(err);
      setAlert({ open: true, message: "Failed to add money", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Grid container spacing={{ xs: 2, md: 4 }} alignItems="flex-start">
        {/* MENU SECTION */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: { xs: 1, md: 3 }, borderRadius: 3, boxShadow: 2, minHeight: 420 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Menu Of The Day
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>₹{item.price}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => addToCart(item)}
                          disabled={
                            cartItems.find(ci => ci.id === item.id)?.qty >= item.quantity ||
                            cartTotal + item.price > user.balance
                          }
                        >
                          Add to Cart
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* CART, ADD MONEY & PASSBOOK */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  Balance: <b>₹{user.balance}</b>
                </Typography>
                <TextField
                  label="Amount"
                  type="number"
                  size="small"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  sx={{ width: 100 }}
                  inputProps={{ min: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddMoney}
                  sx={{ minWidth: 90 }}
                >
                  Add Money
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* CART */}
              <Typography variant="h6">Your Cart</Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ minHeight: 160 }}>
                {cartItems.length === 0 ? (
                  <Typography color="text.secondary">No items in cart.</Typography>
                ) : (
                  <List dense>
                    {cartItems.map(ci => (
                      <ListItem
                        key={ci.id}
                        disablePadding
                        secondaryAction={
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => decreaseQty(ci.id)}
                              disabled={ci.qty === 0}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => addToCart(ci)}
                              disabled={
                                ci.qty >= (items.find(i => i.id === ci.id)?.quantity || 0) ||
                                cartTotal + ci.price > user.balance
                              }
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={`${ci.name} x${ci.qty}`}
                          secondary={`₹${ci.price * ci.qty}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Total: <b>₹{cartTotal}</b>
              </Typography>
              <Button
                variant="contained"
                fullWidth
                color="primary"
                onClick={handlePurchase}
                disabled={cartItems.length === 0}
                sx={{ mb: 2 }}
              >
                Buy Now
              </Button>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Passbook
              </Typography>
              <Box sx={{ maxHeight: 180, overflow: 'auto' }}>
                {passbook.length === 0 ? (
                  <Typography color="text.secondary">No transactions yet.</Typography>
                ) : (
                  <List dense>
                    {passbook.map(txn => (
                      <ListItem key={txn.id}>
                        <ListItemText
                          primary={`${txn.itemName} x${txn.quantity} — ₹${txn.totalAmount}`}
                          secondary={new Date(txn.timestamp).toLocaleString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
