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
  Divider
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
import { DashboardLayout } from '@/components/layout/DashboardLayout';

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
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Reports & Analytics
        </Typography>
        <Button
          variant="contained"
          startIcon={<ReportIcon />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none'
          }}
        >
          Generate Report
        </Button>
      </Box>

      {/* Report Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <CardContent>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Test Execution Trends
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyze test execution patterns over time
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
              >
                View Report
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <CardContent>
              <PassIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Test Coverage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive test coverage analysis
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
              >
                View Report
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <CardContent>
              <TimeIcon sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Performance Metrics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Test execution performance insights
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
              >
                View Report
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <CardContent>
              <ReportIcon sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quality Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall quality metrics and KPIs
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
              >
                View Report
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Reports */}
      <Paper sx={{ borderRadius: 3, p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Recent Reports
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Weekly Test Execution Report
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generated on Jan 16, 2024 • 1,245 tests executed
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small">
                    Download
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Test Coverage Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generated on Jan 15, 2024 • Coverage: 87.5%
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small">
                    Download
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Defect Trend Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generated on Jan 14, 2024 • 23 defects identified
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small">
                    Download
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </DashboardLayout>
  );
};

export default ReportsPage; 