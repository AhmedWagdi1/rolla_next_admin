'use client';

import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  PersonOutline as PersonOutlineIcon,
  Category as CategoryIcon,
  LocationCity as LocationCityIcon,
  Public as PublicIcon,
  Notifications as NotificationsIcon,
  HomeWork as HomeWorkIcon,
  Map as MapIcon,
  Campaign as CampaignIcon,
  NotificationsActive as NotificationsActiveIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  RequestPage as RequestPageIcon,
  AutoStories as AutoStoriesIcon,
  Photo as PhotoIcon,
  Label as LabelIcon,
  ExpandLess,
  ExpandMore,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { COLLECTION_CONFIGS } from '@/lib/collections';

const drawerWidth = 280;

const iconMap: Record<string, React.ReactNode> = {
  People: <PeopleIcon />,
  PersonOutline: <PersonOutlineIcon />,
  Category: <CategoryIcon />,
  LocationCity: <LocationCityIcon />,
  Public: <PublicIcon />,
  Notifications: <NotificationsIcon />,
  HomeWork: <HomeWorkIcon />,
  Map: <MapIcon />,
  Campaign: <CampaignIcon />,
  NotificationsActive: <NotificationsActiveIcon />,
  Business: <BusinessIcon />,
  Home: <HomeIcon />,
  Description: <DescriptionIcon />,
  RequestPage: <RequestPageIcon />,
  AutoStories: <AutoStoriesIcon />,
  Photo: <PhotoIcon />,
  Label: <LabelIcon />,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          Rolla Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={pathname === '/dashboard'}
            onClick={() => router.push('/dashboard')}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => setCollectionsOpen(!collectionsOpen)}>
            <ListItemIcon>
              <StorageIcon />
            </ListItemIcon>
            <ListItemText primary="Collections" />
            {collectionsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={collectionsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {Object.values(COLLECTION_CONFIGS).map((config) => (
              <ListItem key={config.name} disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  selected={pathname === `/dashboard/collections/${config.name}`}
                  onClick={() => router.push(`/dashboard/collections/${config.name}`)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {iconMap[config.icon] || <StorageIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={config.displayName}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Firestore Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
