'use client';

import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuItem,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as TestCaseIcon,
  PlayArrow as RunIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FolderOpen as ProjectIcon,
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

const drawerWidth = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Mock user data - replace with actual user context later
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@tcmanager.com',
  role: 'QA Lead'
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { id: 'projects', label: 'Projects', icon: <ProjectIcon />, path: '/projects' },
    { id: 'testcases', label: 'Test Cases', icon: <TestCaseIcon />, path: '/test-cases' },
    { id: 'testruns', label: 'Test Runs', icon: <RunIcon />, path: '/test-runs' },
    { id: 'reports', label: 'Reports', icon: <ReportsIcon />, path: '/reports' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Close menu and redirect to login
    handleProfileMenuClose();
    router.push('/login');
  };

  const handleProfile = () => {
    handleProfileMenuClose();
    router.push('/profile');
  };

  const getSelectedMenuItem = () => {
    const currentPath = pathname;
    const item = navigationItems.find(item => item.path === currentPath);
    return item?.id || 'dashboard';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Welcome back, {mockUser.name}
          </Typography>
          
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            sx={{
              mr: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none'
            }}
            onClick={() => router.push('/test-cases/new')}
          >
            New Test Case
          </Button>
          
          <IconButton><SearchIcon /></IconButton>
          <IconButton><NotificationsIcon /></IconButton>
          
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
            aria-controls="profile-menu"
            aria-haspopup="true"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {mockUser.name.charAt(0)}
            </Avatar>
          </IconButton>

          {/* Profile Menu */}
          <Menu
            id="profile-menu"
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiPaper-root': {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {mockUser.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {mockUser.email}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {mockUser.role}
              </Typography>
            </Box>
            
            <MenuItem onClick={handleProfile}>
              <PersonIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
              My Profile
            </MenuItem>
            
            <MenuItem onClick={() => { handleProfileMenuClose(); router.push('/settings'); }}>
              <SettingsIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
              Settings
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#1a1a2e',
            color: 'white'
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            TCManager
          </Typography>
          <Typography variant="caption" color="grey.400">
            Test Management Platform
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'grey.700' }} />

        <List sx={{ px: 2, py: 1 }}>
          {navigationItems.map((item) => {
            const isSelected = getSelectedMenuItem() === item.id;
            return (
              <ListItem
                key={item.id}
                button
                onClick={() => router.push(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  backgroundColor: isSelected ? alpha('#667eea', 0.2) : 'transparent',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: isSelected ? alpha('#667eea', 0.3) : alpha('#667eea', 0.1)
                  }
                }}
              >
                <ListItemIcon sx={{ color: isSelected ? '#667eea' : 'grey.400', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  sx={{ color: isSelected ? '#667eea' : 'white' }} 
                />
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}; 