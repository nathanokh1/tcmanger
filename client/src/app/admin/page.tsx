'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Tooltip,
  Avatar,
  Tab,
  Tabs,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  PersonAdd as PersonAddIcon,
  Send as SendIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'qa' | 'developer' | 'viewer';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  invitedBy?: string;
  projects: string[];
}

interface InstanceSettings {
  companyName: string;
  domain: string;
  logo?: string;
  theme: 'light' | 'dark';
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  maxUsers: number;
  features: {
    testAutomation: boolean;
    apiAccess: boolean;
    customFields: boolean;
    integrations: boolean;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPortalPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Instance settings state
  const [instanceSettings, setInstanceSettings] = useState<InstanceSettings>({
    companyName: 'ACME Corporation',
    domain: 'acme.tcmanager.com',
    theme: 'light',
    allowSelfRegistration: false,
    requireEmailVerification: true,
    maxUsers: 50,
    features: {
      testAutomation: true,
      apiAccess: true,
      customFields: false,
      integrations: true,
    }
  });

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'viewer' as User['role'],
    message: ''
  });

  // Mock data for demonstration - TODO: Replace with real API calls
  const mockUsers: User[] = [
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Admin',
      email: 'john.admin@acme.com',
      role: 'admin',
      isActive: true,
      lastLogin: new Date('2024-01-20T10:30:00Z'),
      createdAt: new Date('2024-01-01T00:00:00Z'),
      projects: ['PROJ-1', 'PROJ-2']
    },
    {
      _id: '2',
      firstName: 'Jane',
      lastName: 'Tester',
      email: 'jane.tester@acme.com',
      role: 'qa',
      isActive: true,
      lastLogin: new Date('2024-01-19T15:45:00Z'),
      createdAt: new Date('2024-01-05T00:00:00Z'),
      invitedBy: 'john.admin@acme.com',
      projects: ['PROJ-1']
    },
    {
      _id: '3',
      firstName: 'Bob',
      lastName: 'Developer',
      email: 'bob.dev@acme.com',
      role: 'developer',
      isActive: true,
      lastLogin: new Date('2024-01-18T09:15:00Z'),
      createdAt: new Date('2024-01-10T00:00:00Z'),
      invitedBy: 'john.admin@acme.com',
      projects: ['PROJ-2']
    },
    {
      _id: '4',
      firstName: 'Alice',
      lastName: 'Viewer',
      email: 'alice.viewer@acme.com',
      role: 'viewer',
      isActive: false,
      createdAt: new Date('2024-01-15T00:00:00Z'),
      invitedBy: 'john.admin@acme.com',
      projects: []
    }
  ];

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleInviteUser = async () => {
    // TODO: Implement actual API call to send invitation
    console.log('Inviting user:', inviteForm);
    
    // Simulate invitation
    const newUser: User = {
      _id: Date.now().toString(),
      ...inviteForm,
      isActive: false, // Pending activation
      createdAt: new Date(),
      invitedBy: 'current-admin@acme.com',
      projects: []
    };
    
    setUsers(prev => [...prev, newUser]);
    setInviteDialogOpen(false);
    setInviteForm({
      email: '',
      firstName: '',
      lastName: '',
      role: 'viewer',
      message: ''
    });
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user._id === userId 
          ? { ...user, isActive: !user.isActive }
          : user
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(user => user._id !== userId));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#d32f2f';
      case 'qa': return '#1976d2';
      case 'developer': return '#388e3c';
      case 'viewer': return '#757575';
      default: return '#757575';
    }
  };

  const getStatusChip = (user: User) => {
    if (!user.isActive) {
      return <Chip label="Inactive" size="small" color="error" />;
    }
    if (!user.lastLogin) {
      return <Chip label="Pending" size="small" color="warning" />;
    }
    return <Chip label="Active" size="small" color="success" />;
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    pendingUsers: users.filter(u => !u.lastLogin && u.isActive).length,
    adminUsers: users.filter(u => u.role === 'admin').length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Instance Administration
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage users, settings, and configuration for {instanceSettings.companyName}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setInviteDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none'
          }}
        >
          Invite User
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.totalUsers}
                  </Typography>
                  <Typography color="text.secondary">Total Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                  <ActivateIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.activeUsers}
                  </Typography>
                  <Typography color="text.secondary">Active Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                  <EmailIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.pendingUsers}
                  </Typography>
                  <Typography color="text.secondary">Pending</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#d32f2f', mr: 2 }}>
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.adminUsers}
                  </Typography>
                  <Typography color="text.secondary">Administrators</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="User Management" icon={<PeopleIcon />} iconPosition="start" />
            <Tab label="Instance Settings" icon={<SettingsIcon />} iconPosition="start" />
            <Tab label="Security & Permissions" icon={<SecurityIcon />} iconPosition="start" />
            <Tab label="Usage Analytics" icon={<AnalyticsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* User Management Tab */}
        <CustomTabPanel value={currentTab} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">User Management</Typography>
            <Box>
              <Button
                startIcon={<UploadIcon />}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Import Users
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                variant="outlined"
              >
                Export Users
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Projects</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: getRoleColor(user.role) }}>
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Typography>
                          {user.invitedBy && (
                            <Typography variant="caption" color="text.secondary">
                              Invited by {user.invitedBy}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role.toUpperCase()} 
                        size="small" 
                        sx={{ 
                          bgcolor: getRoleColor(user.role),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(user)}</TableCell>
                    <TableCell>
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={user.projects.length} color="primary">
                        <PeopleIcon color="action" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit User">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedUser(user);
                            setUserDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? "Deactivate" : "Activate"}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleUserStatus(user._id)}
                          color={user.isActive ? "error" : "success"}
                        >
                          {user.isActive ? <BlockIcon /> : <ActivateIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send Email">
                        <IconButton size="small">
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>

        {/* Instance Settings Tab */}
        <CustomTabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>Instance Configuration</Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Configure your instance settings. Changes will affect all users in your organization.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Company Information
                </Typography>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={instanceSettings.companyName}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Domain"
                  value={instanceSettings.domain}
                  disabled
                  sx={{ mb: 2 }}
                />
                <Button variant="outlined" startIcon={<UploadIcon />}>
                  Upload Logo
                </Button>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  User Registration
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Registration Policy</InputLabel>
                  <Select value={instanceSettings.allowSelfRegistration ? 'open' : 'invite'}>
                    <MenuItem value="invite">Invite Only</MenuItem>
                    <MenuItem value="open">Allow Self Registration</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Maximum Users"
                  type="number"
                  value={instanceSettings.maxUsers}
                />
              </Card>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* Security Tab */}
        <CustomTabPanel value={currentTab} index={2}>
          <Typography variant="h6" gutterBottom>Security & Permissions</Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Configure security settings and role-based permissions for your instance.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Authentication Settings
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2">Email Verification Required</Typography>
                    <Button variant={instanceSettings.requireEmailVerification ? 'contained' : 'outlined'}>
                      {instanceSettings.requireEmailVerification ? 'Enabled' : 'Disabled'}
                    </Button>
                  </Box>
                  <Box>
                    <Typography variant="body2">Two-Factor Authentication</Typography>
                    <Button variant="outlined">Configure 2FA</Button>
                  </Box>
                  <Box>
                    <Typography variant="body2">Session Timeout</Typography>
                    <TextField size="small" label="Hours" defaultValue="24" type="number" />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* Analytics Tab */}
        <CustomTabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>Usage Analytics</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">2,847</Typography>
                <Typography variant="body2">Total Test Cases</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">156</Typography>
                <Typography variant="body2">Test Runs This Month</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">89%</Typography>
                <Typography variant="body2">API Usage</Typography>
              </Card>
            </Grid>
          </Grid>
        </CustomTabPanel>
      </Paper>

      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteForm.role}
                onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as User['role'] }))}
              >
                <MenuItem value="viewer">Viewer - Read-only access</MenuItem>
                <MenuItem value="developer">Developer - Can view and comment</MenuItem>
                <MenuItem value="qa">QA Tester - Can create and execute tests</MenuItem>
                <MenuItem value="admin">Administrator - Full access</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Personal Message (Optional)"
              multiline
              rows={3}
              value={inviteForm.message}
              onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Welcome to our TCManager instance..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleInviteUser}
            startIcon={<SendIcon />}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminPortalPage; 