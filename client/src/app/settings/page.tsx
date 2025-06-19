'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Avatar
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Profile Settings
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
                  JD
                </Avatar>
                <Button variant="outlined" size="small">
                  Change Photo
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    defaultValue="John"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    defaultValue="Doe"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue="john.doe@tcmanager.com"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    defaultValue="QA Lead"
                    size="small"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Security Settings
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Change Password
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Two-Factor Authentication"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={<Switch />}
                  label="Require password confirmation for sensitive actions"
                />
              </Box>

              <Button variant="outlined" color="warning">
                Update Security Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon sx={{ mr: 2, color: 'info.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Notification Settings
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Email notifications for test run completion"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Email notifications for failed tests"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch />}
                  label="Daily summary reports"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Browser notifications"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch />}
                  label="Mobile push notifications"
                />
              </Box>

              <Button variant="outlined" color="info">
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ThemeIcon sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Appearance Settings
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Theme
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button variant="contained" size="small">Light</Button>
                  <Button variant="outlined" size="small">Dark</Button>
                  <Button variant="outlined" size="small">Auto</Button>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Compact navigation"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Show dashboard animations"
                />
              </Box>

              <Button variant="outlined" color="secondary">
                Apply Theme Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              System Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Version
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  TCManager v2.1.0
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  January 16, 2024
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  License
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  Enterprise
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Support
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  Premium
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
} 