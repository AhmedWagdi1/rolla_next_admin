'use client';

import * as React from 'react';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { Box, CircularProgress } from '@mui/material';

// Wrapper to ensure DataGrid only renders after client mount for hydration safety
export default function ClientDataGrid(props: DataGridProps) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <Box 
        key="loading" 
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return <DataGrid key="datagrid" {...props} />;
}
