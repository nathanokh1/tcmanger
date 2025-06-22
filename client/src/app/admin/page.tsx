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
  CircularProgress,
  Snackbar,
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
  role: 'admin' | 'instance_admin' | 'qa' | 'developer' | 'viewer';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  invitedBy?: string;
  projects?: string[];
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roleBreakdown: { _id: string; count: number }[];
  recentUsers: User[];
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
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  // API helper function
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // Load users and statistics
  const loadUsers = async () => {
    try {
      setLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        apiCall('/users'),
        apiCall('/users/stats')
      ]);

      setUsers(usersResponse.data || []);
      setUserStats(statsResponse.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleInviteUser = async () => {
    try {
      setActionLoading(true);
      const response = await apiCall('/users/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: inviteForm.email,
          firstName: inviteForm.firstName,
          lastName: inviteForm.lastName,
          role: inviteForm.role
        })
      });

      setSuccess(`User invited successfully! Temporary password: ${response.tempPassword}`);
      setInviteDialogOpen(false);
      setInviteForm({ email: '', firstName: '', lastName: '', role: 'viewer', message: '' });
      loadUsers(); // Refresh the user list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      await apiCall(`/users/${selectedUser._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          role: selectedUser.role,
          isActive: selectedUser.isActive
        })
      });

      setSuccess('User updated successfully');
      setUserDialogOpen(false);
      setSelectedUser(null);
      loadUsers(); // Refresh the user list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setActionLoading(true);
      await apiCall(`/users/${userId}/toggle-status`, {
        method: 'PATCH'
      });

      setSuccess('User status updated successfully');
      loadUsers(); // Refresh the user list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await apiCall(`/users/${userId}`, {
        method: 'DELETE'
      });

      setSuccess('User deleted successfully');
      loadUsers(); // Refresh the user list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'instance_admin':
        return 'error';
      case 'qa':
        return 'warning';
      case 'developer':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusChip = (user: User) => {
    if (user.isActive) {
      return <Chip label="Active" color="success" size="small" />;
    } else {
      return <Chip label="Inactive" color="default" size="small" />;
    }
  };

  const handleCloseError = () => setError(null);
  const handleCloseSuccess = () => setSuccess(null);

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Instance Admin Portal
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setInviteDialogOpen(true)}
            disabled={actionLoading}
          >
            Invite User
          </Button>
        </Box>

        {/* Stats Cards */}
        {userStats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">{userStats.totalUsers}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ActivateIcon color="success" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">{userStats.activeUsers}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Users
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BlockIcon color="warning" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">{userStats.inactiveUsers}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Inactive Users
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SecurityIcon color="info" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        {userStats.roleBreakdown.find(r => r._id === 'admin')?.count || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Admins
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab
              icon={<PeopleIcon />}
              label="User Management"
              iconPosition="start"
            />
            <Tab
              icon={<SettingsIcon />}
              label="Instance Settings"
              iconPosition="start"
            />
            <Tab
              icon={<SecurityIcon />}
              label="Security & Permissions"
              iconPosition="start"
            />
            <Tab
              icon={<AnalyticsIcon />}
              label="Usage Analytics"
              iconPosition="start"
            />
          </Tabs>

          {/* Tab Content */}
          <CustomTabPanel value={currentTab} index={0}>
            {/* User Management Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}>
                            {user.firstName[0]}{user.lastName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
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
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
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
                        <Tooltip title="Edit User">
                          <IconButton
                            onClick={() => handleEditUser(user)}
                            disabled={actionLoading}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            onClick={() => handleToggleUserStatus(user._id)}
                            disabled={actionLoading}
                          >
                            {user.isActive ? <BlockIcon /> : <ActivateIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={actionLoading}
                            color="error"
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

          <CustomTabPanel value={currentTab} index={1}>
            <Typography variant="h6" gutterBottom>
              Instance Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Instance settings functionality will be implemented in the next phase.
            </Typography>
          </CustomTabPanel>

          <CustomTabPanel value={currentTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Security & Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Security and permissions management will be implemented in the next phase.
            </Typography>
          </CustomTabPanel>

          <CustomTabPanel value={currentTab} index={3}>
            <Typography variant="h6" gutterBottom>
              Usage Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Usage analytics dashboard will be implemented in the next phase.
            </Typography>
          </CustomTabPanel>
        </Paper>

        {/* Invite User Dialog */}
        <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as User['role'] })}
                  >
                    <MenuItem value="viewer">Viewer</MenuItem>
                    <MenuItem value="developer">Developer</MenuItem>
                    <MenuItem value="qa">QA Tester</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleInviteUser}
              variant="contained"
              disabled={actionLoading || !inviteForm.email || !inviteForm.firstName || !inviteForm.lastName}
              startIcon={actionLoading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Send Invitation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    value={selectedUser.email}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={selectedUser.role}
                      onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as User['role'] })}
                    >
                      <MenuItem value="viewer">Viewer</MenuItem>
                      <MenuItem value="developer">Developer</MenuItem>
                      <MenuItem value="qa">QA Tester</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              variant="contained"
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={20} /> : <EditIcon />}
            >
              Update User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for messages */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={handleCloseSuccess}
        >
          <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default AdminPortalPage; 