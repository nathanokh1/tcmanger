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
} from '@mui/icons-material';

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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          Test Runs
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            sx={{ borderRadius: 2 }}
          >
            Export Results
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            New Test Run
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #2196f320 0%, #64b5f620 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                {testRuns.filter(run => run.status === 'running').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Running
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #4caf5020 0%, #81c78420 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {testRuns.filter(run => run.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #75757520 0%, #9e9e9e20 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#757575' }}>
                {testRuns.filter(run => run.status === 'scheduled').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #f4433620 0%, #ff867120 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                {testRuns.filter(run => run.status === 'failed' || run.status === 'aborted').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed/Aborted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Runs Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                <TableCell>Test Run</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Results</TableCell>
                <TableCell>Executor</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Environment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {testRuns.map((run) => (
                <TableRow 
                  key={run._id} 
                  hover
                  sx={{ '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' } }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                        {run.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {run.projectId.name} ({run.projectId.key})
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {run.tags.slice(0, 2).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: '20px' }}
                          />
                        ))}
                        {run.tags.length > 2 && (
                          <Chip
                            label={`+${run.tags.length - 2}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: '20px' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(run.status)}
                      <Chip
                        label={run.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(run.status) + '20',
                          color: getStatusColor(run.status),
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 100 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption">
                          {run.progress}%
                        </Typography>
                        <Typography variant="caption">
                          {run.totalTests - run.pendingTests}/{run.totalTests}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={run.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#f5f5f5',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${getStatusColor(run.status)} 0%, ${getStatusColor(run.status)}80 100%)`
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PassIcon sx={{ fontSize: '1rem', color: '#4caf50' }} />
                          <Typography variant="caption">{run.passedTests}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FailIcon sx={{ fontSize: '1rem', color: '#f44336' }} />
                          <Typography variant="caption">{run.failedTests}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BlockedIcon sx={{ fontSize: '1rem', color: '#ff9800' }} />
                          <Typography variant="caption">{run.blockedTests}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PendingIcon sx={{ fontSize: '1rem', color: '#757575' }} />
                          <Typography variant="caption">{run.pendingTests}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Pass Rate: {calculatePassRate(run)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {run.executedBy.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" display="block">
                          {run.executedBy.name}
                        </Typography>
                        <Chip
                          label={run.automationType}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: '16px', textTransform: 'capitalize' }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="caption" display="block">
                        {run.actualDuration ? formatDuration(run.actualDuration) : formatDuration(run.estimatedDuration)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {run.status === 'running' ? 'Running' : 
                         run.status === 'scheduled' ? 'Estimated' : 'Actual'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={run.environment}
                      size="small"
                      sx={{
                        backgroundColor: '#667eea20',
                        color: '#667eea',
                        textTransform: 'capitalize'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          sx={{ color: '#667eea' }}
                          onClick={() => {
                            setSelectedRun(run);
                            setExecutionDialogOpen(true);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {run.status === 'scheduled' && (
                        <Tooltip title="Start Run">
                          <IconButton 
                            size="small" 
                            sx={{ color: '#4caf50' }}
                            onClick={() => handleStartRun(run._id)}
                          >
                            <PlayIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {run.status === 'running' && (
                        <Tooltip title="Stop Run">
                          <IconButton 
                            size="small" 
                            sx={{ color: '#f44336' }}
                            onClick={() => handleStopRun(run._id)}
                          >
                            <StopIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Settings">
                        <IconButton size="small" sx={{ color: '#757575' }}>
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
    </Box>
  );
};

export default TestRunsPage; 