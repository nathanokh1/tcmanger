import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { analyticsService } from '../services/analyticsService';

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
  };
}

export class AnalyticsController {

  /**
   * Get comprehensive dashboard metrics
   */
  static async getDashboardMetrics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { projectIds, startDate, endDate } = req.query;
      
      // Parse project IDs if provided
      const parsedProjectIds = projectIds 
        ? (projectIds as string).split(',').filter(Boolean)
        : undefined;

      // Parse date range if provided
      let period;
      if (startDate && endDate) {
        period = {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string)
        };
      }

      const metrics = await analyticsService.getDashboardMetrics(
        userId,
        parsedProjectIds,
        period
      );

      logger.info(`Dashboard metrics generated for user ${userId}`);
      return res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get dashboard metrics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get project-specific statistics
   */
  static async getProjectStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { projectId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const stats = await analyticsService.getProjectStats(projectId);

      return res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get project stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve project statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get test coverage analysis
   */
  static async getTestCoverageAnalysis(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { projectId } = req.query;
      
      const coverage = await analyticsService.getTestCoverageAnalysis(
        userId,
        projectId as string
      );

      return res.json({
        success: true,
        data: coverage,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get test coverage analysis error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve test coverage analysis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get performance trends over time
   */
  static async getPerformanceTrends(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { projectId, startDate, endDate } = req.query;
      
      // Parse date range
      let period;
      if (startDate && endDate) {
        period = {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string)
        };
      }

      const trends = await analyticsService.getPerformanceTrends(
        userId,
        projectId as string,
        period
      );

      return res.json({
        success: true,
        data: trends,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get performance trends error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve performance trends',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get real-time metrics for a project
   */
  static async getRealTimeMetrics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { projectId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const metrics = await analyticsService.getRealTimeMetrics(projectId);

      return res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get real-time metrics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve real-time metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate custom report
   */
  static async generateCustomReport(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const config = req.body;
      
      // Validate required fields
      if (!config.name || !config.metrics || !Array.isArray(config.metrics)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid report configuration. Name and metrics are required.'
        });
      }

      const report = await analyticsService.generateCustomReport(userId, config);

      // Broadcast report generation via Socket.io
      if (req.socketService) {
        req.socketService.sendNotification({
          type: 'info',
          title: 'Custom Report Generated',
          message: `Report "${config.name}" has been generated successfully`,
          userId
        });
      }

      logger.info(`Custom report "${config.name}" generated for user ${userId}`);
      return res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Generate custom report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate custom report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Export report data
   */
  static async exportReport(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { reportType, format = 'json' } = req.query;
      const config = req.body;

      if (!reportType) {
        return res.status(400).json({
          success: false,
          message: 'Report type is required'
        });
      }

      const exportData = await analyticsService.exportReport(
        userId,
        reportType as any,
        config,
        format as any
      );

      // Set appropriate headers based on format
      switch (format) {
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.csv"`);
          break;
        case 'pdf':
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.pdf"`);
          break;
        case 'json':
        default:
          res.setHeader('Content-Type', 'application/json');
          break;
      }

      logger.info(`Report exported: ${reportType} (${format}) for user ${userId}`);
      return res.json({
        success: true,
        data: exportData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Export report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get analytics summary for quick overview
   */
  static async getAnalyticsSummary(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Get basic metrics quickly
      const [dashboardMetrics, coverageAnalysis] = await Promise.all([
        analyticsService.getDashboardMetrics(userId),
        analyticsService.getTestCoverageAnalysis(userId)
      ]);

      const summary = {
        quickStats: {
          totalProjects: dashboardMetrics.overview.totalProjects,
          totalTestCases: dashboardMetrics.overview.totalTestCases,
          totalTestRuns: dashboardMetrics.overview.totalTestRuns,
          averagePassRate: dashboardMetrics.overview.averagePassRate,
          overallCoverage: coverageAnalysis.overallCoverage
        },
        alerts: [],
        recommendations: []
      };

      // Add alerts based on metrics
      if (dashboardMetrics.overview.averagePassRate < 70) {
        summary.alerts.push({
          type: 'warning',
          message: `Average pass rate is ${dashboardMetrics.overview.averagePassRate}% - consider reviewing failing tests`
        });
      }

      if (coverageAnalysis.overallCoverage < 50) {
        summary.alerts.push({
          type: 'info',
          message: `Automation coverage is ${coverageAnalysis.overallCoverage}% - consider increasing test automation`
        });
      }

      // Add recommendations
      if (dashboardMetrics.overview.totalTestCases > 100 && coverageAnalysis.overallCoverage < 70) {
        summary.recommendations.push('Consider implementing more automated tests to improve coverage');
      }

      return res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get analytics summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get available analytics features and capabilities
   */
  static async getAnalyticsCapabilities(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const capabilities = {
        dashboardMetrics: {
          available: true,
          description: 'Comprehensive dashboard with overview, test case, and test run metrics',
          endpoints: ['/api/analytics/dashboard']
        },
        projectStats: {
          available: true,
          description: 'Real-time project statistics and performance metrics',
          endpoints: ['/api/analytics/projects/:projectId/stats']
        },
        coverageAnalysis: {
          available: true,
          description: 'Test coverage analysis with automation coverage tracking',
          endpoints: ['/api/analytics/coverage']
        },
        performanceTrends: {
          available: true,
          description: 'Performance trends and historical analysis over time',
          endpoints: ['/api/analytics/trends']
        },
        realTimeMetrics: {
          available: true,
          description: 'Live test execution monitoring and real-time updates',
          endpoints: ['/api/analytics/projects/:projectId/realtime']
        },
        customReports: {
          available: true,
          description: 'Generate custom reports with configurable metrics and filters',
          endpoints: ['/api/analytics/reports/custom']
        },
        exportCapabilities: {
          available: true,
          description: 'Export reports in JSON, CSV, and PDF formats',
          formats: ['json', 'csv', 'pdf'],
          endpoints: ['/api/analytics/export']
        },
        caching: {
          enabled: true,
          description: 'Redis caching for improved performance',
          cacheDurations: {
            dashboard: '5 minutes',
            projectStats: '3 minutes',
            coverage: '10 minutes',
            realTime: '30 seconds'
          }
        }
      };

      return res.json({
        success: true,
        data: capabilities,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get analytics capabilities error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics capabilities',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default AnalyticsController; 