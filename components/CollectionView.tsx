'use client';

import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { format } from 'date-fns';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ClientDataGrid from './ClientDataGrid';
import JsonViewer from './JsonViewer';

interface CollectionViewProps {
  collectionName: string;
}

export default function CollectionView({ collectionName }: CollectionViewProps) {
  const [documents, setDocuments] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [columns, setColumns] = useState<GridColDef[]>([]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/collections/${collectionName}`);
      const result = await response.json();
      
      if (result.success) {
        setDocuments(result.data);
        
        // Generate columns from first document
        if (result.data.length > 0) {
          const firstDoc = result.data[0];
          const cols: GridColDef[] = [
            { 
              field: 'id', 
              headerName: 'ID', 
              width: 150,
              renderCell: (params: GridRenderCellParams) => (
                <Chip label={params.value as string} size="small" />
              )
            },
          ];
          
          Object.keys(firstDoc).forEach(key => {
            if (key !== 'id') {
              cols.push({
                field: key,
                headerName: key.replace(/_/g, ' ').toUpperCase(),
                width: 150,
                renderCell: (params: GridRenderCellParams) => {
                  const value = params.value;
                  if (typeof value === 'object' && value !== null) {
                    // Check for Firestore timestamp object
                    if (value && typeof value === 'object' && '_seconds' in value && '_nanoseconds' in value) {
                      const date = new Date((value as { _seconds: number })._seconds * 1000);
                      return <Typography variant="body2">{format(date, 'MMM dd, yyyy HH:mm')}</Typography>;
                    }

                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption">Object</Typography>
                        <JsonViewer data={value} label={`${key} data`} />
                      </Box>
                    );
                  }
                  if (Array.isArray(value)) {
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption">Array ({value.length})</Typography>
                        <JsonViewer data={value} label={`${key} data`} />
                      </Box>
                    );
                  }
                  if (typeof value === 'boolean') {
                    return <Chip label={value ? 'Yes' : 'No'} size="small" color={value ? 'success' : 'default'} />;
                  }
                  return <Typography variant="body2">{String(value).substring(0, 50)}</Typography>;
                }
              });
            }
          });
          
          cols.push({
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
              <Box>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleEdit(params.row as Record<string, unknown>)}
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
          });
          
          setColumns(cols);
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  const handleEdit = (doc: Record<string, unknown>) => {
    setEditingDoc(doc);
    const data: Record<string, string> = {};
    Object.keys(doc).forEach(key => {
      if (key !== 'id' && typeof doc[key] !== 'object') {
        data[key] = String(doc[key]);
      }
    });
    setFormData(data);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const response = await fetch(`/api/collections/${collectionName}/${id}`, {
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

  const handleSave = async () => {
    try {
      const url = editingDoc 
        ? `/api/collections/${collectionName}/${editingDoc.id}`
        : `/api/collections/${collectionName}`;
      
      const method = editingDoc ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setOpenDialog(false);
        setEditingDoc(null);
        setFormData({});
        fetchDocuments();
      } else {
        alert('Error: ' + result.error);
      }
    } catch {
      alert('Failed to save document');
    }
  };

  const handleAddNew = () => {
    setEditingDoc(null);
    setFormData({});
    setOpenDialog(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {collectionName}
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
            Add New
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <ClientDataGrid
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
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingDoc ? 'Edit Document' : 'Add New Document'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {columns
              .filter(col => col.field !== 'id' && col.field !== 'actions')
              .map(col => (
                <TextField
                  key={col.field}
                  label={col.headerName}
                  value={formData[col.field] || ''}
                  onChange={(e) => setFormData({ ...formData, [col.field]: e.target.value })}
                  fullWidth
                />
              ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
