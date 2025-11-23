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
import { format } from 'date-fns';

interface ProposalDocument {
  id: string;
  request?: { id: string; path: string };
  supplier?: { id: string; path: string };
  supplierUid?: string;
  items?: Array<{
    item?: string;
    typeOfWork?: string;
    description?: string;
    unit?: string;
    quantity?: string;
    numberOfQty?: number;
    pricePerUnit?: number;
    total?: number;
  }>;
  total?: number;
  pdfUrl?: string;
  pdfPath?: string;
  status?: string;
  createdAt?: { _seconds: number };
  updatedAt?: { _seconds: number };
  [key: string]: unknown;
}

interface ReferenceCollection {
  id: string;
  name_en?: string;
  name_ar?: string;
  name?: string;
  display_name?: string;
  email?: string;
  title?: string;
  [key: string]: unknown;
}

export default function ProposalsCollectionView() {
  const [documents, setDocuments] = useState<ProposalDocument[]>([]);
  const [requests, setRequests] = useState<ReferenceCollection[]>([]);
  const [suppliers, setSuppliers] = useState<ReferenceCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ProposalDocument | null>(null);
  const [formData, setFormData] = useState({
    request: '',
    supplier: '',
    supplierUid: '',
    total: 0,
    pdfUrl: '',
    pdfPath: '',
    status: 'submitted',
  });

  useEffect(() => {
    fetchDocuments();
    fetchRequests();
    fetchSuppliers();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/collections/proposals');
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

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/collections/requests');
      const result = await response.json();
      if (result.success) setRequests(result.data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/collections/users');
      const result = await response.json();
      if (result.success) {
        // Filter only suppliers (is_supplier = true)
        const supplierUsers = (result.data || []).filter((user: ReferenceCollection) => user.is_supplier === true);
        setSuppliers(supplierUsers);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    
    try {
      const response = await fetch(`/api/collections/proposals/${id}`, {
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

  const handleEdit = (doc: ProposalDocument) => {
    setEditingDoc(doc);
    setFormData({
      request: doc.request?.id || '',
      supplier: doc.supplier?.id || '',
      supplierUid: doc.supplierUid || '',
      total: doc.total || 0,
      pdfUrl: doc.pdfUrl || '',
      pdfPath: doc.pdfPath || '',
      status: doc.status || 'submitted',
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingDoc(null);
    setFormData({
      request: '',
      supplier: '',
      supplierUid: '',
      total: 0,
      pdfUrl: '',
      pdfPath: '',
      status: 'submitted',
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.request) {
      alert('Request is required');
      return;
    }
    if (!formData.supplier) {
      alert('Supplier is required');
      return;
    }

    try {
      const url = editingDoc 
        ? `/api/collections/proposals/${editingDoc.id}`
        : '/api/collections/proposals';
      
      const method = editingDoc ? 'PUT' : 'POST';
      
      const dataToSend: Record<string, unknown> = {
        supplierUid: formData.supplierUid,
        total: formData.total,
        pdfUrl: formData.pdfUrl,
        pdfPath: formData.pdfPath,
        status: formData.status,
        items: editingDoc?.items || [],
      };

      // Add request reference
      if (formData.request) {
        dataToSend.request = {
          _type: 'reference',
          _path: `requests/${formData.request}`
        };
      }

      // Add supplier reference
      if (formData.supplier) {
        dataToSend.supplier = {
          _type: 'reference',
          _path: `Users/${formData.supplier}`
        };
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
      request: '',
      supplier: '',
      supplierUid: '',
      total: 0,
      pdfUrl: '',
      pdfPath: '',
      status: 'submitted',
    });
  };

  const getDisplayName = (item: ReferenceCollection) => {
    return item.title || item.name_en || item.name_ar || item.name || item.display_name || item.email || item.id;
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 150 },
    { 
      field: 'request', 
      headerName: 'Request', 
      width: 180,
      valueGetter: (value) => {
        const ref = value as ProposalDocument['request'];
        if (!ref?.id) return '—';
        const item = requests.find(r => r.id === ref.id);
        return item ? getDisplayName(item) : ref.id;
      }
    },
    { 
      field: 'supplier', 
      headerName: 'Supplier', 
      width: 180,
      valueGetter: (value) => {
        const ref = value as ProposalDocument['supplier'];
        if (!ref?.id) return '—';
        const item = suppliers.find(s => s.id === ref.id);
        return item ? getDisplayName(item) : ref.id;
      }
    },
    { field: 'total', headerName: 'Total', width: 120 },
    { field: 'status', headerName: 'Status', width: 120 },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      width: 180,
      valueGetter: (value) => {
        const timestamp = value as ProposalDocument['createdAt'];
        if (!timestamp?._seconds) return '—';
        return format(new Date(timestamp._seconds * 1000), 'yyyy-MM-dd HH:mm');
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
            onClick={() => handleEdit(params.row as ProposalDocument)}
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
          Proposals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="large"
        >
          Add Proposal
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
          {editingDoc ? 'Edit Proposal' : 'Add New Proposal'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              
            {/* Request */}
            <FormControl fullWidth required>
              <InputLabel>Request *</InputLabel>
              <Select
                value={formData.request}
                onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                label="Request *"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {requests.map((req) => (
                  <MenuItem key={req.id} value={req.id}>
                    {getDisplayName(req)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Supplier */}
            <FormControl fullWidth required>
              <InputLabel>Supplier *</InputLabel>
              <Select
                value={formData.supplier}
                onChange={(e) => {
                  const supplierId = e.target.value;
                  setFormData({ 
                    ...formData, 
                    supplier: supplierId,
                    supplierUid: supplierId
                  });
                }}
                label="Supplier *"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {suppliers.map((sup) => (
                  <MenuItem key={sup.id} value={sup.id}>
                    {getDisplayName(sup)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Total */}
            <TextField
              label="Total"
              type="number"
              value={formData.total}
              onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
              fullWidth
            />

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>

            {/* PDF URL */}
            <TextField
              label="PDF URL"
              value={formData.pdfUrl}
              onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
              fullWidth
            />

            {/* PDF Path */}
            <TextField
              label="PDF Path"
              value={formData.pdfPath}
              onChange={(e) => setFormData({ ...formData, pdfPath: e.target.value })}
              fullWidth
            />

            {editingDoc && (
              <Typography variant="caption" color="text.secondary">
                Note: Items cannot be edited here. Use the JSON viewer to see item details.
              </Typography>
            )}

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
