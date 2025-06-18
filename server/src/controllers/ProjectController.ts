import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Project, IProject } from '../models/Project';
import { Module } from '../models/Module';
import { Feature } from '../models/Feature';
import { TestCase } from '../models/TestCase';
import { User } from '../models/User';
import { Types } from 'mongoose';

// Extended Request interface to include user
interface AuthRequest extends Request {
  user?: {
    _id: string;
    id: string;
    email: string;
    role: string;
  };
}

export class ProjectController {
  
  // Get all projects for the current user
  static async getAllProjects(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id;
      
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

      return res.json({
        success: true,
        data: projectsWithStats,
        message: 'Projects retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching projects',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single project by ID
  static async getProjectById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      const project = await Project.findById(id)
        .populate('createdBy', 'name email')
        .populate('teamMembers.userId', 'name email');

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user has access to this project
      const hasAccess = project.visibility === 'Public' ||
        project.teamMembers.some((member: any) => member.userId.toString() === userId) ||
        project.createdBy.toString() === userId;

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
        'automation.isAutomated': true 
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

      return res.json({
        success: true,
        data: projectWithStats,
        message: 'Project retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching project',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new project
  static async createProject(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { name, description, key, visibility = 'Public', settings = {} } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Check if project key already exists
      if (key) {
        const existingProject = await Project.findOne({ key: key.toUpperCase() });
        if (existingProject) {
          return res.status(400).json({
            success: false,
            message: 'Project key already exists'
          });
        }
      }

      const project = new Project({
        name,
        description,
        key: key?.toUpperCase(),
        visibility,
        settings,
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId),
        teamMembers: [{ 
          userId: new Types.ObjectId(userId), 
          role: 'Owner', 
          joinedAt: new Date() 
        }]
      });

      await project.save();

      return res.status(201).json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Error creating project:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Update project
  static async updateProject(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user has permission to update
      const hasPermission = project.createdBy.toString() === userId ||
        project.teamMembers.some((member: any) => 
          member.userId.toString() === userId && 
          ['Admin', 'Owner'].includes(member.role)
        );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      const allowedFields = ['name', 'description', 'visibility', 'settings', 'environments', 'tags'];
      const updateData: Partial<IProject> = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          (updateData as any)[field] = req.body[field];
        }
      }

      updateData.updatedBy = new Types.ObjectId(userId);

      const updatedProject = await Project.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');

      return res.json({
        success: true,
        data: updatedProject
      });
    } catch (error) {
      console.error('Error updating project:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Delete project
  static async deleteProject(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Only project owner can delete
      if (project.createdBy.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only project owner can delete the project'
        });
      }

      await Project.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Add team member
  static async addTeamMember(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { id } = req.params;
      const { email, role } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user has permission to add members
      const hasPermission = project.createdBy.toString() === userId ||
        project.teamMembers.some((member: any) => 
          member.userId.toString() === userId && 
          ['Admin', 'Owner'].includes(member.role)
        );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is already a member
      const existingMember = project.teamMembers.find(
        (member: any) => member.userId.toString() === (user._id as Types.ObjectId).toString()
      );

      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a team member'
        });
      }

      project.teamMembers.push({
        userId: user._id as Types.ObjectId,
        role,
        joinedAt: new Date()
      });

      await project.save();

      return res.json({
        success: true,
        message: 'Team member added successfully'
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Remove team member
  static async removeTeamMember(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id, memberId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user has permission to remove members
      const hasPermission = project.createdBy.toString() === userId ||
        project.teamMembers.some((member: any) => 
          member.userId.toString() === userId && 
          ['Admin', 'Owner'].includes(member.role)
        );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      project.teamMembers = project.teamMembers.filter(
        (member: any) => member.userId.toString() !== memberId
      );

      project.updatedBy = new Types.ObjectId(userId);
      await project.save();

      return res.json({
        success: true,
        message: 'Team member removed successfully'
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Update team member role
  static async updateTeamMemberRole(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id, memberId } = req.params;
      const { role } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user has permission to update roles
      const hasPermission = project.createdBy.toString() === userId ||
        project.teamMembers.some((member: any) => 
          member.userId.toString() === userId && 
          ['Admin', 'Owner'].includes(member.role)
        );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      const memberIndex = project.teamMembers.findIndex(
        (member: any) => member.userId.toString() === memberId
      );

      if (memberIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Team member not found'
        });
      }

      (project.teamMembers[memberIndex] as any).role = role;
      project.updatedBy = new Types.ObjectId(userId);
      await project.save();

      return res.json({
        success: true,
        message: 'Team member role updated successfully'
      });
    } catch (error) {
      console.error('Error updating team member role:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Get project statistics
  static async getProjectStatistics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check access
      const hasAccess = project.visibility === 'Public' ||
        project.teamMembers.some((member: any) => member.userId.toString() === userId) ||
        project.createdBy.toString() === userId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const moduleCount = await Module.countDocuments({ projectId: project._id });
      const featureCount = await Feature.countDocuments({ projectId: project._id });
      const testCaseCount = await TestCase.countDocuments({ projectId: project._id });
      const automatedTestCount = await TestCase.countDocuments({ 
        projectId: project._id, 
        'automation.isAutomated': true 
      });

      const statistics = {
        moduleCount,
        featureCount,
        testCaseCount,
        automatedTestCount,
        automationPercentage: testCaseCount > 0 ? Math.round((automatedTestCount / testCaseCount) * 100) : 0
      };

      return res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error fetching project statistics:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
} 