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
  LinearProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as ProvisionIcon,
  Stop as SuspendIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  Payment as BillingIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Monitor as MonitorIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as ActiveIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Customer {
  _id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  domain: string; // e.g., "acme.tcmanager.com"
  plan: 'solo' | 'business' | 'enterprise';
  status: 'active' | 'suspended' | 'pending' | 'trial';
  users: {
    current: number;
    limit: number;
  };
  billing: {
    monthlyRevenue: number;
    lastPayment: Date;
    nextPayment: Date;
    paymentStatus: 'current' | 'overdue' | 'failed';
  };
  usage: {
    testCases: number;
    apiCalls: number;
    storage: number; // in MB
  };
  createdAt: Date;
  lastActive: Date;
  health: {
    uptime: number;
    responseTime: number;
    errorRate: number;
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

const MasterAdminPortalPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [provisionDialogOpen, setProvisionDialogOpen] = useState(false);

  // New customer form state
  const [newCustomerForm, setNewCustomerForm] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    domain: '',
    plan: 'business' as Customer['plan'],
    trialDays: 14,
  });

  // Mock data for demonstration - TODO: Replace with real API calls
  const mockCustomers: Customer[] = [
    {
      _id: '1',
      companyName: 'ACME Corporation',
      contactName: 'John Smith',
      contactEmail: 'john.smith@acme.com',
      domain: 'acme.tcmanager.com',
      plan: 'enterprise',
      status: 'active',
      users: { current: 45, limit: 100 },
      billing: {
        monthlyRevenue: 899,
        lastPayment: new Date('2024-01-01'),
        nextPayment: new Date('2024-02-01'),
        paymentStatus: 'current'
      },
      usage: {
        testCases: 2847,
        apiCalls: 15420,
        storage: 1250
      },
      createdAt: new Date('2023-06-15'),
      lastActive: new Date('2024-01-20'),
      health: {
        uptime: 99.9,
        responseTime: 120,
        errorRate: 0.1
      }
    },
    {
      _id: '2',
      companyName: 'TechStart Inc',
      contactName: 'Sarah Johnson',
      contactEmail: 'sarah@techstart.com',
      domain: 'techstart.tcmanager.com',
      plan: 'business',
      status: 'active',
      users: { current: 12, limit: 50 },
      billing: {
        monthlyRevenue: 199,
        lastPayment: new Date('2024-01-15'),
        nextPayment: new Date('2024-02-15'),
        paymentStatus: 'current'
      },
      usage: {
        testCases: 456,
        apiCalls: 3200,
        storage: 180
      },
      createdAt: new Date('2023-11-20'),
      lastActive: new Date('2024-01-19'),
      health: {
        uptime: 99.5,
        responseTime: 95,
        errorRate: 0.05
      }
    },
    {
      _id: '3',
      companyName: 'Beta Testing Co',
      contactName: 'Mike Wilson',
      contactEmail: 'mike@betatesting.com',
      domain: 'beta.tcmanager.com',
      plan: 'business',
      status: 'trial',
      users: { current: 5, limit: 50 },
      billing: {
        monthlyRevenue: 0,
        lastPayment: new Date('2024-01-10'),
        nextPayment: new Date('2024-01-24'),
        paymentStatus: 'current'
      },
      usage: {
        testCases: 89,
        apiCalls: 450,
        storage: 25
      },
      createdAt: new Date('2024-01-10'),
      lastActive: new Date('2024-01-20'),
      health: {
        uptime: 100,
        responseTime: 85,
        errorRate: 0
      }
    },
    {
      _id: '4',
      companyName: 'Global Solutions',
      contactName: 'Lisa Chen',
      contactEmail: 'lisa@globalsolutions.com',
      domain: 'global.tcmanager.com',
      plan: 'enterprise',
      status: 'suspended',
      users: { current: 78, limit: 200 },
      billing: {
        monthlyRevenue: 1299,
        lastPayment: new Date('2023-12-01'),
        nextPayment: new Date('2024-01-01'),
        paymentStatus: 'overdue'
      },
      usage: {
        testCases: 5640,
        apiCalls: 28900,
        storage: 3400
      },
      createdAt: new Date('2023-03-10'),
      lastActive: new Date('2024-01-15'),
      health: {
        uptime: 0,
        responseTime: 0,
        errorRate: 0
      }
    }
  ];

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleProvisionInstance = async () => {
    // TODO: Implement actual API call to provision new instance
    console.log('Provisioning new instance:', newCustomerForm);
    
    // Generate domain from company name
    const domain = newCustomerForm.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20) + '.tcmanager.com';

    // Simulate provisioning
    const newCustomer: Customer = {
      _id: Date.now().toString(),
      ...newCustomerForm,
      domain,
      status: 'pending',
      users: { current: 0, limit: newCustomerForm.plan === 'enterprise' ? 200 : newCustomerForm.plan === 'business' ? 50 : 10 },
      billing: {
        monthlyRevenue: newCustomerForm.plan === 'enterprise' ? 899 : newCustomerForm.plan === 'business' ? 199 : 49,
        lastPayment: new Date(),
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentStatus: 'current'
      },
      usage: {
        testCases: 0,
        apiCalls: 0,
        storage: 0
      },
      createdAt: new Date(),
      lastActive: new Date(),
      health: {
        uptime: 100,
        responseTime: 0,
        errorRate: 0
      }
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    setProvisionDialogOpen(false);
    setNewCustomerForm({
      companyName: '',
      contactName: '',
      contactEmail: '',
      domain: '',
      plan: 'business',
      trialDays: 14,
    });
  };

  const handleSuspendCustomer = (customerId: string) => {
    if (window.confirm('Are you sure you want to suspend this customer? Their instance will be inaccessible.')) {
      setCustomers(prev => 
        prev.map(customer => 
          customer._id === customerId 
            ? { ...customer, status: 'suspended' as const }
            : customer
        )
      );
    }
  };

  const handleReactivateCustomer = (customerId: string) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer._id === customerId 
          ? { ...customer, status: 'active' as const }
          : customer
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'trial': return '#2196f3';
      case 'suspended': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <ActiveIcon sx={{ color: '#4caf50' }} />;
      case 'trial': return <PendingIcon sx={{ color: '#2196f3' }} />;
      case 'suspended': return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'pending': return <PendingIcon sx={{ color: '#ff9800' }} />;
      default: return <ErrorIcon sx={{ color: '#757575' }} />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return '#9c27b0';
      case 'business': return '#2196f3';
      case 'solo': return '#4caf50';
      default: return '#757575';
    }
  };

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    trialCustomers: customers.filter(c => c.status === 'trial').length,
    totalRevenue: customers
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + c.billing.monthlyRevenue, 0),
    avgUptime: customers
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + c.health.uptime, 0) / customers.filter(c => c.status === 'active').length || 0,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            TCManager Master Administration
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage customer licenses, instances, and billing across all tenants
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudIcon />}
          onClick={() => setProvisionDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none'
          }}
        >
          Provision New Instance
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.totalCustomers}
                  </Typography>
                  <Typography color="text.secondary">Total Customers</Typography>
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
                  <ActiveIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.activeCustomers}
                  </Typography>
                  <Typography color="text.secondary">Active Instances</Typography>
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
                  <BillingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    ${stats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">Monthly Revenue</Typography>
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
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.avgUptime.toFixed(1)}%
                  </Typography>
                  <Typography color="text.secondary">Avg Uptime</Typography>
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
            <Tab label="Customer Management" icon={<BusinessIcon />} iconPosition="start" />
            <Tab label="Instance Monitoring" icon={<MonitorIcon />} iconPosition="start" />
            <Tab label="Billing & Revenue" icon={<BillingIcon />} iconPosition="start" />
            <Tab label="Platform Analytics" icon={<AnalyticsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Customer Management Tab */}
        <CustomTabPanel value={currentTab} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Customer Management</Typography>
            <Box>
              <Button variant="outlined" sx={{ mr: 1 }}>
                Export Customers
              </Button>
              <Button variant="outlined">
                Bulk Actions
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                  <TableCell>Customer</TableCell>
                  <TableCell>Domain</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell>Health</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: getPlanColor(customer.plan) }}>
                          {customer.companyName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {customer.companyName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.contactName} • {customer.contactEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary">
                        {customer.domain}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={customer.plan.toUpperCase()} 
                        size="small" 
                        sx={{ 
                          bgcolor: getPlanColor(customer.plan),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(customer.status)}
                        <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                          {customer.status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {customer.users.current} / {customer.users.limit}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(customer.users.current / customer.users.limit) * 100}
                          sx={{ mt: 0.5, width: 60 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ${customer.billing.monthlyRevenue}/mo
                      </Typography>
                      <Typography variant="caption" color={
                        customer.billing.paymentStatus === 'current' ? 'success.main' :
                        customer.billing.paymentStatus === 'overdue' ? 'error.main' : 'warning.main'
                      }>
                        {customer.billing.paymentStatus}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {customer.health.uptime.toFixed(1)}% uptime
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {customer.health.responseTime}ms avg
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Instance">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Customer">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {customer.status === 'active' ? (
                        <Tooltip title="Suspend Instance">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleSuspendCustomer(customer._id)}
                          >
                            <SuspendIcon />
                          </IconButton>
                        </Tooltip>
                      ) : customer.status === 'suspended' ? (
                        <Tooltip title="Reactivate Instance">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleReactivateCustomer(customer._id)}
                          >
                            <ProvisionIcon />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>

        {/* Instance Monitoring Tab */}
        <CustomTabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>Real-time Instance Monitoring</Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Monitor the health and performance of all customer instances in real-time.
          </Alert>
          
          <Grid container spacing={3}>
            {customers.filter(c => c.status === 'active').map((customer) => (
              <Grid item xs={12} md={6} lg={4} key={customer._id}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{customer.companyName}</Typography>
                      <Chip 
                        label={customer.health.uptime >= 99 ? 'Healthy' : 'Warning'} 
                        color={customer.health.uptime >= 99 ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Uptime</Typography>
                      <Typography variant="h6">{customer.health.uptime}%</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={customer.health.uptime} 
                        color={customer.health.uptime >= 99 ? 'success' : 'warning'}
                      />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Response Time</Typography>
                        <Typography variant="body1">{customer.health.responseTime}ms</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Error Rate</Typography>
                        <Typography variant="body1">{customer.health.errorRate}%</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CustomTabPanel>

        {/* Billing Tab */}
        <CustomTabPanel value={currentTab} index={2}>
          <Typography variant="h6" gutterBottom>Billing & Revenue Management</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  ${stats.totalRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2">Monthly Recurring Revenue</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  ${(stats.totalRevenue * 12).toLocaleString()}
                </Typography>
                <Typography variant="body2">Annual Run Rate</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {customers.filter(c => c.billing.paymentStatus === 'overdue').length}
                </Typography>
                <Typography variant="body2">Overdue Accounts</Typography>
              </Card>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* Analytics Tab */}
        <CustomTabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>Platform Analytics</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Customer Growth
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track customer acquisition and retention metrics across all plans.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Usage Trends
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor test case creation, API usage, and feature adoption.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </CustomTabPanel>
      </Paper>

      {/* Provision New Instance Dialog */}
      <Dialog open={provisionDialogOpen} onClose={() => setProvisionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Provision New TCManager Instance</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Create a new isolated TCManager instance for a customer. This will set up their subdomain, database, and initial admin account.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={newCustomerForm.companyName}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, companyName: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  value={newCustomerForm.contactName}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, contactName: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  value={newCustomerForm.contactEmail}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Plan</InputLabel>
                  <Select
                    value={newCustomerForm.plan}
                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, plan: e.target.value as Customer['plan'] }))}
                  >
                    <MenuItem value="solo">Solo - $49/month (up to 10 users)</MenuItem>
                    <MenuItem value="business">Business - $199/month (up to 50 users)</MenuItem>
                    <MenuItem value="enterprise">Enterprise - $899/month (up to 200 users)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trial Days"
                  type="number"
                  value={newCustomerForm.trialDays}
                  onChange={(e) => setNewCustomerForm(prev => ({ ...prev, trialDays: parseInt(e.target.value) }))}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Generated Domain:
            </Typography>
            <Typography variant="body2" color="primary">
              {newCustomerForm.companyName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .substring(0, 20) || 'company'}.tcmanager.com
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setProvisionDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleProvisionInstance}
            startIcon={<CloudIcon />}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Provision Instance
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default MasterAdminPortalPage; 