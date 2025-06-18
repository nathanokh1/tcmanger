'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  LinearProgress,
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
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Warning as BlockedIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const drawerWidth = 280;

// Mock data
const mockData = {
  user: {
    name: 'John Doe',
    email: 'john.doe@tcmanager.com',
    role: 'QA Lead'
  },
  stats: {
    totalTests: 1354,
    passedTests: 1205,
    failedTests: 108,
    blockedTests: 2,
    pendingTests: 41,
    passRate: 89
  },
  recentActivity: [
    { id: 1, user: 'John', action: 'updated Test Case TC-1234', time: '2 min ago' },
    { id: 2, user: 'System', action: 'linked defect DEF-567 to TC-890', time: '5 min ago' },
    { id: 3, user: 'Alice', action: 'completed automation run', time: '10 min ago' }
  ],
  myTestCases: [
    { id: 'TC-1234', title: 'User Login Validation', status: 'Active', priority: 'High' },
    { id: 'TC-1235', title: 'Password Reset Flow', status: 'Draft', priority: 'Medium' }
  ],
  projects: [
    { name: 'E-Commerce Platform', key: 'ECOM', tests: 456, automation: 78 },
    { name: 'Mobile App', key: 'MOBILE', tests: 234, automation: 92 }
  ]
};

export default function DashboardPage() {
  const router = useRouter();
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { id: 'projects', label: 'Projects', icon: <ProjectIcon />, path: '/projects' },
    { id: 'testcases', label: 'Test Cases', icon: <TestCaseIcon />, path: '/test-cases' },
    { id: 'testruns', label: 'Test Runs', icon: <RunIcon />, path: '/test-runs' },
    { id: 'reports', label: 'Reports', icon: <ReportsIcon />, path: '/reports' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

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
            Welcome back, {mockData.user.name}
          </Typography>
          
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            sx={{
              mr: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none'
            }}
          >
            New Test Case
          </Button>
          
          <IconButton><SearchIcon /></IconButton>
          <IconButton><NotificationsIcon /></IconButton>
          
          <Avatar sx={{ width: 32, height: 32, ml: 2 }}>
            {mockData.user.name.charAt(0)}
          </Avatar>
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
          {navigationItems.map((item) => (
            <ListItem
              key={item.id}
              button
              onClick={() => {
                setSelectedMenuItem(item.id);
                router.push(item.path);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: selectedMenuItem === item.id ? alpha('#667eea', 0.2) : 'transparent',
                cursor: 'pointer'
              }}
            >
              <ListItemIcon sx={{ color: selectedMenuItem === item.id ? '#667eea' : 'grey.400', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                sx={{ color: selectedMenuItem === item.id ? '#667eea' : 'white' }} 
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Grid container spacing={3}>
          {/* Status Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PassIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {mockData.stats.passRate}%
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  Passed: {mockData.stats.passedTests} tests
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={mockData.stats.passRate} 
                  sx={{ mt: 2, height: 6, borderRadius: 3 }}
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FailIcon sx={{ color: 'error.main', mr: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {mockData.stats.failedTests}
                  </Typography>
                </Box>
                <Typography color="text.secondary">Failed Tests</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PendingIcon sx={{ color: 'info.main', mr: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {mockData.stats.pendingTests}
                  </Typography>
                </Box>
                <Typography color="text.secondary">Pending Tests</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BlockedIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {mockData.stats.blockedTests}
                  </Typography>
                </Box>
                <Typography color="text.secondary">Blocked Tests</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '400px' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Activity
                </Typography>
                <Box>
                  {mockData.recentActivity.map((activity) => (
                    <Box key={activity.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
                      <Typography variant="body2">
                        <strong>{activity.user}</strong> {activity.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* My Test Cases */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '400px' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  My Test Cases
                </Typography>
                <Box>
                  {mockData.myTestCases.map((testCase) => (
                    <Box key={testCase.id} sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {testCase.id}
                        </Typography>
                        <Chip label={testCase.priority} size="small" />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {testCase.title}
                      </Typography>
                      <Chip label={testCase.status} size="small" variant="outlined" />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
} 