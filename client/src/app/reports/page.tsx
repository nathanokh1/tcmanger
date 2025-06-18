'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as ReportIcon,
  GetApp as ExportIcon,
  FilterList as FilterIcon,
  Schedule as TimeIcon,
  BugReport as DefectIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Warning as BlockedIcon,
} from '@mui/icons-material';

interface ReportData {
  overview: {
    totalProjects: number;
    totalTestCases: number;
    totalTestRuns: number;
    automationCoverage: number;
    passRate: number;
    defectRate: number;
  };
  trends: {
    testExecution: Array<{ month: string; executed: number; passed: number; failed: number }>;
    automation: Array<{ month: string; automated: number; manual: number }>;
    defects: Array<{ month: string; found: number; fixed: number }>;
  };
  projectMetrics: Array<{
    projectName: string;
    testCases: number;
    automationRate: number;
    passRate: number;
    lastRun: string;
    status: 'healthy' | 'warning' | 'critical';
  }>;
  topDefects: Array<{
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in-progress' | 'resolved';
    foundDate: string;
    project: string;
  }>;
}

const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('last-3-months');
  const [selectedProject, setSelectedProject] = useState('all');

  // Mock data for development
  const mockReportData: ReportData = {
    overview: {
      totalProjects: 8,
      totalTestCases: 1247,
      totalTestRuns: 156,
      automationCoverage: 68,
      passRate: 89,
      defectRate: 2.3
    },
    trends: {
      testExecution: [
        { month: 'Oct', executed: 890, passed: 801, failed: 89 },
        { month: 'Nov', executed: 1120, passed: 998, failed: 122 },
        { month: 'Dec', executed: 1340, passed: 1205, failed: 135 },
        { month: 'Jan', executed: 1247, passed: 1108, failed: 139 }
      ],
      automation: [
        { month: 'Oct', automated: 520, manual: 370 },
        { month: 'Nov', automated: 680, manual: 440 },
        { month: 'Dec', automated: 850, manual: 490 },
        { month: 'Jan', automated: 852, manual: 395 }
      ],
      defects: [
        { month: 'Oct', found: 23, fixed: 19 },
        { month: 'Nov', found: 31, fixed: 28 },
        { month: 'Dec', found: 28, fixed: 25 },
        { month: 'Jan', found: 19, fixed: 22 }
      ]
    },
    projectMetrics: [
      {
        projectName: 'E-Commerce Platform',
        testCases: 456,
        automationRate: 78,
        passRate: 92,
        lastRun: '2024-01-15',
        status: 'healthy'
      },
      {
        projectName: 'Mobile Banking App',
        testCases: 298,
        automationRate: 85,
        passRate: 87,
        lastRun: '2024-01-14',
        status: 'healthy'
      },
      {
        projectName: 'API Gateway Service',
        testCases: 124,
        automationRate: 95,
        passRate: 96,
        lastRun: '2024-01-13',
        status: 'healthy'
      },
      {
        projectName: 'Legacy CRM System',
        testCases: 369,
        automationRate: 34,
        passRate: 76,
        lastRun: '2024-01-10',
        status: 'warning'
      }
    ],
    topDefects: [
      {
        id: 'DEF-001',
        title: 'Payment gateway timeout on high load',
        severity: 'critical',
        status: 'in-progress',
        foundDate: '2024-01-12',
        project: 'E-Commerce Platform'
      },
      {
        id: 'DEF-002',
        title: 'Mobile app crashes on iOS 17',
        severity: 'high',
        status: 'open',
        foundDate: '2024-01-11',
        project: 'Mobile Banking App'
      },
      {
        id: 'DEF-003',
        title: 'Search functionality returns empty results',
        severity: 'medium',
        status: 'resolved',
        foundDate: '2024-01-09',
        project: 'E-Commerce Platform'
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReportData(mockReportData);
      setLoading(false);
    }, 1000);
  }, [selectedPeriod, selectedProject]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'critical': return '#f44336';
      default: return '#757575';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#1976d2';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  if (loading || !reportData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>Loading reports...</Typography>
      </Box>
    );
  }

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
          Reports & Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="Time Period"
            >
              <MenuItem value="last-week">Last Week</MenuItem>
              <MenuItem value="last-month">Last Month</MenuItem>
              <MenuItem value="last-3-months">Last 3 Months</MenuItem>
              <MenuItem value="last-6-months">Last 6 Months</MenuItem>
              <MenuItem value="last-year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              label="Project"
            >
              <MenuItem value="all">All Projects</MenuItem>
              <MenuItem value="ecom">E-Commerce Platform</MenuItem>
              <MenuItem value="bank">Mobile Banking App</MenuItem>
              <MenuItem value="api">API Gateway Service</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            sx={{ borderRadius: 2 }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                {reportData.overview.totalProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #2196f320 0%, #64b5f620 100%)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                {reportData.overview.totalTestCases.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Test Cases
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #ff980020 0%, #ffc04720 100%)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {reportData.overview.totalTestRuns}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Test Runs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #9c27b020 0%, #ba68c820 100%)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                {reportData.overview.automationCoverage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #4caf5020 0%, #81c78420 100%)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {reportData.overview.passRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pass Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #f4433620 0%, #ff867120 100%)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                {reportData.overview.defectRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Defect Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Trends */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Test Execution Trends
            </Typography>
            <Box sx={{ mt: 3 }}>
              {reportData.trends.testExecution.map((data, index) => (
                <Box key={data.month} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{data.month}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {Math.round((data.passed / data.executed) * 100)}% Pass Rate
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(data.passed / data.executed) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#f5f5f5',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: data.passed / data.executed > 0.9 
                          ? 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                          : data.passed / data.executed > 0.8
                          ? 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)'
                          : 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)'
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Passed: {data.passed}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Failed: {data.failed}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Automation Progress
            </Typography>
            <Box sx={{ mt: 3 }}>
              {reportData.trends.automation.map((data, index) => (
                <Box key={data.month} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{data.month}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {Math.round((data.automated / (data.automated + data.manual)) * 100)}% Automated
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(data.automated / (data.automated + data.manual)) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#f5f5f5',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Automated: {data.automated}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Manual: {data.manual}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Project Metrics and Top Defects */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Project Health Overview
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                    <TableCell>Project</TableCell>
                    <TableCell>Test Cases</TableCell>
                    <TableCell>Automation</TableCell>
                    <TableCell>Pass Rate</TableCell>
                    <TableCell>Last Run</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.projectMetrics.map((project) => (
                    <TableRow key={project.projectName} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                          {project.projectName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {project.testCases}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ minWidth: 100 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption">
                              {project.automationRate}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={project.automationRate}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: '#f5f5f5',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ minWidth: 100 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption">
                              {project.passRate}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={project.passRate}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: '#f5f5f5',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: project.passRate > 90 
                                  ? 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                                  : project.passRate > 80
                                  ? 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)'
                                  : 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)'
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(project.lastRun).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(project.status) + '20',
                            color: getStatusColor(project.status),
                            fontWeight: 'bold',
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Top Defects
            </Typography>
            <Box>
              {reportData.topDefects.map((defect) => (
                <Box 
                  key={defect.id} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {defect.id}
                    </Typography>
                    <Chip
                      label={defect.severity}
                      size="small"
                      sx={{
                        backgroundColor: getSeverityColor(defect.severity) + '20',
                        color: getSeverityColor(defect.severity),
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        height: '20px'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {defect.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {defect.project}
                    </Typography>
                    <Chip
                      label={defect.status}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage; 