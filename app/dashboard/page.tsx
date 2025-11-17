import { 
  Box, 
  Card, 
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  Storage as StorageIcon,
  People as PeopleIcon,
  RequestPage as RequestPageIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { COLLECTION_CONFIGS } from '@/lib/collections';

export default function DashboardPage() {
  const collections = Object.values(COLLECTION_CONFIGS);

  const stats = [
    { title: 'Total Collections', value: collections.length, icon: <StorageIcon fontSize="large" />, color: '#1976d2' },
    { title: 'User Collections', value: 2, icon: <PeopleIcon fontSize="large" />, color: '#dc004e' },
    { title: 'Requests', value: 1, icon: <RequestPageIcon fontSize="large" />, color: '#388e3c' },
    { title: 'Proposals', value: 1, icon: <DescriptionIcon fontSize="large" />, color: '#f57c00' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        Dashboard Overview
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        {stats.map((stat, index) => (
          <Card key={index} sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Box sx={{ opacity: 0.8 }}>
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Available Collections
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        {collections.map((config) => (
          <Paper 
            key={config.name}
            elevation={0}
            sx={{ 
              p: 3, 
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 2,
                transform: 'translateY(-4px)',
              }
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {config.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {config.description}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 2, 
                display: 'block',
                color: 'primary.main',
                fontFamily: 'monospace'
              }}
            >
              {config.name}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
