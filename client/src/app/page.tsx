'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  PlayArrow, 
  Assessment, 
  Security, 
  Speed,
  CheckCircle,
  ErrorOutline
} from '@mui/icons-material';
import Link from 'next/link';

interface HealthStatus {
  status: string;
  timestamp: string;
  environment: string;
  uptime: number;
}

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setHealthStatus(data);
        } else {
          setError('API not available');
        }
      } catch (err) {
        setError('Failed to connect to API');
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  const features = [
    {
      icon: <PlayArrow sx={{ fontSize: 40 }} />,
      title: 'Test Execution',
      description: 'Run and track test cases with real-time results and detailed reporting.',
    },
    {
      icon: <Assessment sx={{ fontSize: 40 }} />,
      title: 'Analytics & Reporting',
      description: 'Comprehensive dashboards and insights for test coverage and quality metrics.',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Role-Based Access',
      description: 'Secure access control with customizable permissions for different team roles.',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'High Performance',
      description: 'Scalable architecture supporting thousands of test cases with instant search.',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            TCManager
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Advanced Test Case Management Platform
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
            Streamline your QA process with powerful test case authoring, execution tracking, 
            and comprehensive reporting. Built for modern development teams.
          </Typography>
          
          {/* Health Status */}
          <Box sx={{ mb: 4 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Checking system status...</Typography>
              </Box>
            ) : error ? (
              <Alert severity="warning" sx={{ maxWidth: 400, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorOutline />
                  {error}
                </Box>
              </Alert>
            ) : healthStatus ? (
              <Alert severity="success" sx={{ maxWidth: 400, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle />
                  System Online - {healthStatus.environment} environment
                </Box>
              </Alert>
            ) : null}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              component={Link} 
              href="/auth/login"
              sx={{ minWidth: 150 }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              component={Link} 
              href="/dashboard"
              sx={{ minWidth: 150 }}
            >
              Dashboard
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Key Features
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Links */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Quick Links
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
            <Button variant="text" component={Link} href="/projects">
              Projects
            </Button>
            <Button variant="text" component={Link} href="/test-cases">
              Test Cases
            </Button>
            <Button variant="text" component={Link} href="/test-runs">
              Test Runs
            </Button>
            <Button variant="text" component={Link} href="/reports">
              Reports
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 