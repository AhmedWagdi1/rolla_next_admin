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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ClientDataGrid from './ClientDataGrid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import JsonViewer from './JsonViewer';
import { format } from 'date-fns';

interface RequestDocument {
  id: string;
  client?: { id: string; path: string };
  createdByUid?: string;
  clientName?: string;
  mobileNumber?: string;
  propertyType?: string;
  propertyLocation?: string;
  propertySpace?: string;
  numberBedrooms?: number;
  numberReception?: number;
  numberBathrooms?: number;
  numberKitchen?: number;
  currentStatus?: string;
  status?: string;
  requiredFinishing?: string;
  estimatedBudget?: string;
  designNeeded?: string;
  finishingMaterials?: string;
  otherDetails?: string;
  checked_by_admins?: boolean;
  acceptingProposals?: boolean;
  acceptedProposal?: { id: string; path: string };
  acceptedSupplier?: { id: string; path: string };
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
  [key: string]: unknown;
}

export default function RequestsCollectionView() {
  const [documents, setDocuments] = useState<RequestDocument[]>([]);
  const [proposals, setProposals] = useState<ReferenceCollection[]>([]);
  const [suppliers, setSuppliers] = useState<ReferenceCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<RequestDocument | null>(null);
  const [formData, setFormData] = useState({
    client: '',
    createdByUid: '',
    clientName: '',
    mobileNumber: '',
    propertyType: '',
    propertyLocation: '',
    propertySpace: '',
    numberBedrooms: 0,
    numberReception: 0,
    numberBathrooms: 0,
    numberKitchen: 0,
    currentStatus: 'new',
    status: 'new',
    requiredFinishing: 'full',
    estimatedBudget: '',
    designNeeded: 'no',
    finishingMaterials: '',
    otherDetails: '',
    checked_by_admins: false,
    acceptingProposals: false,
    acceptedProposal: '',
    acceptedSupplier: '',
  });

  useEffect(() => {
    fetchDocuments();
    fetchProposals();
    fetchSuppliers();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/collections/requests');
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

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/collections/proposals');
      const result = await response.json();
      if (result.success) setProposals(result.data || []);
    } catch (err) {
      console.error('Error fetching proposals:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/collections/users');
      const result = await response.json();
      if (result.success) {
        const supplierUsers = (result.data || []).filter((user: ReferenceCollection) => user.is_supplier === true);
        setSuppliers(supplierUsers);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    try {
      const response = await fetch(`/api/collections/requests/${id}`, {
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

  const handleEdit = (doc: RequestDocument) => {
    setEditingDoc(doc);
    setFormData({
      client: doc.client?.id || '',
      createdByUid: doc.createdByUid || '',
      clientName: doc.clientName || '',
      mobileNumber: doc.mobileNumber || '',
      propertyType: doc.propertyType || '',
      propertyLocation: doc.propertyLocation || '',
      propertySpace: doc.propertySpace || '',
      numberBedrooms: doc.numberBedrooms || 0,
      numberReception: doc.numberReception || 0,
      numberBathrooms: doc.numberBathrooms || 0,
      numberKitchen: doc.numberKitchen || 0,
      currentStatus: doc.currentStatus || 'new',
      status: doc.status || 'new',
      requiredFinishing: doc.requiredFinishing || 'full',
      estimatedBudget: doc.estimatedBudget || '',
      designNeeded: doc.designNeeded || 'no',
      finishingMaterials: doc.finishingMaterials || '',
      otherDetails: doc.otherDetails || '',
      checked_by_admins: doc.checked_by_admins || false,
      acceptingProposals: doc.acceptingProposals || false,
      acceptedProposal: doc.acceptedProposal?.id || '',
      acceptedSupplier: doc.acceptedSupplier?.id || '',
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingDoc(null);
    setFormData({
      client: '',
      createdByUid: '',
      clientName: '',
      mobileNumber: '',
      propertyType: '',
      propertyLocation: '',
      propertySpace: '',
      numberBedrooms: 0,
      numberReception: 0,
      numberBathrooms: 0,
      numberKitchen: 0,
      currentStatus: 'new',
      status: 'new',
      requiredFinishing: 'full',
      estimatedBudget: '',
      designNeeded: 'no',
      finishingMaterials: '',
      otherDetails: '',
      checked_by_admins: false,
      acceptingProposals: false,
      acceptedProposal: '',
      acceptedSupplier: '',
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.clientName) {
      alert('Client name is required');
      return;
    }

    try {
      const url = editingDoc 
        ? `/api/collections/requests/${editingDoc.id}`
        : '/api/collections/requests';
      
      const method = editingDoc ? 'PUT' : 'POST';
      
      const dataToSend: Record<string, unknown> = {
        createdByUid: formData.createdByUid,
        clientName: formData.clientName,
        mobileNumber: formData.mobileNumber,
        propertyType: formData.propertyType,
        propertyLocation: formData.propertyLocation,
        propertySpace: formData.propertySpace,
        numberBedrooms: formData.numberBedrooms,
        numberReception: formData.numberReception,
        numberBathrooms: formData.numberBathrooms,
        numberKitchen: formData.numberKitchen,
        currentStatus: formData.currentStatus,
        status: formData.status,
        requiredFinishing: formData.requiredFinishing,
        estimatedBudget: formData.estimatedBudget,
        designNeeded: formData.designNeeded,
        finishingMaterials: formData.finishingMaterials,
        otherDetails: formData.otherDetails,
        checked_by_admins: formData.checked_by_admins,
        acceptingProposals: formData.acceptingProposals,
      };

      // Add client reference if selected
      if (formData.client) {
        dataToSend.client = formData.client;
      }

      // Add acceptedProposal reference if selected
      if (formData.acceptedProposal) {
        dataToSend.acceptedProposal = formData.acceptedProposal;
      }

      // Add acceptedSupplier reference if selected
      if (formData.acceptedSupplier) {
        dataToSend.acceptedSupplier = formData.acceptedSupplier;
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
      client: '',
      createdByUid: '',
      clientName: '',
      mobileNumber: '',
      propertyType: '',
      propertyLocation: '',
      propertySpace: '',
      numberBedrooms: 0,
      numberReception: 0,
      numberBathrooms: 0,
      numberKitchen: 0,
      currentStatus: 'new',
      status: 'new',
      requiredFinishing: 'full',
      estimatedBudget: '',
      designNeeded: 'no',
      finishingMaterials: '',
      otherDetails: '',
      checked_by_admins: false,
      acceptingProposals: false,
      acceptedProposal: '',
      acceptedSupplier: '',
    });
  };

  const getDisplayName = (item: ReferenceCollection) => {
    return item.name_en || item.name_ar || item.name || item.display_name || item.email || item.id;
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 150 },
    { field: 'clientName', headerName: 'Client Name', width: 150 },
    { 
      field: 'client', 
      headerName: 'Client User', 
      width: 150,
      valueGetter: (value) => {
        const client = value as ReferenceCollection;
        if (!client) return '—';
        return getDisplayName(client);
      }
    },
    { field: 'mobileNumber', headerName: 'Mobile', width: 130 },
    { field: 'propertyType', headerName: 'Property Type', width: 130 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'estimatedBudget', headerName: 'Budget', width: 120 },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      width: 180,
      valueGetter: (value) => {
        const timestamp = value as RequestDocument['createdAt'];
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
            onClick={() => handleEdit(params.row as RequestDocument)}
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
          Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="large"
        >
          Add Request
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingDoc ? 'Edit Request' : 'Add New Request'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            {/* Client Name */}
            <TextField
              label="Client Name *"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              fullWidth
              required
            />

            {/* Mobile Number */}
            <TextField
              label="Mobile Number"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              fullWidth
            />

            {/* Client User Reference */}
            <FormControl fullWidth>
              <InputLabel>Client User</InputLabel>
              <Select
                value={formData.client}
                onChange={(e) => {
                  const clientId = e.target.value;
                  setFormData({ 
                    ...formData, 
                    client: clientId,
                    createdByUid: clientId
                  });
                }}
                label="Client User"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {/* Users are populated from the requests themselves */}
              </Select>
            </FormControl>

            {/* Property Type */}
            <TextField
              label="Property Type"
              value={formData.propertyType}
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
              fullWidth
            />

            {/* Property Location */}
            <TextField
              label="Property Location"
              value={formData.propertyLocation}
              onChange={(e) => setFormData({ ...formData, propertyLocation: e.target.value })}
              fullWidth
            />

            {/* Property Space */}
            <TextField
              label="Property Space"
              value={formData.propertySpace}
              onChange={(e) => setFormData({ ...formData, propertySpace: e.target.value })}
              fullWidth
            />

            {/* Room Numbers - Row 1 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Bedrooms"
                type="number"
                value={formData.numberBedrooms}
                onChange={(e) => setFormData({ ...formData, numberBedrooms: parseInt(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="Reception"
                type="number"
                value={formData.numberReception}
                onChange={(e) => setFormData({ ...formData, numberReception: parseInt(e.target.value) || 0 })}
                fullWidth
              />
            </Box>

            {/* Room Numbers - Row 2 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Bathrooms"
                type="number"
                value={formData.numberBathrooms}
                onChange={(e) => setFormData({ ...formData, numberBathrooms: parseInt(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="Kitchen"
                type="number"
                value={formData.numberKitchen}
                onChange={(e) => setFormData({ ...formData, numberKitchen: parseInt(e.target.value) || 0 })}
                fullWidth
              />
            </Box>

            {/* Required Finishing */}
            <FormControl fullWidth>
              <InputLabel>Required Finishing</InputLabel>
              <Select
                value={formData.requiredFinishing}
                onChange={(e) => setFormData({ ...formData, requiredFinishing: e.target.value })}
                label="Required Finishing"
              >
                <MenuItem value="full">Full</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="none">None</MenuItem>
              </Select>
            </FormControl>

            {/* Estimated Budget */}
            <TextField
              label="Estimated Budget"
              value={formData.estimatedBudget}
              onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
              fullWidth
            />

            {/* Design Needed */}
            <FormControl fullWidth>
              <InputLabel>Design Needed</InputLabel>
              <Select
                value={formData.designNeeded}
                onChange={(e) => setFormData({ ...formData, designNeeded: e.target.value })}
                label="Design Needed"
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>

            {/* Finishing Materials */}
            <TextField
              label="Finishing Materials"
              value={formData.finishingMaterials}
              onChange={(e) => setFormData({ ...formData, finishingMaterials: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />

            {/* Other Details */}
            <TextField
              label="Other Details"
              value={formData.otherDetails}
              onChange={(e) => setFormData({ ...formData, otherDetails: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            {/* Accepted Proposal */}
            <FormControl fullWidth>
              <InputLabel>Accepted Proposal</InputLabel>
              <Select
                value={formData.acceptedProposal}
                onChange={(e) => setFormData({ ...formData, acceptedProposal: e.target.value })}
                label="Accepted Proposal"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {proposals.map((proposal) => (
                  <MenuItem key={proposal.id} value={proposal.id}>
                    {proposal.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Accepted Supplier */}
            <FormControl fullWidth>
              <InputLabel>Accepted Supplier</InputLabel>
              <Select
                value={formData.acceptedSupplier}
                onChange={(e) => setFormData({ ...formData, acceptedSupplier: e.target.value })}
                label="Accepted Supplier"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {getDisplayName(supplier)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Toggles */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.checked_by_admins}
                    onChange={(e) => setFormData({ ...formData, checked_by_admins: e.target.checked })}
                  />
                }
                label="Checked by Admins"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.acceptingProposals}
                    onChange={(e) => setFormData({ ...formData, acceptingProposals: e.target.checked })}
                  />
                }
                label="Accepting Proposals"
              />
            </Box>

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
