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

interface ProjectDocument {
  id: string;
  title?: string;
  property_type?: { id: string; path: string };
  finishing_type?: { id: string; path: string };
  location?: string;
  space?: string;
  duration?: string;
  budget?: string;
  design_3d?: string;
  description?: string;
  supplier?: string;
  supplier_id?: string;
  project_no?: string;
  rating?: number;
  number_of_proposals?: number;
  checked_by_admins?: boolean;
  need_design?: boolean;
  design_only_needed?: boolean;
  floor_height?: string;
  number_of_floors?: number;
  reception?: number;
  bedrooms?: number;
  bathrooms?: number;
  kitchen?: number;
  category?: string;
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

export default function ProjectsCollectionView() {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<ReferenceCollection[]>([]);
  const [finishingTypes, setFinishingTypes] = useState<ReferenceCollection[]>([]);
  const [suppliers, setSuppliers] = useState<ReferenceCollection[]>([]);
  const [categories, setCategories] = useState<ReferenceCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ProjectDocument | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    property_type: '',
    finishing_type: '',
    location: '',
    space: '',
    duration: '',
    budget: '',
    design_3d: 'no',
    description: '',
    supplier: '',
    supplier_id: '',
    category: '',
    checked_by_admins: false,
    need_design: false,
    design_only_needed: false,
    floor_height: '',
    number_of_floors: 1,
    reception: 0,
    bedrooms: 0,
    bathrooms: 0,
    kitchen: 0,
    rating: 0,
  });

  useEffect(() => {
    fetchDocuments();
    fetchPropertyTypes();
    fetchFinishingTypes();
    fetchSuppliers();
    fetchCategories();
  }, []);

    const fetchDocuments = async () => {

      setLoading(true);

      setError(null);

      try {

        const response = await fetch('/api/collections/projects');

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

  

    const fetchPropertyTypes = async () => {

      try {

        const response = await fetch('/api/collections/property_types');

        const result = await response.json();

        if (result.success) setPropertyTypes(result.data || []);

      } catch (err) {

        console.error('Error fetching property types:', err);

      }

    };

  

    const fetchFinishingTypes = async () => {
    try {
      const response = await fetch('/api/collections/finishing_types');
      const result = await response.json();
      if (result.success) setFinishingTypes(result.data || []);
    } catch (err) {
      console.error('Error fetching finishing types:', err);
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/collections/categories');
      const result = await response.json();
      if (result.success) setCategories(result.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`/api/collections/projects/${id}`, {
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

  const handleEdit = (doc: ProjectDocument) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title || '',
      property_type: doc.property_type?.id || '',
      finishing_type: doc.finishing_type?.id || '',
      location: doc.location || '',
      space: doc.space || '',
      duration: doc.duration || '',
      budget: doc.budget || '',
      design_3d: doc.design_3d || 'no',
      description: doc.description || '',
      supplier: doc.supplier || '',
      supplier_id: doc.supplier_id || '',
      category: doc.category || '',
      checked_by_admins: doc.checked_by_admins || false,
      need_design: doc.need_design || false,
      design_only_needed: doc.design_only_needed || false,
      floor_height: doc.floor_height || '',
      number_of_floors: doc.number_of_floors || 1,
      reception: doc.reception || 0,
      bedrooms: doc.bedrooms || 0,
      bathrooms: doc.bathrooms || 0,
      kitchen: doc.kitchen || 0,
      rating: doc.rating || 0,
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingDoc(null);
    setFormData({
      title: '',
      property_type: '',
      finishing_type: '',
      location: '',
      space: '',
      duration: '',
      budget: '',
      design_3d: 'no',
      description: '',
      supplier: '',
      supplier_id: '',
      category: '',
      checked_by_admins: false,
      need_design: false,
      design_only_needed: false,
      floor_height: '',
      number_of_floors: 1,
      reception: 0,
      bedrooms: 0,
      bathrooms: 0,
      kitchen: 0,
      rating: 0,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      alert('Title is required');
      return;
    }

    try {
      const url = editingDoc 
        ? `/api/collections/projects/${editingDoc.id}`
        : '/api/collections/projects';
      
      const method = editingDoc ? 'PUT' : 'POST';
      
      const dataToSend: Record<string, unknown> = {
        title: formData.title,
        location: formData.location,
        space: formData.space,
        duration: formData.duration,
        budget: formData.budget,
        design_3d: formData.design_3d,
        description: formData.description,
        supplier: formData.supplier,
        supplier_id: formData.supplier_id,
        category: formData.category,
        checked_by_admins: formData.checked_by_admins,
        need_design: formData.need_design,
        design_only_needed: formData.design_only_needed,
        floor_height: formData.floor_height,
        number_of_floors: formData.number_of_floors,
        reception: formData.reception,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        kitchen: formData.kitchen,
        rating: formData.rating,
        number_of_proposals: 0,
      };

      // Add property_type reference if selected
      if (formData.property_type) {
        dataToSend.property_type = formData.property_type;
      }

      // Add finishing_type reference if selected
      if (formData.finishing_type) {
        dataToSend.finishing_type = formData.finishing_type;
      }

      // Generate project number for new projects
      if (!editingDoc) {
        dataToSend.project_no = `PRJ-${Date.now()}`;
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
      title: '',
      property_type: '',
      finishing_type: '',
      location: '',
      space: '',
      duration: '',
      budget: '',
      design_3d: 'no',
      description: '',
      supplier: '',
      supplier_id: '',
      category: '',
      checked_by_admins: false,
      need_design: false,
      design_only_needed: false,
      floor_height: '',
      number_of_floors: 1,
      reception: 0,
      bedrooms: 0,
      bathrooms: 0,
      kitchen: 0,
      rating: 0,
    });
  };

  const getDisplayName = (item: ReferenceCollection) => {
    return item.name_en || item.name_ar || item.name || item.display_name || item.email || item.id;
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 150 },
    { field: 'project_no', headerName: 'Project No', width: 150 },
    { field: 'title', headerName: 'Title', width: 200 },
    { 
      field: 'property_type', 
      headerName: 'Property Type', 
      width: 150,
      valueGetter: (value) => {
        const ref = value as ProjectDocument['property_type'];
        if (!ref?.id) return '—';
        const item = propertyTypes.find(p => p.id === ref.id);
        return item ? getDisplayName(item) : ref.id;
      }
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      valueGetter: (value) => {
        const categoryId = value as string;
        if (!categoryId) return '—';
        const cat = categories.find(c => c.id === categoryId);
        return cat ? getDisplayName(cat) : categoryId;
      }
    },
    { field: 'location', headerName: 'Location', width: 150 },
    { field: 'budget', headerName: 'Budget', width: 120 },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      width: 180,
      valueGetter: (value) => {
        const timestamp = value as ProjectDocument['createdAt'];
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
            onClick={() => handleEdit(params.row as ProjectDocument)}
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
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="large"
        >
          Add Project
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
          {editingDoc ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
            {/* Title */}
            <TextField
              label="Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />

            {/* Property Type and Finishing Type */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  label="Property Type"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {propertyTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {getDisplayName(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Finishing Type</InputLabel>
                <Select
                  value={formData.finishing_type}
                  onChange={(e) => setFormData({ ...formData, finishing_type: e.target.value })}
                  label="Finishing Type"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {finishingTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {getDisplayName(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Category and Supplier */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {getDisplayName(cat)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={formData.supplier}
                  onChange={(e) => {
                    const supplierId = e.target.value;
                    setFormData({ 
                      ...formData, 
                      supplier: supplierId,
                      supplier_id: supplierId
                    });
                  }}
                  label="Supplier"
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
            </Box>

            {/* Location and Space */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                fullWidth
              />
              <TextField
                label="Space (sqm)"
                value={formData.space}
                onChange={(e) => setFormData({ ...formData, space: e.target.value })}
                fullWidth
              />
            </Box>

            {/* Duration and Budget */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                fullWidth
              />
              <TextField
                label="Budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                fullWidth
              />
            </Box>

            {/* Design 3D and Floor Height */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Design 3D</InputLabel>
                <Select
                  value={formData.design_3d}
                  onChange={(e) => setFormData({ ...formData, design_3d: e.target.value })}
                  label="Design 3D"
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Floor Height"
                value={formData.floor_height}
                onChange={(e) => setFormData({ ...formData, floor_height: e.target.value })}
                fullWidth
              />
            </Box>

            {/* Room Counts */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Floors"
                type="number"
                value={formData.number_of_floors}
                onChange={(e) => setFormData({ ...formData, number_of_floors: parseInt(e.target.value) || 1 })}
                fullWidth
              />
              <TextField
                label="Reception"
                type="number"
                value={formData.reception}
                onChange={(e) => setFormData({ ...formData, reception: parseInt(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                fullWidth
              />
            </Box>

            {/* Kitchen and Rating */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Kitchen"
                type="number"
                value={formData.kitchen}
                onChange={(e) => setFormData({ ...formData, kitchen: parseInt(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="Rating"
                type="number"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 0 })}
                fullWidth
                inputProps={{ min: 0, max: 5 }}
              />
            </Box>

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
                    checked={formData.need_design}
                    onChange={(e) => setFormData({ ...formData, need_design: e.target.checked })}
                  />
                }
                label="Need Design"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.design_only_needed}
                    onChange={(e) => setFormData({ ...formData, design_only_needed: e.target.checked })}
                  />
                }
                label="Design Only Needed"
              />
            </Box>

            {/* Description */}
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={4}
            />

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
