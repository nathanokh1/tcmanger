import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { TestCase } from '../models/TestCase';
import { Feature } from '../models/Feature';
import { Project } from '../models/Project';
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

export class TestCaseController {
  
  // Get all test cases with filters
  static async getAllTestCases(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id;
      const {
        projectId,
        moduleId,
        featureId,
        status,
        priority,
        page = 1,
        limit = 20,
        search
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      if (projectId) filter.projectId = projectId;
      if (moduleId) filter.moduleId = moduleId;
      if (featureId) filter.featureId = featureId;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      // Text search
      if (search) {
        filter.$text = { $search: search };
      }

      // Check user access to projects
      const userProjects = await Project.find({
        $or: [
          { 'teamMembers.userId': userId },
          { visibility: 'Public' },
          { createdBy: userId }
        ]
      }).select('_id');

      const projectIds = userProjects.map(p => p._id);
      filter.projectId = { $in: projectIds };

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const testCases = await TestCase.find(filter)
        .populate('projectId', 'name')
        .populate('moduleId', 'name')
        .populate('featureId', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string));

      const totalCount = await TestCase.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / parseInt(limit as string));

      return res.json({
        success: true,
        data: {
          testCases,
          pagination: {
            currentPage: parseInt(page as string),
            totalPages,
            totalCount,
            hasNextPage: parseInt(page as string) < totalPages,
            hasPrevPage: parseInt(page as string) > 1
          }
        },
        message: 'Test cases retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching test cases:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching test cases',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single test case by ID
  static async getTestCaseById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      const testCase = await TestCase.findById(id)
        .populate('projectId', 'name settings')
        .populate('moduleId', 'name')
        .populate('featureId', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      if (!testCase) {
        return res.status(404).json({
          success: false,
          message: 'Test case not found'
        });
      }

      // Check if user has access to this test case's project
      const project = await Project.findById(testCase.projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Associated project not found'
        });
      }

      const hasAccess = project.visibility === 'Public' ||
        project.teamMembers.some((member: any) => member.userId.toString() === userId) ||
        project.createdBy.toString() === userId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this test case'
        });
      }

      return res.json({
        success: true,
        data: testCase,
        message: 'Test case retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching test case:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching test case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new test case
  static async createTestCase(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const userId = req.user?._id;
      const {
        title,
        description,
        featureId,
        priority = 'medium',
        type = 'functional',
        preconditions,
        steps = [],
        expectedResult,
        tags = [],
        estimatedDuration = 5,
        complexity = 'medium'
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Validate required fields
      if (!title || !featureId) {
        return res.status(400).json({
          success: false,
          message: 'Title and feature ID are required'
        });
      }

      // Get feature to ensure it exists and get project/module info
      const feature = await Feature.findById(featureId);
      if (!feature) {
        return res.status(404).json({
          success: false,
          message: 'Feature not found'
        });
      }

      // Check if user has access to the project
      const project = await Project.findById(feature.projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Associated project not found'
        });
      }

      const hasAccess = project.visibility === 'Public' ||
        project.teamMembers.some((member: any) => 
          member.userId.toString() === userId && 
          ['Admin', 'Owner', 'Tester'].includes(member.role)
        );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to create test cases in this project'
        });
      }

      const testCase = new TestCase({
        title,
        description,
        projectId: feature.projectId,
        moduleId: feature.moduleId,
        featureId: new Types.ObjectId(featureId),
        priority,
        type,
        preconditions,
        steps,
        expectedResult,
        tags,
        estimatedDuration,
        complexity,
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId)
      });

      await testCase.save();

      const populatedTestCase = await TestCase.findById(testCase._id)
        .populate('projectId', 'name')
        .populate('moduleId', 'name')
        .populate('featureId', 'name')
        .populate('createdBy', 'name email');

      return res.status(201).json({
        success: true,
        data: populatedTestCase,
        message: 'Test case created successfully'
      });
    } catch (error) {
      console.error('Error creating test case:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating test case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update test case
  static async updateTestCase(req: AuthRequest, res: Response): Promise<Response> {
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

      const testCase = await TestCase.findById(id);
      if (!testCase) {
        return res.status(404).json({
          success: false,
          message: 'Test case not found'
        });
      }

      // Check if user has access to the project
      const project = await Project.findById(testCase.projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Associated project not found'
        });
      }

      const hasAccess = project.visibility === 'Public' ||
        project.teamMembers.some((member: any) => 
          member.userId.toString() === userId && 
          ['Admin', 'Owner', 'Tester'].includes(member.role)
        );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to update this test case'
        });
      }

      const allowedFields = [
        'title', 'description', 'priority', 'type', 'preconditions',
        'steps', 'expectedResult', 'tags', 'estimatedDuration', 'complexity',
        'assignedTo', 'status'
      ];

      const updateData: any = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      updateData.updatedBy = new Types.ObjectId(userId);

      const updatedTestCase = await TestCase.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate('projectId', 'name')
      .populate('moduleId', 'name')
      .populate('featureId', 'name')
      .populate('assignedTo', 'name email')
      .populate('updatedBy', 'name email');

      return res.json({
        success: true,
        data: updatedTestCase,
        message: 'Test case updated successfully'
      });
    } catch (error) {
      console.error('Error updating test case:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating test case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete test case
  static async deleteTestCase(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const testCase = await TestCase.findById(id);
      if (!testCase) {
        return res.status(404).json({
          success: false,
          message: 'Test case not found'
        });
      }

      // Check if user has access to the project
      const project = await Project.findById(testCase.projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Associated project not found'
        });
      }

      const hasAccess = project.createdBy.toString() === userId ||
        project.teamMembers.some((member: any) => 
          member.userId.toString() === userId && 
          ['Admin', 'Owner'].includes(member.role)
        );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to delete this test case'
        });
      }

      await TestCase.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Test case deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting test case:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting test case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 