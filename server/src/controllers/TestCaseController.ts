import { Request, Response } from 'express';
import { TestCase } from '../models/TestCase';
import { Feature } from '../models/Feature';
import { Project } from '../models/Project';

// Extended Request interface to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class TestCaseController {
  
  // Get all test cases with filters
  static async getAllTestCases(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
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
        .populate('projectId', 'name key')
        .populate('moduleId', 'name')
        .populate('featureId', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string));

      const totalCount = await TestCase.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / parseInt(limit as string));

      res.json({
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
      res.status(500).json({
        success: false,
        message: 'Error fetching test cases',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single test case by ID
  static async getTestCaseById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const testCase = await TestCase.findById(id)
        .populate('projectId', 'name key settings')
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
        project.teamMembers.some(member => member.userId.toString() === userId) ||
        project.createdBy.toString() === userId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this test case'
        });
      }

      res.json({
        success: true,
        data: testCase,
        message: 'Test case retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching test case:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching test case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new test case
  static async createTestCase(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const {
        title,
        description,
        featureId,
        priority = 'Medium',
        type = 'Functional',
        automationType = 'Manual',
        preconditions,
        steps = [],
        expectedResults = [],
        tags = [],
        estimatedDuration = 5,
        complexity = 'Medium'
      } = req.body;

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
        project.teamMembers.some(member => 
          member.userId.toString() === userId && 
          ['Owner', 'Admin', 'Developer', 'Tester'].includes(member.role)
        ) ||
        project.createdBy.toString() === userId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create test case in this project'
        });
      }

      const testCase = new TestCase({
        title,
        description,
        featureId,
        moduleId: feature.moduleId,
        projectId: feature.projectId,
        priority,
        type,
        automationType,
        preconditions,
        steps: steps.map((step: any, index: number) => ({
          order: index + 1,
          description: step.description,
          expectedResult: step.expectedResult,
          automationCommand: step.automationCommand,
          attachments: step.attachments || []
        })),
        expectedResults,
        tags,
        estimatedDuration,
        complexity,
        assignedTo: userId as any,
        createdBy: userId as any,
        updatedBy: userId as any
      });

      await testCase.save();

      // Add test case to feature
      await Feature.findByIdAndUpdate(
        featureId,
        { $push: { testCases: testCase._id } },
        { new: true }
      );

      const populatedTestCase = await TestCase.findById(testCase._id)
        .populate('projectId', 'name key')
        .populate('moduleId', 'name')
        .populate('featureId', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

      res.status(201).json({
        success: true,
        data: populatedTestCase,
        message: 'Test case created successfully'
      });
    } catch (error) {
      console.error('Error creating test case:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating test case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update test case
  static async updateTestCase(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const updateData = req.body;

      const testCase = await TestCase.findById(id);
      if (!testCase) {
        return res.status(404).json({
          success: false,
          message: 'Test case not found'
        });
      }

      // Check if user has permission to update
      const project = await Project.findById(testCase.projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Associated project not found'
        });
      }

      const userMember = project.teamMembers.find(
        member => member.userId.toString() === userId
      );
      
      const canEdit = testCase.createdBy.toString() === userId ||
        testCase.assignedTo?.toString() === userId ||
        (userMember && ['Owner', 'Admin', 'Developer', 'Tester'].includes(userMember.role));

      if (!canEdit) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to update this test case'
        });
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== 'testCaseId' && key !== 'createdBy' && key !== 'createdAt') {
          if (key === 'steps' && Array.isArray(updateData[key])) {
            (testCase as any)[key] = updateData[key].map((step: any, index: number) => ({
              order: index + 1,
              description: step.description,
              expectedResult: step.expectedResult,
              automationCommand: step.automationCommand,
              attachments: step.attachments || []
            }));
          } else {
            (testCase as any)[key] = updateData[key];
          }
        }
      });

      testCase.updatedBy = userId as any;
      await testCase.save();

      const updatedTestCase = await TestCase.findById(testCase._id)
        .populate('projectId', 'name key')
        .populate('moduleId', 'name')
        .populate('featureId', 'name')
        .populate('assignedTo', 'name email')
        .populate('updatedBy', 'name email');

      res.json({
        success: true,
        data: updatedTestCase,
        message: 'Test case updated successfully'
      });
    } catch (error) {
      console.error('Error updating test case:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating test case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete test case
  static async deleteTestCase(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const testCase = await TestCase.findById(id);
      if (!testCase) {
        return res.status(404).json({
          success: false,
          message: 'Test case not found'
        });
      }

      // Check if user has permission to delete
      const project = await Project.findById(testCase.projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Associated project not found'
        });
      }

      const userMember = project.teamMembers.find(
        member => member.userId.toString() === userId
      );
      
      const canDelete = testCase.createdBy.toString() === userId ||
        (userMember && ['Owner', 'Admin'].includes(userMember.role));

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to delete this test case'
        });
      }

      // Remove test case from feature
      await Feature.findByIdAndUpdate(
        testCase.featureId,
        { $pull: { testCases: testCase._id } }
      );

      await TestCase.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Test case deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting test case:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting test case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 