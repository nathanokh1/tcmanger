'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Warning as BlockedIcon,
  Pending as PendingIcon,
  Assignment as TestCaseIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface TestRun {
  _id: string;
  name: string;
  description: string;
  projectId: {
    name: string;
    key: string;
  };
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'aborted';
  progress: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  blockedTests: number;
  pendingTests: number;
  executedBy: {
    name: string;
    email: string;
  };
  startTime: string;
  endTime?: string;
  estimatedDuration: number;
  actualDuration?: number;
  environment: string;
  tags: string[];
  automationType: 'manual' | 'automated' | 'hybrid';
}

const TestRunsPage: React.FC = () => {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);

  // Mock data for development
  const mockTestRuns: TestRun[] = [
    {
      _id: '1',
      name: 'Smoke Test Suite - Production Deploy',
      description: 'Critical path smoke tests before production deployment',
      projectId: { name: 'E-Commerce Platform', key: 'ECOM' },
      status: 'running',
      progress: 65,
      totalTests: 45,
      passedTests: 28,
      failedTests: 1,
      blockedTests: 0,
      pendingTests: 16,
      executedBy: { name: 'John Doe', email: 'john@example.com' },
      startTime: '2024-01-15T10:30:00Z',
      estimatedDuration: 120,
      actualDuration: 78,
      environment: 'staging',
      tags: ['smoke', 'critical', 'deployment'],
      automationType: 'automated'
    },
    {
      _id: '2',
      name: 'Full Regression Suite',
      description: 'Complete regression testing for quarterly release',
      projectId: { name: 'Mobile Banking App', key: 'BANK' },
      status: 'completed',
      progress: 100,
      totalTests: 298,
      passedTests: 285,
      failedTests: 8,
      blockedTests: 2,
      pendingTests: 3,
      executedBy: { name: 'Sarah Wilson', email: 'sarah@example.com' },
      startTime: '2024-01-14T09:00:00Z',
      endTime: '2024-01-14T15:30:00Z',
      estimatedDuration: 480,
      actualDuration: 390,
      environment: 'production',
      tags: ['regression', 'quarterly', 'mobile'],
      automationType: 'hybrid'
    },
    {
      _id: '3',
      name: 'API Integration Tests',
      description: 'End-to-end API testing with third-party integrations',
      projectId: { name: 'API Gateway Service', key: 'API' },
      status: 'scheduled',
      progress: 0,
      totalTests: 124,
      passedTests: 0,
      failedTests: 0,
      blockedTests: 0,
      pendingTests: 124,
      executedBy: { name: 'Alex Chen', email: 'alex@example.com' },
      startTime: '2024-01-16T14:00:00Z',
      estimatedDuration: 180,
      environment: 'staging',
      tags: ['api', 'integration', 'third-party'],
      automationType: 'automated'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTestRuns(mockTestRuns);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CircularProgress size={20} sx={{ color: '#2196f3' }} />;
      case 'completed': return <PassIcon sx={{ color: '#4caf50' }} />;
      case 'failed': return <FailIcon sx={{ color: '#f44336' }} />;
      case 'aborted': return <BlockedIcon sx={{ color: '#ff9800' }} />;
      default: return <ScheduleIcon sx={{ color: '#757575' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'failed': return '#f44336';
      case 'aborted': return '#ff9800';
      default: return '#757575';
    }
  };

  const calculatePassRate = (run: TestRun) => {
    const executedTests = run.passedTests + run.failedTests + run.blockedTests;
    return executedTests > 0 ? Math.round((run.passedTests / executedTests) * 100) : 0;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleStartRun = (runId: string) => {
    setTestRuns(prev => prev.map(run => 
      run._id === runId 
        ? { ...run, status: 'running' as const, startTime: new Date().toISOString() }
        : run
    ));
  };

  const handleStopRun = (runId: string) => {
    setTestRuns(prev => prev.map(run => 
      run._id === runId 
        ? { ...run, status: 'aborted' as const, endTime: new Date().toISOString() }
        : run
    ));
  };

  const overallStats = {
    totalRuns: mockTestRuns.length,
    running: mockTestRuns.filter(tr => tr.status === 'running').length,
    completed: mockTestRuns.filter(tr => tr.status === 'completed').length,
    failed: mockTestRuns.filter(tr => tr.status === 'failed').length
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Test Runs
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
          Create Test Run
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {overallStats.totalRuns}
              </Typography>
              <Typography color="text.secondary">Total Runs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {overallStats.running}
              </Typography>
              <Typography color="text.secondary">Running</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {overallStats.completed}
              </Typography>
              <Typography color="text.secondary">Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {overallStats.failed}
              </Typography>
              <Typography color="text.secondary">Failed</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Runs List */}
      <Paper sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Test Runs
          </Typography>
          
          <Grid container spacing={2}>
            {mockTestRuns.map((testRun) => (
              <Grid item xs={12} key={testRun._id}>
                <Card 
                  sx={{ 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderColor: 'primary.main'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {/* Test Run Info */}
                      <Grid item xs={12} md={3}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {testRun._id}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {testRun.name}
                          </Typography>
                          <Chip
                            label={testRun.environment}
                            size="small"
                            variant="outlined"
                            color="default"
                          />
                        </Box>
                      </Grid>

                      {/* Status and Progress */}
                      <Grid item xs={12} md={3}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {getStatusIcon(testRun.status)}
                            <Chip
                              label={testRun.status}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(testRun.status) + '20',
                                color: getStatusColor(testRun.status),
                                fontWeight: 'bold',
                                textTransform: 'capitalize'
                              }}
                            />
                          </Box>
                          {testRun.status === 'running' && (
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption">Progress</Typography>
                                <Typography variant="caption">{testRun.progress}%</Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={testRun.progress}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Grid>

                      {/* Test Results */}
                      <Grid item xs={12} md={3}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            Results ({testRun.totalTests} tests)
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {testRun.passedTests > 0 && (
                              <Chip
                                icon={<PassIcon />}
                                label={testRun.passedTests}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            )}
                            {testRun.failedTests > 0 && (
                              <Chip
                                icon={<FailIcon />}
                                label={testRun.failedTests}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            )}
                            {testRun.blockedTests > 0 && (
                              <Chip
                                icon={<BlockedIcon />}
                                label={testRun.blockedTests}
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                            {testRun.pendingTests > 0 && (
                              <Chip
                                icon={<PendingIcon />}
                                label={testRun.pendingTests}
                                size="small"
                                color="default"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      </Grid>

                      {/* Executor and Time */}
                      <Grid item xs={12} md={3}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {testRun.executedBy.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Typography variant="body2" fontWeight="bold">
                              {testRun.executedBy.name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Started: {testRun.startTime ? new Date(testRun.startTime).toLocaleString() : 'Not started'}
                          </Typography>
                          {testRun.endTime && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Ended: {new Date(testRun.endTime).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* Create Test Run Dialog */}
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
          Create New Test Run
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Test Run Name"
                placeholder="Enter a descriptive name for the test run"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                placeholder="Describe the purpose of this test run"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Project</InputLabel>
                <Select label="Project">
                  <MenuItem value="ecom">E-Commerce Platform</MenuItem>
                  <MenuItem value="bank">Mobile Banking App</MenuItem>
                  <MenuItem value="api">API Gateway Service</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Environment</InputLabel>
                <Select label="Environment">
                  <MenuItem value="development">Development</MenuItem>
                  <MenuItem value="staging">Staging</MenuItem>
                  <MenuItem value="production">Production</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Execution Type</InputLabel>
                <Select label="Execution Type" defaultValue="automated">
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="automated">Automated</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Estimated Duration (minutes)"
                type="number"
                defaultValue={60}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                placeholder="Enter tags separated by commas"
                helperText="Tags help organize and categorize test runs"
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
            Create & Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Execution Details Dialog */}
      <Dialog
        open={executionDialogOpen}
        onClose={() => setExecutionDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          Test Run Details - {selectedRun?.name}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRun && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>Execution Progress</Typography>
                <LinearProgress
                  variant="determinate"
                  value={selectedRun.progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    mb: 2,
                    backgroundColor: '#f5f5f5',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedRun.totalTests - selectedRun.pendingTests} of {selectedRun.totalTests} tests executed
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Summary</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          {selectedRun.passedTests}
                        </Typography>
                        <Typography variant="caption">Passed</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                          {selectedRun.failedTests}
                        </Typography>
                        <Typography variant="caption">Failed</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setExecutionDialogOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained"
            startIcon={<ExportIcon />}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Export Report
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default TestRunsPage; 