import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { TestCase, ITestCase } from '../models/TestCase';
import { Project } from '../models/Project';
import { Module } from '../models/Module';
import { Feature } from '../models/Feature';
import { logger } from '../utils/logger';

// Extended Request interface to include user
interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
  socketService?: {
    sendNotification: (notification: any) => void;
    broadcastToProject: (projectId: string, event: string, data: any) => void;
  };
  cache?: {
    get: (key: string, options?: any) => Promise<any>;
    set: (key: string, value: any, options?: any) => Promise<void>;
    del: (key: string) => Promise<void>;
    getOrSet: (key: string, fetcher: () => Promise<any>, options?: any) => Promise<any>;
  };
}

export class TestCaseController {
  
  /**
   * Get all test cases with caching and advanced filtering
   */
  static async getAllTestCases(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id;
      const { 
        projectId, 
        moduleId, 
        featureId, 
        status, 
        priority, 
        assignedTo,
        search,
        page = 1,
        limit = 20,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = req.query;

      // Build cache key based on query parameters
      const queryHash = Buffer.from(JSON.stringify(req.query)).toString('base64').slice(0, 20);
      const cacheKey = `testcases:user:${userId}:query:${queryHash}`;

      // Try to get from cache first
      if (req.cache) {
        const cachedData = await req.cache.get(cacheKey, { ttl: 180 }); // 3 minutes
        if (cachedData) {
          logger.info(`Test cases retrieved from cache for user ${userId}`);
          return res.json({
            success: true,
            data: cachedData.testCases,
            pagination: cachedData.pagination,
            cached: true,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Build aggregation pipeline for better performance
      const pipeline: any[] = [];

      // Match stage - filter by user access and query parameters
      const matchStage: any = {};
      
      if (projectId) matchStage.projectId = projectId;
      if (moduleId) matchStage.moduleId = moduleId;
      if (featureId) matchStage.featureId = featureId;
      if (status) matchStage.status = status;
      if (priority) matchStage.priority = priority;
      if (assignedTo) matchStage.assignedTo = assignedTo;
      
      if (search) {
        matchStage.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'testSteps.action': { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } }
        ];
      }

      pipeline.push({ $match: matchStage });

      // Add project information and access control
      pipeline.push({
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project'
        }
      });

      pipeline.push({
        $match: {
          $or: [
            { 'project.visibility': 'Public' },
            { 'project.createdBy': userId },
            { 'project.teamMembers.userId': userId },
            { createdBy: userId }
          ]
        }
      });

      // Add lookup for related data
      pipeline.push(
        {
          $lookup: {
            from: 'modules',
            localField: 'moduleId',
            foreignField: '_id',
            as: 'module'
          }
        },
        {
          $lookup: {
            from: 'features',
            localField: 'featureId',
            foreignField: '_id',
            as: 'feature'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'assignedTo',
            foreignField: '_id',
            as: 'assignee'
          }
        }
      );

      // Project fields we want to return
      pipeline.push({
        $project: {
          title: 1,
          description: 1,
          status: 1,
          priority: 1,
          tags: 1,
          testSteps: 1,
          expectedResult: 1,
          automation: 1,
          createdAt: 1,
          updatedAt: 1,
          'project.name': { $arrayElemAt: ['$project.name', 0] },
          'module.name': { $arrayElemAt: ['$module.name', 0] },
          'feature.name': { $arrayElemAt: ['$feature.name', 0] },
          'creator.firstName': { $arrayElemAt: ['$creator.firstName', 0] },
          'creator.lastName': { $arrayElemAt: ['$creator.lastName', 0] },
          'assignee.firstName': { $arrayElemAt: ['$assignee.firstName', 0] },
          'assignee.lastName': { $arrayElemAt: ['$assignee.lastName', 0] }
        }
      });

      // Sort stage
      const sortStage: any = {};
      sortStage[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
      pipeline.push({ $sort: sortStage });

      // Count total documents for pagination
      const countPipeline = [...pipeline, { $count: 'total' }];
      const totalResult = await TestCase.aggregate(countPipeline);
      const total = totalResult[0]?.total || 0;

      // Add pagination
      const skip = (Number(page) - 1) * Number(limit);
      pipeline.push({ $skip: skip }, { $limit: Number(limit) });

      // Execute aggregation
      const testCases = await TestCase.aggregate(pipeline);

      // Prepare pagination info
      const pagination = {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
        hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
        hasPrevPage: Number(page) > 1
      };

      const result = {
        testCases,
        pagination
      };

      // Cache the results
      if (req.cache) {
        await req.cache.set(cacheKey, result, { ttl: 180 });
      }

      logger.info(`${testCases.length} test cases retrieved for user ${userId}`);
      return res.json({
        success: true,
        data: testCases,
        pagination,
        cached: false,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get all test cases error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve test cases',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get test case by ID with caching
   */
  static async getTestCaseById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      const cacheKey = `testcase:${id}:user:${userId}`;

      // Try to get from cache first
      if (req.cache) {
        const cachedTestCase = await req.cache.get(cacheKey, { ttl: 300 }); // 5 minutes
        if (cachedTestCase) {
          logger.info(`Test case ${id} retrieved from cache`);
          return res.json({
            success: true,
            data: cachedTestCase,
            cached: true,
            timestamp: new Date().toISOString()
          });
        }
      }

      const testCase = await TestCase.findById(id)
        .populate('projectId', 'name visibility createdBy teamMembers')
        .populate('moduleId', 'name')
        .populate('featureId', 'name')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .lean();

      if (!testCase) {
        return res.status(404).json({
          success: false,
          message: 'Test case not found'
        });
      }

      // Check access permissions
      const project = testCase.projectId as any;
      const hasAccess = project.visibility === 'Public' ||
                       project.createdBy.toString() === userId ||
                       project.teamMembers?.some((member: any) => member.userId.toString() === userId) ||
                       testCase.createdBy._id.toString() === userId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this test case'
        });
      }

      // Cache the result
      if (req.cache) {
        await req.cache.set(cacheKey, testCase, { ttl: 300 });
      }

      logger.info(`Test case ${id} retrieved for user ${userId}`);
      return res.json({
        success: true,
        data: testCase,
        cached: false,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get test case by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve test case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new test case with cache invalidation
   */
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
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Verify project access
      const project = await Project.findById(req.body.projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const hasAccess = project.visibility === 'Public' ||
                       project.createdBy.toString() === userId ||
                       project.teamMembers?.some((member: any) => member.userId.toString() === userId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this project'
        });
      }

      // Create test case
      const testCaseData = {
        ...req.body,
        createdBy: userId,
        updatedBy: userId
      };

      const testCase = new TestCase(testCaseData);
      await testCase.save();

      // Populate fields for response
      await testCase.populate('projectId', 'name');
      await testCase.populate('moduleId', 'name');
      await testCase.populate('featureId', 'name');
      await testCase.populate('createdBy', 'firstName lastName email');

      // Invalidate related caches
      if (req.cache) {
        await TestCaseController.invalidateTestCaseCaches(req.cache, testCase);
      }

      // Broadcast creation via Socket.io
      if (req.socketService && testCase.projectId) {
        req.socketService.broadcastToProject(testCase.projectId.toString(), 'testcase-created', {
          testCaseId: testCase._id.toString(),
          title: testCase.title,
          createdBy: {
            id: userId,
            name: `${req.user?.firstName} ${req.user?.lastName}`
          },
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`Test case created: ${testCase.title} by user ${userId}`);
      return res.status(201).json({
        success: true,
        data: testCase,
        message: 'Test case created successfully'
      });

    } catch (error) {
      logger.error('Create test case error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create test case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update test case with cache invalidation
   */
  static async updateTestCase(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const testCase = await TestCase.findById(id).populate('projectId');
      if (!testCase) {
        return res.status(404).json({
          success: false,
          message: 'Test case not found'
        });
      }

      // Check permissions
      const project = testCase.projectId as any;
      const canEdit = project.createdBy.toString() === userId ||
                     project.teamMembers?.some((member: any) => 
                       member.userId.toString() === userId && 
                       ['Admin', 'Owner', 'Tester'].includes(member.role)
                     ) ||
                     testCase.createdBy.toString() === userId;

      if (!canEdit) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to edit this test case'
        });
      }

      // Update test case
      Object.assign(testCase, req.body);
      testCase.updatedBy = userId;
      testCase.updatedAt = new Date();

      await testCase.save();

      // Populate fields for response
      await testCase.populate('moduleId', 'name');
      await testCase.populate('featureId', 'name');
      await testCase.populate('updatedBy', 'firstName lastName email');

      // Invalidate caches
      if (req.cache) {
        await TestCaseController.invalidateTestCaseCaches(req.cache, testCase);
      }

      // Broadcast update via Socket.io
      if (req.socketService) {
        req.socketService.broadcastToProject(testCase.projectId.toString(), 'testcase-updated', {
          testCaseId: id,
          title: testCase.title,
          updatedBy: {
            id: userId,
            name: `${req.user?.firstName} ${req.user?.lastName}`
          },
          changes: req.body,
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`Test case ${id} updated by user ${userId}`);
      return res.json({
        success: true,
        data: testCase,
        message: 'Test case updated successfully'
      });

    } catch (error) {
      logger.error('Update test case error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update test case',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get test case analytics with caching
   */
  static async getTestCaseAnalytics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { projectId } = req.params;
      const userId = req.user?._id;
      const cacheKey = `analytics:testcases:project:${projectId}:user:${userId}`;

      // Try to get from cache first
      if (req.cache) {
        const cachedAnalytics = await req.cache.get(cacheKey, { ttl: 300 }); // 5 minutes
        if (cachedAnalytics) {
          return res.json({
            success: true,
            data: cachedAnalytics,
            cached: true,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Aggregation pipeline for analytics
      const pipeline = [
        { $match: { projectId: projectId } },
        {
          $group: {
            _id: null,
            totalTestCases: { $sum: 1 },
            statusCounts: {
              $push: '$status'
            },
            priorityCounts: {
              $push: '$priority'
            },
            automatedCount: {
              $sum: {
                $cond: [{ $eq: ['$automation.isAutomated', true] }, 1, 0]
              }
            },
            avgStepsCount: {
              $avg: { $size: '$testSteps' }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalTestCases: 1,
            automatedCount: 1,
            automationPercentage: {
              $multiply: [
                { $divide: ['$automatedCount', '$totalTestCases'] },
                100
              ]
            },
            avgStepsCount: { $round: ['$avgStepsCount', 1] },
            statusDistribution: {
              $arrayToObject: {
                $map: {
                  input: { $setUnion: ['$statusCounts'] },
                  as: 'status',
                  in: {
                    k: '$$status',
                    v: {
                      $size: {
                        $filter: {
                          input: '$statusCounts',
                          cond: { $eq: ['$$this', '$$status'] }
                        }
                      }
                    }
                  }
                }
              }
            },
            priorityDistribution: {
              $arrayToObject: {
                $map: {
                  input: { $setUnion: ['$priorityCounts'] },
                  as: 'priority',
                  in: {
                    k: '$$priority',
                    v: {
                      $size: {
                        $filter: {
                          input: '$priorityCounts',
                          cond: { $eq: ['$$this', '$$priority'] }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ];

      const result = await TestCase.aggregate(pipeline);
      const analytics = result[0] || {
        totalTestCases: 0,
        automatedCount: 0,
        automationPercentage: 0,
        avgStepsCount: 0,
        statusDistribution: {},
        priorityDistribution: {}
      };

      // Cache the results
      if (req.cache) {
        await req.cache.set(cacheKey, analytics, { ttl: 300 });
      }

      return res.json({
        success: true,
        data: analytics,
        cached: false,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get test case analytics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve test case analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Helper method to invalidate test case related caches
   */
  private static async invalidateTestCaseCaches(cache: any, testCase: any): Promise<void> {
    if (!cache) return;

    try {
      // Clear cached lists and analytics
      await cache.del(`analytics:testcases:project:${testCase.projectId}`);
      
      // Clear test case specific cache
      await cache.del(`testcase:${testCase._id}`);
      
      // Clear user-specific cached queries (this is approximate)
      // In a real implementation, you might want to use cache tags
      const patterns = [
        `testcases:user:*:query:*`,
        `testcase:${testCase._id}:user:*`
      ];

      for (const pattern of patterns) {
        // Note: This would require implementing a pattern-based cache clearing
        // For now, we'll just log it
        logger.debug(`Would clear cache pattern: ${pattern}`);
      }

      logger.debug(`Invalidated caches for test case ${testCase._id}`);
    } catch (error) {
      logger.error('Error invalidating test case caches:', error);
    }
  }
}

export default TestCaseController; 