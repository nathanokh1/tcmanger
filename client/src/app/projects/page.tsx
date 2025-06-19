'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem as MenuOption,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  BugReport as BugIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Project {
  _id: string;
  name: string;
  description: string;
  key: string;
  status: 'Active' | 'Inactive' | 'Archived';
  visibility: 'Public' | 'Private';
  teamMembers: {
    userId: { name: string; email: string };
    role: string;
    joinedAt: string;
  }[];
  statistics: {
    moduleCount: number;
    featureCount: number;
    testCaseCount: number;
    automatedTestCount: number;
    automationPercentage: number;
  };
  tags: string[];
  createdBy: { name: string };
  createdAt: string;
  updatedAt: string;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Mock data for development
  const mockProjects: Project[] = [
    {
      _id: '1',
      name: 'E-Commerce Platform',
      description: 'Complete online shopping platform with advanced features including cart management, payment processing, and user authentication.',
      key: 'ECOM',
      status: 'Active',
      visibility: 'Public',
      teamMembers: [
        { userId: { name: 'John Doe', email: 'john@example.com' }, role: 'Owner', joinedAt: '2024-01-01T00:00:00Z' },
        { userId: { name: 'Jane Smith', email: 'jane@example.com' }, role: 'Admin', joinedAt: '2024-01-02T00:00:00Z' },
        { userId: { name: 'Mike Johnson', email: 'mike@example.com' }, role: 'Tester', joinedAt: '2024-01-03T00:00:00Z' },
      ],
      statistics: {
        moduleCount: 8,
        featureCount: 24,
        testCaseCount: 156,
        automatedTestCount: 89,
        automationPercentage: 57
      },
      tags: ['e-commerce', 'web', 'react', 'nodejs'],
      createdBy: { name: 'Admin User' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      _id: '2',
      name: 'Mobile Banking App',
      description: 'Secure mobile banking application with biometric authentication, transaction history, and account management.',
      key: 'BANK',
      status: 'Active',
      visibility: 'Private',
      teamMembers: [
        { userId: { name: 'Sarah Wilson', email: 'sarah@example.com' }, role: 'Owner', joinedAt: '2024-01-05T00:00:00Z' },
        { userId: { name: 'David Brown', email: 'david@example.com' }, role: 'Developer', joinedAt: '2024-01-06T00:00:00Z' },
      ],
      statistics: {
        moduleCount: 12,
        featureCount: 36,
        testCaseCount: 298,
        automatedTestCount: 201,
        automationPercentage: 67
      },
      tags: ['mobile', 'banking', 'security', 'react-native'],
      createdBy: { name: 'Product Manager' },
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-14T15:20:00Z'
    },
    {
      _id: '3',
      name: 'API Gateway Service',
      description: 'Microservices API gateway with authentication, rate limiting, and monitoring capabilities.',
      key: 'API',
      status: 'Active',
      visibility: 'Public',
      teamMembers: [
        { userId: { name: 'Alex Chen', email: 'alex@example.com' }, role: 'Owner', joinedAt: '2024-01-10T00:00:00Z' },
      ],
      statistics: {
        moduleCount: 6,
        featureCount: 18,
        testCaseCount: 124,
        automatedTestCount: 98,
        automationPercentage: 79
      },
      tags: ['api', 'microservices', 'nodejs', 'docker'],
      createdBy: { name: 'Tech Lead' },
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-13T09:15:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(projectId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#4caf50';
      case 'Inactive': return '#ff9800';
      case 'Archived': return '#757575';
      default: return '#757575';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === '' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none'
          }}
        >
          Create Project
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={`${filteredProjects.length} projects`} variant="outlined" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Projects Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Loading projects...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project._id}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {project.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip 
                          label={project.key} 
                          size="small" 
                          sx={{ 
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                          }} 
                        />
                        <Chip 
                          label={project.status} 
                          size="small" 
                          sx={{ 
                            backgroundColor: getStatusColor(project.status),
                            color: 'white'
                          }}
                        />
                        <Chip 
                          label={project.visibility} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <IconButton 
                      onClick={(e) => handleMenuClick(e, project._id)}
                      size="small"
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                      overflow: 'hidden'
                    }}
                  >
                    {project.description}
                  </Typography>

                  {/* Team Members */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                      <Typography variant="caption" color="text.secondary">
                        Team ({project.teamMembers.length})
                      </Typography>
                    </Box>
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                      {project.teamMembers.map((member, index) => (
                        <Tooltip key={index} title={`${member.userId.name} (${member.role})`}>
                          <Avatar>
                            {member.userId.name.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  </Box>

                  {/* Statistics */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">
                          {project.statistics.testCaseCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Test Cases
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">
                          {project.statistics.moduleCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Modules
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Automation Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Automation
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {project.statistics.automationPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.statistics.automationPercentage} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }
                      }}
                    />
                  </Box>

                  {/* Tags */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {project.tags.length > 3 && (
                      <Chip 
                        label={`+${project.tags.length - 3}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    sx={{ color: '#667eea' }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    startIcon={<AssessmentIcon />}
                    sx={{ color: '#764ba2' }}
                  >
                    Reports
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuOption onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1, fontSize: '1rem' }} />
          Edit Project
        </MenuOption>
        <MenuOption onClick={handleMenuClose}>
          <SettingsIcon sx={{ mr: 1, fontSize: '1rem' }} />
          Settings
        </MenuOption>
        <MenuOption onClick={handleMenuClose}>
          <StarIcon sx={{ mr: 1, fontSize: '1rem' }} />
          Add to Favorites
        </MenuOption>
        <MenuOption onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: '1rem' }} />
          Delete Project
        </MenuOption>
      </Menu>

      {/* Create Project Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Name"
                placeholder="Enter project name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Key"
                placeholder="e.g., PROJ"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                placeholder="Enter project description"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Visibility</InputLabel>
                <Select defaultValue="Public">
                  <MenuItem value="Public">Public</MenuItem>
                  <MenuItem value="Private">Private</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tags"
                placeholder="Enter tags separated by commas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default ProjectsPage; 