'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

interface JsonViewerProps {
  data: unknown;
  label?: string;
}

export default function JsonViewer({ data, label = 'View Data' }: JsonViewerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        size="small"
        color="primary"
        onClick={() => setOpen(true)}
        title={label}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{label}</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              backgroundColor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: '70vh',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
            }}
          >
            {JSON.stringify(data, null, 2)}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
