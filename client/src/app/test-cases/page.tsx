'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Toolbar,
  Tooltip,
  Badge,
  LinearProgress,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as RunIcon,
  Assignment as AssignmentIcon,
  BugReport as BugIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Schedule as PendingIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface TestCase {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'functional' | 'integration' | 'unit' | 'e2e' | 'performance';
  status: 'draft' | 'active' | 'deprecated';
  lastRun?: {
    status: 'passed' | 'failed' | 'blocked' | 'not_run';
    executedAt: string;
    executedBy: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  tags: string[];
  complexity: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  projectId: {
    name: string;
  };
  moduleId: {
    name: string;
  };
  featureId: {
    name: string;
  };
  createdBy: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const TestCasesPage: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priority: '',
    type: '',
    status: '',
    assignedTo: '',
    project: '',
  });
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);

  // Mock data for development
  const mockTestCases: TestCase[] = [
    {
      _id: '1',
      title: 'User Login Functionality',
      description: 'Test user authentication with valid credentials',
      priority: 'high',
      type: 'functional',
      status: 'active',
      lastRun: {
        status: 'passed',
        executedAt: '2024-01-15T10:30:00Z',
        executedBy: 'John Doe'
      },
      assignedTo: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      tags: ['authentication', 'security', 'critical-path'],
      complexity: 'medium',
      estimatedDuration: 15,
      projectId: { name: 'E-Commerce Platform' },
      moduleId: { name: 'Authentication' },
      featureId: { name: 'User Login' },
      createdBy: { name: 'Admin User' },
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      _id: '2',
      title: 'Shopping Cart Add Item',
      description: 'Verify items can be added to shopping cart',
      priority: 'medium',
      type: 'functional',
      status: 'active',
      lastRun: {
        status: 'failed',
        executedAt: '2024-01-14T14:20:00Z',
        executedBy: 'Test Bot'
      },
      tags: ['cart', 'e-commerce'],
      complexity: 'low',
      estimatedDuration: 10,
      projectId: { name: 'E-Commerce Platform' },
      moduleId: { name: 'Shopping Cart' },
      featureId: { name: 'Add to Cart' },
      createdBy: { name: 'QA Lead' },
      createdAt: '2024-01-12T11:00:00Z',
      updatedAt: '2024-01-14T14:20:00Z'
    },
    {
      _id: '3',
      title: 'Payment Gateway Integration',
      description: 'End-to-end payment processing test',
      priority: 'critical',
      type: 'integration',
      status: 'active',
      lastRun: {
        status: 'blocked',
        executedAt: '2024-01-13T16:45:00Z',
        executedBy: 'Payment Team'
      },
      assignedTo: {
        name: 'Mike Johnson',
        email: 'mike@example.com'
      },
      tags: ['payment', 'integration', 'critical'],
      complexity: 'high',
      estimatedDuration: 30,
      projectId: { name: 'E-Commerce Platform' },
      moduleId: { name: 'Payment' },
      featureId: { name: 'Payment Processing' },
      createdBy: { name: 'Product Manager' },
      createdAt: '2024-01-08T13:30:00Z',
      updatedAt: '2024-01-13T16:45:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTestCases(mockTestCases);
      setTotalCount(mockTestCases.length);
      setLoading(false);
    }, 1000);
  }, [page, rowsPerPage, searchTerm, filters]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#1976d2';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <PassIcon sx={{ color: '#4caf50' }} />;
      case 'failed': return <FailIcon sx={{ color: '#f44336' }} />;
      case 'blocked': return <BugIcon sx={{ color: '#ff9800' }} />;
      default: return <PendingIcon sx={{ color: '#757575' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return '#4caf50';
      case 'failed': return '#f44336';
      case 'blocked': return '#ff9800';
      default: return '#757575';
    }
  };

  const stats = {
    total: mockTestCases.length,
    active: mockTestCases.filter(tc => tc.status === 'active').length,
    automated: mockTestCases.filter(tc => tc.type === 'e2e').length,
    passed: mockTestCases.filter(tc => tc.lastRun?.status === 'passed').length
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Test Cases
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none'
          }}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Test Case
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.total}
              </Typography>
              <Typography color="text.secondary">Total Test Cases</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.active}
              </Typography>
              <Typography color="text.secondary">Active</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.automated}
              </Typography>
              <Typography color="text.secondary">Automated</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {Math.round((stats.passed / stats.total) * 100)}%
              </Typography>
              <Typography color="text.secondary">Pass Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search test cases..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="Priority"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="functional">Functional</MenuItem>
                <MenuItem value="integration">Integration</MenuItem>
                <MenuItem value="unit">Unit</MenuItem>
                <MenuItem value="e2e">E2E</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="deprecated">Deprecated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              fullWidth
              sx={{ height: '56px', borderRadius: 2 }}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Test Cases Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                <TableCell>Test Case</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Project/Module</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {testCases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((testCase) => (
                <TableRow 
                  key={testCase._id} 
                  hover
                  sx={{ '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' } }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                        {testCase.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testCase.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={testCase.priority}
                      size="small"
                      sx={{
                        backgroundColor: getPriorityColor(testCase.priority) + '20',
                        color: getPriorityColor(testCase.priority),
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {testCase.type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {testCase.lastRun ? (
                        <>
                          {getStatusIcon(testCase.lastRun.status)}
                          <Box>
                            <Typography variant="caption" display="block">
                              {new Date(testCase.lastRun.executedAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              by {testCase.lastRun.executedBy}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Never run
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {testCase.assignedTo ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {testCase.assignedTo.name.charAt(0)}
                        </Avatar>
                        <Typography variant="caption">
                          {testCase.assignedTo.name}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="caption" display="block" sx={{ fontWeight: 'medium' }}>
                        {testCase.projectId.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testCase.moduleId.name} → {testCase.featureId.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {testCase.tags.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      ))}
                      {testCase.tags.length > 2 && (
                        <Chip
                          label={`+${testCase.tags.length - 2}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" sx={{ color: '#667eea' }}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Run Test">
                        <IconButton size="small" sx={{ color: '#4caf50' }}>
                          <RunIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" sx={{ color: '#ff9800' }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ color: '#f44336' }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Create Test Case Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          Create New Test Case
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Test Case Title"
                placeholder="Enter a descriptive title for the test case"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                placeholder="Describe what this test case validates"
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select label="Priority">
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select label="Type">
                  <MenuItem value="functional">Functional</MenuItem>
                  <MenuItem value="integration">Integration</MenuItem>
                  <MenuItem value="unit">Unit</MenuItem>
                  <MenuItem value="e2e">End-to-End</MenuItem>
                  <MenuItem value="performance">Performance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                placeholder="Enter tags separated by commas"
                helperText="Tags help organize and search test cases"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Create Test Case
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default TestCasesPage; 