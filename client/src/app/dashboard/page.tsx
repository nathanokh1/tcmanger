'use client';

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Warning as BlockedIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

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

  return (
    <DashboardLayout>
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
              <Typography color="text.secondary">
                Failed tests
              </Typography>
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
              <Typography color="text.secondary">
                Blocked tests
              </Typography>
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
              <Typography color="text.secondary">
                Pending tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                {mockData.recentActivity.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      pb: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none', mb: 0, pb: 0 }
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: '0.875rem' }}>
                      {activity.user.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">
                        <strong>{activity.user}</strong> {activity.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* My Test Cases */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                My Test Cases
              </Typography>
              <Box sx={{ mt: 2 }}>
                {mockData.myTestCases.map((testCase) => (
                  <Box
                    key={testCase.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'grey.50' },
                      '&:last-child': { mb: 0 }
                    }}
                    onClick={() => router.push(`/test-cases/${testCase.id}`)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {testCase.id}
                      </Typography>
                      <Chip
                        label={testCase.priority}
                        size="small"
                        color={testCase.priority === 'High' ? 'error' : 'default'}
                      />
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      {testCase.title}
                    </Typography>
                    <Chip
                      label={testCase.status}
                      size="small"
                      variant="outlined"
                      color={testCase.status === 'Active' ? 'success' : 'default'}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Projects Overview */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Projects Overview
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {mockData.projects.map((project) => (
                  <Grid item xs={12} sm={6} md={4} key={project.key}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'grey.50' }
                      }}
                      onClick={() => router.push('/projects')}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {project.key} • {project.tests} tests
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Automation</Typography>
                          <Typography variant="body2">{project.automation}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={project.automation} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
} 