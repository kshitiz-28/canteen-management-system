import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  getItemsOfDay,
  addItemOfDay,
  deleteItemOfDay,
  updateItemOfDay,
  getItems,
  addItem,
  deleteItem,
  updateItem
} from '../../services/api';

export default function ItemPortal() {
  const [tab, setTab] = useState(0);

  const [allItems, setAllItems] = useState([]); // Master List
  const [itemsOfDay, setItemsOfDay] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({ name: '', price: '' });
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  const [editingDayItem, setEditingDayItem] = useState(null);
  const [dayForm, setDayForm] = useState({ masterId: '', quantity: '' });
  const [dayDialogOpen, setDayDialogOpen] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, type: '' });

  const fetchData = async () => {
    try {
      const [itemsRes, dayRes] = await Promise.all([
        getItems(),
        getItemsOfDay()
      ]);
      setAllItems(itemsRes.data);
      setItemsOfDay(dayRes.data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveMaster = async () => {
    if (!itemForm.name || !itemForm.price) return;

    const exists = allItems.find(
      i => i.name.toLowerCase() === itemForm.name.toLowerCase() && (!editingItem || i.id !== editingItem.id)
    );

    if (exists) {
      setAlert({ open: true, message: 'Duplicate item in master list.', severity: 'warning' });
      return;
    }

    try {
      if (editingItem) {
        await updateItem(editingItem.id, {
          name: itemForm.name,
          price: Number(itemForm.price)
        });
      } else {
        await addItem({
          id: Date.now().toString(),
          name: itemForm.name,
          price: Number(itemForm.price)
        });
      }

      setItemDialogOpen(false);
      setItemForm({ name: '', price: '' });
      setEditingItem(null);
      fetchData();
    } catch (err) {
      console.error('Failed to save item:', err);
    }
  };

  const handleSaveDay = async () => {
    if (!dayForm.masterId || !dayForm.quantity) return;

    const exists = itemsOfDay.find(i => i.id === dayForm.masterId);
    if (exists && !editingDayItem) {
      setAlert({ open: true, message: 'Item already exists in items of day.', severity: 'warning' });
      return;
    }

    try {
      const master = allItems.find(i => i.id === dayForm.masterId);
      if (!master) return;

      if (editingDayItem) {
        await updateItemOfDay(editingDayItem.id, {
          quantity: Number(dayForm.quantity)
        });
      } else {
        await addItemOfDay({
          id: master.id,
          name: master.name,
          price: master.price,
          quantity: Number(dayForm.quantity)
        });
      }

      setDayDialogOpen(false);
      setDayForm({ masterId: '', quantity: '' });
      setEditingDayItem(null);
      fetchData();
    } catch (err) {
      console.error('Failed to save item of the day:', err);
    }
  };

  const confirmDelete = (id, type) => {
    setDeleteDialog({ open: true, id, type });
  };

  const handleDeleteConfirmed = async () => {
    const { id, type } = deleteDialog;
    try {
      if (type === 'master') {
        await deleteItem(id);

        const exists = itemsOfDay.find(i => i.id === id);
        if (exists) {
          await deleteItemOfDay(id);
        }
      } else if (type === 'day') {
        await deleteItemOfDay(id);
      }

      setDeleteDialog({ open: false, id: null, type: '' });
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Item Portal</Typography>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Items Of The Day" />
        <Tab label="Master Item List" />
      </Tabs>

      {/* === Items Of The Day === */}
      {tab === 0 && (
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => setDayDialogOpen(true)}>
            Add Item Of The Day
          </Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itemsOfDay.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditingDayItem(item);
                          setDayForm({ masterId: item.id, quantity: item.quantity });
                          setDayDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => confirmDelete(item.id, 'day')}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* === Master Item List === */}
      {tab === 1 && (
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => setItemDialogOpen(true)}>
            Add Master Item
          </Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditingItem(item);
                          setItemForm({ name: item.name, price: item.price });
                          setItemDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => confirmDelete(item.id, 'master')}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* === Dialogs === */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)}>
        <DialogTitle>{editingItem ? 'Edit Master Item' : 'Add Master Item'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name"
            fullWidth
            margin="dense"
            value={itemForm.name}
            onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="dense"
            value={itemForm.price}
            onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMaster}>
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dayDialogOpen} onClose={() => setDayDialogOpen(false)}>
        <DialogTitle>{editingDayItem ? 'Edit Item Of The Day' : 'Add Item Of The Day'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Select Item"
            fullWidth
            margin="dense"
            disabled={!!editingDayItem}
            value={dayForm.masterId}
            onChange={e => setDayForm({ ...dayForm, masterId: e.target.value })}
          >
            {allItems.map(item => (
              <MenuItem key={item.id} value={item.id}>
                {item.name} (₹{item.price})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={dayForm.quantity}
            onChange={e => setDayForm({ ...dayForm, quantity: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDayDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDay}>
            {editingDayItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, type: '' })}>
        <DialogTitle>Are you sure you want to delete the entry?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, type: '' })}>Go Back</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirmed}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

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
