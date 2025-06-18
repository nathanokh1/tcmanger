import { Request, Response } from 'express';
import { Project, IProject } from '../models/Project';
import { Module } from '../models/Module';
import { Feature } from '../models/Feature';
import { TestCase } from '../models/TestCase';
import { User } from '../models/User';

// Extended Request interface to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class ProjectController {
  
  // Get all projects for the current user
  static async getAllProjects(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Find projects where user is a team member or has access
      const projects = await Project.find({
        $or: [
          { 'teamMembers.userId': userId },
          { visibility: 'Public' },
          { createdBy: userId }
        ]
      })
      .populate('createdBy', 'name email')
      .populate('teamMembers.userId', 'name email')
      .sort({ updatedAt: -1 });

      // Calculate project statistics
      const projectsWithStats = await Promise.all(
        projects.map(async (project) => {
          const moduleCount = await Module.countDocuments({ projectId: project._id });
          const featureCount = await Feature.countDocuments({ projectId: project._id });
          const testCaseCount = await TestCase.countDocuments({ projectId: project._id });
          
          return {
            ...project.toObject(),
            statistics: {
              moduleCount,
              featureCount,
              testCaseCount
            }
          };
        })
      );

      res.json({
        success: true,
        data: projectsWithStats,
        message: 'Projects retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching projects',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single project by ID
  static async getProjectById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const project = await Project.findById(id)
        .populate('createdBy', 'name email')
        .populate('teamMembers.userId', 'name email role')
        .populate({
          path: 'modules',
          populate: {
            path: 'features',
            populate: {
              path: 'testCases'
            }
          }
        });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user has access to this project
      const hasAccess = project.visibility === 'Public' ||
        project.teamMembers.some(member => member.userId.toString() === userId) ||
        project.createdBy._id.toString() === userId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this project'
        });
      }

      // Get project statistics
      const moduleCount = await Module.countDocuments({ projectId: project._id });
      const featureCount = await Feature.countDocuments({ projectId: project._id });
      const testCaseCount = await TestCase.countDocuments({ projectId: project._id });
      const automatedTestCount = await TestCase.countDocuments({ 
        projectId: project._id, 
        automationType: 'Automated' 
      });

      const projectWithStats = {
        ...project.toObject(),
        statistics: {
          moduleCount,
          featureCount,
          testCaseCount,
          automatedTestCount,
          automationPercentage: testCaseCount > 0 ? Math.round((automatedTestCount / testCaseCount) * 100) : 0
        }
      };

      res.json({
        success: true,
        data: projectWithStats,
        message: 'Project retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching project',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new project
  static async createProject(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const {
        name,
        description,
        key,
        visibility = 'Public',
        settings = {},
        environments = ['Development', 'Testing', 'Staging', 'Production'],
        tags = []
      } = req.body;

      // Validate required fields
      if (!name || !key) {
        return res.status(400).json({
          success: false,
          message: 'Name and key are required'
        });
      }

      // Check if project key already exists
      const existingProject = await Project.findOne({ key: key.toUpperCase() });
      if (existingProject) {
        return res.status(400).json({
          success: false,
          message: 'Project key already exists'
        });
      }

      const project = new Project({
        name,
        description,
        key: key.toUpperCase(),
        visibility,
        settings: {
          defaultEnvironment: settings.defaultEnvironment || 'Development',
          allowedEnvironments: settings.allowedEnvironments || environments,
          testCasePrefix: settings.testCasePrefix || 'TC',
          requiresApproval: settings.requiresApproval || false,
          automationEnabled: settings.automationEnabled || true,
          integrations: settings.integrations || {}
        },
        environments,
        tags,
        teamMembers: [{
          userId: userId,
          role: 'Owner',
          joinedAt: new Date()
        }],
        createdBy: userId,
        updatedBy: userId
      });

      await project.save();

      const populatedProject = await Project.findById(project._id)
        .populate('createdBy', 'name email')
        .populate('teamMembers.userId', 'name email');

      res.status(201).json({
        success: true,
        data: populatedProject,
        message: 'Project created successfully'
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating project',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update project
  static async updateProject(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const updateData = req.body;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user has permission to update (Owner or Admin)
      const userMember = project.teamMembers.find(
        member => member.userId.toString() === userId
      );
      
      if (!userMember || !['Owner', 'Admin'].includes(userMember.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to update project'
        });
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
          if (key === 'key' && updateData[key]) {
            project[key] = updateData[key].toUpperCase();
          } else {
            project[key] = updateData[key];
          }
        }
      });

      project.updatedBy = userId;
      await project.save();

      const updatedProject = await Project.findById(project._id)
        .populate('createdBy', 'name email')
        .populate('teamMembers.userId', 'name email');

      res.json({
        success: true,
        data: updatedProject,
        message: 'Project updated successfully'
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating project',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete project
  static async deleteProject(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user is the owner
      const userMember = project.teamMembers.find(
        member => member.userId.toString() === userId
      );
      
      if (!userMember || userMember.role !== 'Owner') {
        return res.status(403).json({
          success: false,
          message: 'Only project owners can delete projects'
        });
      }

      // Delete related data
      await Module.deleteMany({ projectId: id });
      await Feature.deleteMany({ projectId: id });
      await TestCase.deleteMany({ projectId: id });
      
      await Project.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Project and all related data deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting project',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Add team member to project
  static async addTeamMember(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { email, role = 'Tester' } = req.body;
      const userId = req.user?.id;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if current user has permission to add members
      const currentUserMember = project.teamMembers.find(
        member => member.userId.toString() === userId
      );
      
      if (!currentUserMember || !['Owner', 'Admin'].includes(currentUserMember.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to add team members'
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is already a team member
      const existingMember = project.teamMembers.find(
        member => member.userId.toString() === user._id.toString()
      );
      
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a team member'
        });
      }

      // Add team member
      project.teamMembers.push({
        userId: user._id,
        role,
        joinedAt: new Date()
      });

      project.updatedBy = userId;
      await project.save();

      const updatedProject = await Project.findById(project._id)
        .populate('teamMembers.userId', 'name email');

      res.json({
        success: true,
        data: updatedProject,
        message: 'Team member added successfully'
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding team member',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Remove team member from project
  static async removeTeamMember(req: AuthRequest, res: Response) {
    try {
      const { id, memberId } = req.params;
      const userId = req.user?.id;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if current user has permission to remove members
      const currentUserMember = project.teamMembers.find(
        member => member.userId.toString() === userId
      );
      
      if (!currentUserMember || !['Owner', 'Admin'].includes(currentUserMember.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to remove team members'
        });
      }

      // Find and remove team member
      const memberIndex = project.teamMembers.findIndex(
        member => member.userId.toString() === memberId
      );
      
      if (memberIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Team member not found'
        });
      }

      // Don't allow removing the owner
      if (project.teamMembers[memberIndex].role === 'Owner') {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove project owner'
        });
      }

      project.teamMembers.splice(memberIndex, 1);
      project.updatedBy = userId;
      await project.save();

      res.json({
        success: true,
        message: 'Team member removed successfully'
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing team member',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update team member role
  static async updateTeamMemberRole(req: AuthRequest, res: Response) {
    try {
      const { id, memberId } = req.params;
      const { role } = req.body;
      const userId = req.user?.id;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if current user has permission to update roles
      const currentUserMember = project.teamMembers.find(
        member => member.userId.toString() === userId
      );
      
      if (!currentUserMember || currentUserMember.role !== 'Owner') {
        return res.status(403).json({
          success: false,
          message: 'Only project owners can update member roles'
        });
      }

      // Find and update team member role
      const memberIndex = project.teamMembers.findIndex(
        member => member.userId.toString() === memberId
      );
      
      if (memberIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Team member not found'
        });
      }

      // Don't allow changing owner role
      if (project.teamMembers[memberIndex].role === 'Owner') {
        return res.status(400).json({
          success: false,
          message: 'Cannot change owner role'
        });
      }

      project.teamMembers[memberIndex].role = role;
      project.updatedBy = userId;
      await project.save();

      const updatedProject = await Project.findById(project._id)
        .populate('teamMembers.userId', 'name email');

      res.json({
        success: true,
        data: updatedProject,
        message: 'Team member role updated successfully'
      });
    } catch (error) {
      console.error('Error updating team member role:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating team member role',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 