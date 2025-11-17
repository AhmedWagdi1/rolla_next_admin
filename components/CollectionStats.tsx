'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
} from '@mui/material';

interface CollectionStatsProps {
  collectionName: string;
  icon: React.ReactNode;
  color: string;
}

export default function CollectionStats({ collectionName, icon, color }: CollectionStatsProps) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(`/api/collections/${collectionName}`);
        const result = await response.json();
        if (result.success) {
          setCount(result.count);
        }
      } catch {
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [collectionName]);

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        color: 'white',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            {loading ? (
              <Skeleton variant="text" width={60} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            ) : (
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {count}
              </Typography>
            )}
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {collectionName}
            </Typography>
          </Box>
          <Box sx={{ opacity: 0.8 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
