import { TestCase } from '../models/TestCase';
import { TestRun } from '../models/TestRun';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';

export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
}

export interface DashboardMetrics {
  overview: {
    totalProjects: number;
    totalTestCases: number;
    totalTestRuns: number;
    activeUsers: number;
    averagePassRate: number;
  };
  testCaseMetrics: {
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    automationCoverage: number;
    recentlyCreated: number;
    recentlyUpdated: number;
  };
  testRunMetrics: {
    byStatus: Record<string, number>;
    passRateTrend: Array<{ date: string; passRate: number }>;
    executionTime: {
      average: number;
      fastest: number;
      slowest: number;
    };
    frequentFailures: Array<{
      testCaseId: string;
      title: string;
      failureCount: number;
      lastFailure: Date;
    }>;
  };
  projectMetrics: {
    mostActive: Array<{
      projectId: string;
      name: string;
      testCaseCount: number;
      testRunCount: number;
      passRate: number;
    }>;
    coverage: Array<{
      projectId: string;
      name: string;
      totalTestCases: number;
      automatedTestCases: number;
      coveragePercentage: number;
    }>;
  };
  userMetrics: {
    topContributors: Array<{
      userId: string;
      name: string;
      testCasesCreated: number;
      testRunsExecuted: number;
      contribution: number;
    }>;
    activityTrend: Array<{
      date: string;
      activeUsers: number;
      testCasesCreated: number;
      testRunsExecuted: number;
    }>;
  };
}

export interface CustomReportConfig {
  name: string;
  description?: string;
  filters: {
    projectIds?: string[];
    userIds?: string[];
    dateRange?: AnalyticsPeriod;
    testCaseStatus?: string[];
    testRunStatus?: string[];
    priority?: string[];
    tags?: string[];
  };
  groupBy?: 'project' | 'user' | 'status' | 'priority' | 'date';
  metrics: string[];
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'table';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export class AnalyticsService {
  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(
    userId: string, 
    projectIds?: string[], 
    period?: AnalyticsPeriod
  ): Promise<DashboardMetrics> {
    const cacheKey = `dashboard:${userId}:${projectIds?.join(',') || 'all'}:${period?.startDate.toISOString()}_${period?.endDate.toISOString() || 'current'}`;
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Generating dashboard metrics for user ${userId}`);
        
        // Build base query for user access
        const projectQuery = await this.buildProjectAccessQuery(userId, projectIds);
        
        // Get overview metrics
        const overview = await this.getOverviewMetrics(projectQuery, period);
        
        // Get test case metrics
        const testCaseMetrics = await this.getTestCaseMetrics(projectQuery, period);
        
        // Get test run metrics
        const testRunMetrics = await this.getTestRunMetrics(projectQuery, period);
        
        // Get project metrics
        const projectMetrics = await this.getProjectMetrics(projectQuery, period);
        
        // Get user metrics
        const userMetrics = await this.getUserMetrics(projectQuery, period);
        
        return {
          overview,
          testCaseMetrics,
          testRunMetrics,
          projectMetrics,
          userMetrics
        };
      },
      { ttl: 300 } // Cache for 5 minutes
    );
  }

  /**
   * Generate custom report based on configuration
   */
  async generateCustomReport(
    userId: string,
    config: CustomReportConfig
  ): Promise<any> {
    const cacheKey = `custom-report:${userId}:${Buffer.from(JSON.stringify(config)).toString('base64').slice(0, 20)}`;
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Generating custom report: ${config.name} for user ${userId}`);
        
        // Build aggregation pipeline based on config
        const pipeline = await this.buildCustomReportPipeline(userId, config);
        
        // Execute based on primary data source
        let results;
        if (config.metrics.some(m => m.startsWith('testRun'))) {
          results = await TestRun.aggregate(pipeline);
        } else {
          results = await TestCase.aggregate(pipeline);
        }
        
        // Format results for the specified chart type
        return this.formatReportResults(results, config);
      },
      { ttl: 180 } // Cache for 3 minutes
    );
  }

  /**
   * Get real-time test execution metrics
   */
  async getRealTimeMetrics(projectId: string): Promise<any> {
    const cacheKey = `realtime:${projectId}`;
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        // Get current running test runs
        const runningTests = await TestRun.find({
          projectId,
          status: 'Running'
        }).populate('testCaseId', 'title priority').lean();

        // Get recent test results (last 24 hours)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentResults = await TestRun.find({
          projectId,
          executedAt: { $gte: yesterday }
        }).sort({ executedAt: -1 }).limit(50).lean();

        // Calculate pass rate for last 24 hours
        const passCount = recentResults.filter(r => r.status === 'Passed').length;
        const passRate = recentResults.length > 0 ? (passCount / recentResults.length) * 100 : 0;

        // Get failure trends
        const failuresByHour = await this.getFailuresByHour(projectId, yesterday);

        return {
          runningTests: runningTests.length,
          recentResults: recentResults.length,
          passRate24h: Math.round(passRate),
          failuresByHour,
          currentTests: runningTests.map(test => ({
            id: test._id,
            testCase: test.testCaseId,
            startTime: test.executedAt,
            duration: Date.now() - test.executedAt.getTime()
          }))
        };
      },
      { ttl: 30 } // Cache for 30 seconds for real-time data
    );
  }

  /**
   * Get test coverage analysis
   */
  async getTestCoverageAnalysis(
    userId: string,
    projectId?: string
  ): Promise<any> {
    const cacheKey = `coverage:${userId}:${projectId || 'all'}`;
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const projectQuery = await this.buildProjectAccessQuery(userId, projectId ? [projectId] : undefined);
        
        const pipeline = [
          { $match: projectQuery },
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
            $group: {
              _id: {
                project: '$projectId',
                module: '$moduleId',
                feature: '$featureId'
              },
              totalTests: { $sum: 1 },
              automatedTests: {
                $sum: {
                  $cond: [{ $eq: ['$automation.isAutomated', true] }, 1, 0]
                }
              },
              passedTests: {
                $sum: {
                  $cond: [{ $eq: ['$lastRunStatus', 'Passed'] }, 1, 0]
                }
              },
              projectName: { $first: { $arrayElemAt: ['$project.name', 0] } },
              moduleName: { $first: { $arrayElemAt: ['$module.name', 0] } },
              featureName: { $first: { $arrayElemAt: ['$feature.name', 0] } }
            }
          },
          {
            $project: {
              _id: 0,
              project: '$_id.project',
              module: '$_id.module',
              feature: '$_id.feature',
              projectName: 1,
              moduleName: 1,
              featureName: 1,
              totalTests: 1,
              automatedTests: 1,
              passedTests: 1,
              automationCoverage: {
                $multiply: [
                  { $divide: ['$automatedTests', '$totalTests'] },
                  100
                ]
              },
              passRate: {
                $multiply: [
                  { $divide: ['$passedTests', '$totalTests'] },
                  100
                ]
              }
            }
          },
          { $sort: { automationCoverage: -1 } }
        ];

        const results = await TestCase.aggregate(pipeline);
        
        // Calculate overall coverage
        const totalTests = results.reduce((sum, item) => sum + item.totalTests, 0);
        const totalAutomated = results.reduce((sum, item) => sum + item.automatedTests, 0);
        const overallCoverage = totalTests > 0 ? (totalAutomated / totalTests) * 100 : 0;

        return {
          overallCoverage: Math.round(overallCoverage),
          totalTestCases: totalTests,
          automatedTestCases: totalAutomated,
          coverageByModule: results,
          recommendations: this.getCoverageRecommendations(results)
        };
      },
      { ttl: 600 } // Cache for 10 minutes
    );
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(
    userId: string,
    projectId?: string,
    period: AnalyticsPeriod = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    }
  ): Promise<any> {
    const cacheKey = `trends:${userId}:${projectId || 'all'}:${period.startDate.toISOString()}_${period.endDate.toISOString()}`;
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const projectQuery = await this.buildProjectAccessQuery(userId, projectId ? [projectId] : undefined);
        
        // Daily execution trends
        const executionTrends = await TestRun.aggregate([
          {
            $match: {
              ...projectQuery,
              executedAt: {
                $gte: period.startDate,
                $lte: period.endDate
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$executedAt'
                }
              },
              totalRuns: { $sum: 1 },
              passedRuns: {
                $sum: { $cond: [{ $eq: ['$status', 'Passed'] }, 1, 0] }
              },
              failedRuns: {
                $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] }
              },
              avgDuration: { $avg: '$duration' }
            }
          },
          {
            $project: {
              date: '$_id',
              totalRuns: 1,
              passedRuns: 1,
              failedRuns: 1,
              passRate: {
                $multiply: [
                  { $divide: ['$passedRuns', '$totalRuns'] },
                  100
                ]
              },
              avgDuration: { $round: ['$avgDuration', 2] }
            }
          },
          { $sort: { date: 1 } }
        ]);

        // Test case creation trends
        const creationTrends = await TestCase.aggregate([
          {
            $match: {
              ...projectQuery,
              createdAt: {
                $gte: period.startDate,
                $lte: period.endDate
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              },
              testCasesCreated: { $sum: 1 },
              automatedCreated: {
                $sum: { $cond: [{ $eq: ['$automation.isAutomated', true] }, 1, 0] }
              }
            }
          },
          {
            $project: {
              date: '$_id',
              testCasesCreated: 1,
              automatedCreated: 1,
              automationRate: {
                $multiply: [
                  { $divide: ['$automatedCreated', '$testCasesCreated'] },
                  100
                ]
              }
            }
          },
          { $sort: { date: 1 } }
        ]);

        return {
          period,
          executionTrends,
          creationTrends,
          summary: {
            totalExecutions: executionTrends.reduce((sum, day) => sum + day.totalRuns, 0),
            averagePassRate: executionTrends.length > 0 
              ? executionTrends.reduce((sum, day) => sum + day.passRate, 0) / executionTrends.length 
              : 0,
            totalTestCasesCreated: creationTrends.reduce((sum, day) => sum + day.testCasesCreated, 0)
          }
        };
      },
      { ttl: 900 } // Cache for 15 minutes
    );
  }

  /**
   * Export report data in various formats
   */
  async exportReport(
    userId: string,
    reportType: 'dashboard' | 'custom' | 'coverage' | 'trends',
    config: any,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<any> {
    let data;
    
    switch (reportType) {
      case 'dashboard':
        data = await this.getDashboardMetrics(userId, config.projectIds, config.period);
        break;
      case 'custom':
        data = await this.generateCustomReport(userId, config);
        break;
      case 'coverage':
        data = await this.getTestCoverageAnalysis(userId, config.projectId);
        break;
      case 'trends':
        data = await this.getPerformanceTrends(userId, config.projectId, config.period);
        break;
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    // Format based on export type
    switch (format) {
      case 'csv':
        return this.convertToCSV(data, reportType);
      case 'pdf':
        return this.generatePDFReport(data, reportType);
      case 'json':
      default:
        return {
          format: 'json',
          data,
          generatedAt: new Date().toISOString(),
          exportedBy: userId
        };
    }
  }

  // Private helper methods

  private async buildProjectAccessQuery(userId: string, projectIds?: string[]): Promise<any> {
    let query: any = {};

    if (projectIds) {
      query.projectId = { $in: projectIds };
    }

    // Add user access control
    const userProjects = await Project.find({
      $or: [
        { createdBy: userId },
        { 'teamMembers.userId': userId },
        { visibility: 'Public' }
      ]
    }).select('_id').lean();

    const accessibleProjectIds = userProjects.map(p => p._id);
    
    if (query.projectId) {
      query.projectId.$in = query.projectId.$in.filter((id: string) => 
        accessibleProjectIds.some(apId => apId.toString() === id)
      );
    } else {
      query.projectId = { $in: accessibleProjectIds };
    }

    return query;
  }

  private async getOverviewMetrics(projectQuery: any, period?: AnalyticsPeriod): Promise<any> {
    const dateFilter = period ? {
      createdAt: { $gte: period.startDate, $lte: period.endDate }
    } : {};

    const [projectCount, testCaseCount, testRunCount] = await Promise.all([
      Project.countDocuments({ _id: { $in: projectQuery.projectId.$in } }),
      TestCase.countDocuments({ ...projectQuery, ...dateFilter }),
      TestRun.countDocuments({ ...projectQuery, ...dateFilter })
    ]);

    // Calculate average pass rate
    const passRateResult = await TestRun.aggregate([
      { $match: { ...projectQuery, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalRuns: { $sum: 1 },
          passedRuns: { $sum: { $cond: [{ $eq: ['$status', 'Passed'] }, 1, 0] } }
        }
      }
    ]);

    const averagePassRate = passRateResult[0]?.totalRuns > 0 
      ? (passRateResult[0].passedRuns / passRateResult[0].totalRuns) * 100 
      : 0;

    return {
      totalProjects: projectCount,
      totalTestCases: testCaseCount,
      totalTestRuns: testRunCount,
      activeUsers: 0, // TODO: Calculate based on recent activity
      averagePassRate: Math.round(averagePassRate)
    };
  }

  
  private async getTestCaseMetrics(projectQuery: any, period?: AnalyticsPeriod): Promise<any> {
    const dateFilter = period ? {
      createdAt: { $gte: period.startDate, $lte: period.endDate }
    } : {};

    const pipeline = [
      { $match: { ...projectQuery, ...dateFilter } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byStatus: {
            $push: '$status'
          },
          byPriority: {
            $push: '$priority'
          },
          automatedCount: {
            $sum: { $cond: [{ $eq: ['$automation.isAutomated', true] }, 1, 0] }
          }
        }
      }
    ];

    const result = await TestCase.aggregate(pipeline);
    const data = result[0] || { total: 0, byStatus: [], byPriority: [], automatedCount: 0 };

    // Process status distribution
    const statusCounts = data.byStatus.reduce((acc: any, status: string) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Process priority distribution
    const priorityCounts = data.byPriority.reduce((acc: any, priority: string) => {
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    return {
      byStatus: statusCounts,
      byPriority: priorityCounts,
      automationCoverage: data.total > 0 ? Math.round((data.automatedCount / data.total) * 100) : 0,
      recentlyCreated: data.total, // In the date range if period is specified
      recentlyUpdated: 0 // TODO: Calculate based on updatedAt
    };
  }

  private async getTestRunMetrics(projectQuery: any, period?: AnalyticsPeriod): Promise<any> {
    const dateFilter = period ? {
      executedAt: { $gte: period.startDate, $lte: period.endDate }
    } : {};

    // Status distribution
    const statusResult = await TestRun.aggregate([
      { $match: { ...projectQuery, ...dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const byStatus = statusResult.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Execution time metrics
    const timeResult = await TestRun.aggregate([
      { $match: { ...projectQuery, ...dateFilter, duration: { $exists: true } } },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          minDuration: { $min: '$duration' },
          maxDuration: { $max: '$duration' }
        }
      }
    ]);

    const executionTime = timeResult[0] || { avgDuration: 0, minDuration: 0, maxDuration: 0 };

    return {
      byStatus,
      passRateTrend: [], // TODO: Implement trend calculation
      executionTime: {
        average: Math.round(executionTime.avgDuration),
        fastest: executionTime.minDuration,
        slowest: executionTime.maxDuration
      },
      frequentFailures: [] // TODO: Implement failure analysis
    };
  }

  private async getProjectMetrics(projectQuery: any, period?: AnalyticsPeriod): Promise<any> {
    // Most active projects
    const mostActive = await Project.aggregate([
      { $match: { _id: { $in: projectQuery.projectId.$in } } },
      {
        $lookup: {
          from: 'testcases',
          localField: '_id',
          foreignField: 'projectId',
          as: 'testCases'
        }
      },
      {
        $lookup: {
          from: 'testruns',
          localField: '_id',
          foreignField: 'projectId',
          as: 'testRuns'
        }
      },
      {
        $project: {
          name: 1,
          testCaseCount: { $size: '$testCases' },
          testRunCount: { $size: '$testRuns' },
          passRate: 0 // TODO: Calculate pass rate
        }
      },
      { $sort: { testRunCount: -1 } },
      { $limit: 10 }
    ]);

    return {
      mostActive,
      coverage: [] // TODO: Implement coverage calculation
    };
  }

  private async getUserMetrics(projectQuery: any, period?: AnalyticsPeriod): Promise<any> {
    return {
      topContributors: [], // TODO: Implement contributor analysis
      activityTrend: [] // TODO: Implement activity trend
    };
  }

  private async buildCustomReportPipeline(userId: string, config: CustomReportConfig): Promise<any[]> {
    // TODO: Implement custom report pipeline builder
    return [];
  }

  private formatReportResults(results: any[], config: CustomReportConfig): any {
    // TODO: Implement result formatting based on chart type
    return {
      chartType: config.chartType,
      data: results,
      config
    };
  }

  private async getFailuresByHour(projectId: string, since: Date): Promise<any[]> {
    // TODO: Implement hourly failure analysis
    return [];
  }

  private getCoverageRecommendations(results: any[]): string[] {
    const recommendations = [];
    
    results.forEach(item => {
      if (item.automationCoverage < 30) {
        recommendations.push(`Consider increasing automation coverage for ${item.moduleName || 'module'} (currently ${Math.round(item.automationCoverage)}%)`);
      }
      if (item.passRate < 70) {
        recommendations.push(`Review failing tests in ${item.moduleName || 'module'} (pass rate: ${Math.round(item.passRate)}%)`);
      }
    });

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private convertToCSV(data: any, reportType: string): string {
    // TODO: Implement CSV conversion
    return 'CSV conversion not implemented yet';
  }

  private generatePDFReport(data: any, reportType: string): Buffer {
    // TODO: Implement PDF generation
    throw new Error('PDF generation not implemented yet');
  }
}

export const analyticsService = new AnalyticsService(); 