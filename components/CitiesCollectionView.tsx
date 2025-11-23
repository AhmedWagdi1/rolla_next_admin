'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ClientDataGrid from './ClientDataGrid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import JsonViewer from './JsonViewer';

interface CityDocument {
  id: string;
  name_ar?: string;
  name_en?: string;
  gover?: {
    id: string;
    path: string;
  };
  [key: string]: unknown;
}

interface GovernorateDocument {
  id: string;
  name_ar?: string;
  name_en?: string;
  [key: string]: unknown;
}

export default function CitiesCollectionView() {
  const [documents, setDocuments] = useState<CityDocument[]>([]);
  const [governorates, setGovernorates] = useState<GovernorateDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<CityDocument | null>(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    gover: '',
  });

  useEffect(() => {
    fetchDocuments();
    fetchGovernorates();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/collections/cities');
      const result = await response.json();
      
      if (result.success) {
        setDocuments(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch documents');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchGovernorates = async () => {
    try {
      const response = await fetch('/api/collections/governorates');
      const result = await response.json();
      
      if (result.success) {
        setGovernorates(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching governorates:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this city?')) return;
    
    try {
      const response = await fetch(`/api/collections/cities/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        fetchDocuments();
      } else {
        alert('Error: ' + result.error);
      }
    } catch {
      alert('Failed to delete document');
    }
  };

  const handleEdit = (doc: CityDocument) => {
    setEditingDoc(doc);
    setFormData({
      name_ar: doc.name_ar || '',
      name_en: doc.name_en || '',
      gover: doc.gover?.id || '',
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingDoc(null);
    setFormData({
      name_ar: '',
      name_en: '',
      gover: '',
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const url = editingDoc 
        ? `/api/collections/cities/${editingDoc.id}`
        : '/api/collections/cities';
      
      const method = editingDoc ? 'PUT' : 'POST';
      
      const dataToSend: Record<string, unknown> = {
        name_ar: formData.name_ar,
        name_en: formData.name_en,
      };

      // Add gover as a reference if selected
      if (formData.gover) {
        dataToSend.gover = formData.gover;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchDocuments();
        handleCloseDialog();
      } else {
        alert('Error: ' + result.error);
      }
    } catch {
      alert('Failed to save document');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDoc(null);
    setFormData({
      name_ar: '',
      name_en: '',
      gover: '',
    });
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 180 },
    { field: 'name_en', headerName: 'Name (EN)', width: 200 },
    { field: 'name_ar', headerName: 'Name (AR)', width: 200 },
    { 
      field: 'gover', 
      headerName: 'Governorate', 
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const gover = params.value as GovernorateDocument;
        if (!gover) return '—';
        return gover.name_en || gover.name_ar || gover.id;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row as CityDocument)}
            title="Edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <JsonViewer data={params.row} label="View" />
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Cities
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="large"
        >
          Add City
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <ClientDataGrid
          rows={documents}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
          }}
        />
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingDoc ? 'Edit City' : 'Add New City'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <TextField
              label="Name (English)"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              fullWidth
            />

            <TextField
              label="Name (Arabic)"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Governorate</InputLabel>
              <Select
                value={formData.gover}
                onChange={(e) => setFormData({ ...formData, gover: e.target.value })}
                label="Governorate"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {governorates.map((gov) => (
                  <MenuItem key={gov.id} value={gov.id}>
                    {gov.name_en || gov.name_ar || gov.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDoc ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
