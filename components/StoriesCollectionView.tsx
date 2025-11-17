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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import JsonViewer from './JsonViewer';
import { format } from 'date-fns';

interface StoryDocument {
  id: string;
  storyCreator?: { id: string; path: string } | string;
  storyImageURL?: string;
  fileName?: string;
  expiresAt?: { _seconds: number };
  createdAt?: { _seconds: number };
  [key: string]: unknown;
}

interface UserCollection {
  id: string;
  email?: string;
  display_name?: string;
  [key: string]: unknown;
}

export default function StoriesCollectionView() {
  const [documents, setDocuments] = useState<StoryDocument[]>([]);
  const [users, setUsers] = useState<UserCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<StoryDocument | null>(null);
  const [formData, setFormData] = useState({
    storyCreator: '',
    storyImageURL: '',
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchUsers();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/collections/stories');
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/collections/users');
      const result = await response.json();
      if (result.success) setUsers(result.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    
    try {
      const response = await fetch(`/api/collections/stories/${id}`, {
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

  const handleEdit = (doc: StoryDocument) => {
    setEditingDoc(doc);
    
    // Handle both reference object and string formats for storyCreator
    let creatorId = '';
    if (typeof doc.storyCreator === 'string') {
      creatorId = doc.storyCreator;
    } else if (doc.storyCreator && typeof doc.storyCreator === 'object' && 'id' in doc.storyCreator) {
      creatorId = doc.storyCreator.id;
    }
    
    setFormData({
      storyCreator: creatorId,
      storyImageURL: doc.storyImageURL || '',
    });
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingDoc(null);
    setFormData({
      storyCreator: '',
      storyImageURL: '',
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
        setFormData({ ...formData, storyImageURL: result.url });
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
    if (!formData.storyCreator) {
      alert('Story creator is required');
      return;
    }
    if (!formData.storyImageURL) {
      alert('Story image is required. Please upload an image.');
      return;
    }

    try {
      const url = editingDoc 
        ? `/api/collections/stories/${editingDoc.id}`
        : '/api/collections/stories';
      
      const method = editingDoc ? 'PUT' : 'POST';
      
      const dataToSend: Record<string, unknown> = {
        storyImageURL: formData.storyImageURL,
      };

      // Add storyCreator as reference
      if (formData.storyCreator) {
        dataToSend.storyCreator = {
          _type: 'reference',
          _path: `Users/${formData.storyCreator}`
        };
      }

      // Set expiration time (24 hours from now) for new stories
      if (!editingDoc) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        dataToSend.expiresAt = expiresAt;
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
      storyCreator: '',
      storyImageURL: '',
    });
    setSelectedFile(null);
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.email || user?.display_name || userId;
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 180 },
    { 
      field: 'storyCreator', 
      headerName: 'Creator', 
      width: 200,
      valueGetter: (value) => {
        let userId = '';
        if (typeof value === 'string') {
          userId = value;
        } else if (value && typeof value === 'object' && 'id' in value) {
          userId = (value as { id: string }).id;
        }
        return userId ? getUserEmail(userId) : '—';
      }
    },
    { 
      field: 'storyImageURL', 
      headerName: 'Image', 
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const imageURL = params.value as string;
        return imageURL ? (
          <Box
            component="img"
            src={imageURL}
            alt="Story"
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
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      width: 180,
      valueGetter: (value) => {
        const timestamp = value as StoryDocument['createdAt'];
        if (!timestamp?._seconds) return '—';
        return format(new Date(timestamp._seconds * 1000), 'yyyy-MM-dd HH:mm');
      }
    },
    { 
      field: 'expiresAt', 
      headerName: 'Expires At', 
      width: 180,
      valueGetter: (value) => {
        const timestamp = value as StoryDocument['expiresAt'];
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
            onClick={() => handleEdit(params.row as StoryDocument)}
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
          Stories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="large"
        >
          Add Story
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
          {editingDoc ? 'Edit Story' : 'Add New Story'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Story Creator */}
            <FormControl fullWidth required>
              <InputLabel>Story Creator *</InputLabel>
              <Select
                value={formData.storyCreator}
                onChange={(e) => setFormData({ ...formData, storyCreator: e.target.value })}
                label="Story Creator *"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.email || user.display_name || user.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Image Upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Story Image *
              </Typography>
              
              {formData.storyImageURL && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    component="img"
                    src={formData.storyImageURL}
                    alt="Preview"
                    sx={{
                      width: '100%',
                      maxHeight: 300,
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

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!formData.storyCreator || !formData.storyImageURL}
          >
            {editingDoc ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
