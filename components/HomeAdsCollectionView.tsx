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
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import JsonViewer from './JsonViewer';

interface HomeAdDocument {
  id: string;
  imageURL?: string;
  link?: string;
  [key: string]: unknown;
}

export default function HomeAdsCollectionView() {
  const [documents, setDocuments] = useState<HomeAdDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<HomeAdDocument | null>(null);
  const [formData, setFormData] = useState({
    imageURL: '',
    link: '',
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/collections/home_ads');
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this home ad?')) return;
    
    try {
      const response = await fetch(`/api/collections/home_ads/${id}`, {
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

  const handleEdit = (doc: HomeAdDocument) => {
    setEditingDoc(doc);
    setFormData({
      imageURL: doc.imageURL || '',
      link: doc.link || '',
    });
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingDoc(null);
    setFormData({
      imageURL: '',
      link: '',
    });
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();
      
      if (result.success && result.url) {
        setFormData({ ...formData, imageURL: result.url });
        setSelectedFile(null);
        alert('Image uploaded successfully!');
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (err) {
      alert('Upload error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.imageURL) {
      alert('Image URL is required. Please upload an image.');
      return;
    }

    try {
      const url = editingDoc 
        ? `/api/collections/home_ads/${editingDoc.id}`
        : '/api/collections/home_ads';
      
      const method = editingDoc ? 'PUT' : 'POST';
      
      const dataToSend = {
        imageURL: formData.imageURL,
        link: formData.link,
      };

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
      imageURL: '',
      link: '',
    });
    setSelectedFile(null);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 200 },
    { 
      field: 'imageURL', 
      headerName: 'Image', 
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const imageURL = params.value as string;
        return imageURL ? (
          <Box
            component="img"
            src={imageURL}
            alt="Ad"
            sx={{
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius: 1,
              my: 0.5,
            }}
          />
        ) : '—';
      }
    },
    { field: 'link', headerName: 'Link', width: 300 },
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
            onClick={() => handleEdit(params.row as HomeAdDocument)}
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
          Home Ads
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="large"
        >
          Add Home Ad
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <DataGrid
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
          rowHeight={80}
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
          {editingDoc ? 'Edit Home Ad' : 'Add New Home Ad'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Image Upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Ad Image *
              </Typography>
              
              {formData.imageURL && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    component="img"
                    src={formData.imageURL}
                    alt="Preview"
                    sx={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'contain',
                      borderRadius: 1,
                      border: '1px solid #ddd',
                      p: 1,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Current image
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading}
                >
                  Select Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </Button>

                {selectedFile && (
                  <>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {selectedFile.name}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleUploadImage}
                      disabled={uploading}
                      startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </>
                )}
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </Typography>
            </Box>

            {/* Link */}
            <TextField
              label="Link URL"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              fullWidth
              placeholder="https://example.com"
            />

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.imageURL}>
            {editingDoc ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
