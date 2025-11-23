'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { format } from 'date-fns';

const DataGrid = dynamic(
  () => import('@mui/x-data-grid').then(mod => mod.DataGrid),
  {
    ssr: false,
    loading: () => (
      <Box 
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
      >
        <CircularProgress />
      </Box>
    ),
  }
);

interface UserDocument {
  id?: string;
  uid?: string;
  email: string;
  displayName?: string;
  is_supplier: boolean;
  company_name?: string;
  company_logo?: string;
  password?: string;
  createdAt?: {
    _seconds: number;
    _nanoseconds: number;
  } | string;
  [key: string]: unknown;
}

export default function UsersCollectionView() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<UserDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<UserDocument>({
    email: '',
    displayName: '',
    is_supplier: false,
    company_name: '',
    company_logo: '',
    password: '',
  });

  const hasSuppliers = useMemo(() => documents.some(doc => doc.is_supplier), [documents]);

  const columns: GridColDef[] = [
    { 
      field: 'uid', 
      headerName: 'UID', 
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value as string} size="small" />
      )
    },
    {
      field: 'email',
      headerName: 'EMAIL',
      width: 250,
    },
    {
      field: 'displayName',
      headerName: 'DISPLAY NAME',
      width: 180,
    },
    {
      field: 'is_supplier',
      headerName: 'SUPPLIER',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value ? 'Yes' : 'No'} 
          size="small" 
          color={params.value ? 'success' : 'default'} 
        />
      )
    },
    ...(hasSuppliers ? [
      {
        field: 'company_name',
        headerName: 'COMPANY',
        width: 180,
        renderCell: (params: GridRenderCellParams) => (
          <Typography variant="body2">
            {params.value ? String(params.value) : '-'}
          </Typography>
        )
      },
      {
        field: 'company_logo',
        headerName: 'LOGO',
        width: 80,
        renderCell: (params: GridRenderCellParams) => {
          const url = params.value as string;
          return url ? (
            <Avatar src={url} alt="Logo" sx={{ width: 32, height: 32 }} />
          ) : null;
        }
      },
    ] : []),
    {
      field: 'createdAt',
      headerName: 'CREATED',
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const time = params.value as { _seconds: number; _nanoseconds: number } | string | undefined;
        if (!time) return '-';
        
        let date: Date;
        if (typeof time === 'string') {
          date = new Date(time);
        } else if (time && typeof time === 'object' && '_seconds' in time) {
          date = new Date(time._seconds * 1000);
        } else {
          return '-';
        }
        
        return format(date, 'MMM dd, yyyy HH:mm');
      }
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row as UserDocument)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id as string)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/collections/users');
      const result = await response.json();
      
      if (result.success) {
        setDocuments(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleEdit = (doc: UserDocument) => {
    setEditingDoc(doc);
    setFormData({
      email: doc.email || '',
      displayName: doc.displayName || '',
      is_supplier: doc.is_supplier || false,
      company_name: doc.company_name || '',
      company_logo: doc.company_logo || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/collections/users/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        fetchDocuments();
      } else {
        alert('Error: ' + result.error);
      }
    } catch {
      alert('Failed to delete user');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('path', 'users');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();
      
      if (result.success) {
        setFormData({ ...formData, company_logo: result.url });
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.email) {
      alert('Email is required');
      return;
    }

    // Validate supplier-specific fields
    if (formData.is_supplier && !formData.company_name) {
      alert('Company name is required for suppliers');
      return;
    }

    try {
      const url = editingDoc 
        ? `/api/collections/users/${editingDoc.id}`
        : '/api/collections/users';
      
      const method = editingDoc ? 'PUT' : 'POST';
      
      // Prepare data to send
      const dataToSend: Record<string, unknown> = {
        email: formData.email,
        displayName: formData.displayName,
        is_supplier: formData.is_supplier,
      };

      // Add password for new users or when updating
      if (!editingDoc) {
        // Required for new users
        if (!formData.password) {
          alert('Password is required for new users');
          return;
        }
        dataToSend.password = formData.password;
      } else if (formData.password) {
        // Optional for updates - only if provided
        dataToSend.password = formData.password;
      }

      // UID will be auto-generated by Firebase Auth for new users

      // Add supplier-specific fields only if is_supplier is true
      if (formData.is_supplier) {
        dataToSend.company_name = formData.company_name;
        dataToSend.company_logo = formData.company_logo;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setOpenDialog(false);
        setEditingDoc(null);
        setFormData({
          email: '',
          displayName: '',
          is_supplier: false,
          company_name: '',
          company_logo: '',
          password: '',
        });
        fetchDocuments();
      } else {
        alert('Error: ' + result.error);
      }
    } catch {
      alert('Failed to save user');
    }
  };

  const handleAddNew = () => {
    setEditingDoc(null);
    setFormData({
      email: '',
      displayName: '',
      is_supplier: false,
      company_name: '',
      company_logo: '',
      password: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDoc(null);
    setFormData({
      email: '',
      displayName: '',
      is_supplier: false,
      company_name: '',
      company_logo: '',
      password: '',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Users
        </Typography>
        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchDocuments}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Add New User
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={documents}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingDoc ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Email */}
            <TextField
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />

            {/* Display Name */}
            <TextField
              label="Display Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              fullWidth
            />

            {/* Password */}
            <TextField
              label={editingDoc ? "Password (leave empty to keep current)" : "Password *"}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required={!editingDoc}
              helperText={editingDoc ? "Only fill if you want to change the password" : ""}
            />

            {/* Is Supplier Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_supplier}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    is_supplier: e.target.checked,
                    // Clear supplier fields if toggling off
                    company_name: e.target.checked ? formData.company_name : '',
                    company_logo: e.target.checked ? formData.company_logo : '',
                  })}
                  color="primary"
                />
              }
              label="Is Supplier"
            />

            {/* Conditional Supplier Fields */}
            {formData.is_supplier && (
              <>
                <TextField
                  label="Company Name *"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  fullWidth
                  required
                />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Company Logo
                  </Typography>
                  
                  {formData.company_logo && (
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={formData.company_logo} 
                        alt="Company Logo" 
                        sx={{ width: 80, height: 80 }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setFormData({ ...formData, company_logo: '' })}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                    disabled={uploading}
                    fullWidth
                  >
                    {uploading ? 'Uploading...' : 'Upload Company Logo'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Accepted: JPG, PNG, GIF (Max 5MB)
                  </Typography>
                </Box>
              </>
            )}

            {/* Info Messages */}
            {!editingDoc && (
              <Alert severity="info">
                UID and creation time will be automatically generated
              </Alert>
            )}
            
            {editingDoc && (
              <Alert severity="info">
                Created time cannot be modified
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={uploading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

