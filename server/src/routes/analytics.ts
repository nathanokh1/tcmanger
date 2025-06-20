import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import AnalyticsController from '../controllers/AnalyticsController';

const router = Router();

// Apply authentication middleware to all analytics routes
router.use(authMiddleware);

/**
 * @route GET /api/analytics/capabilities
 * @desc Get available analytics features and capabilities
 * @access Private
 */
router.get('/capabilities', AnalyticsController.getAnalyticsCapabilities);

/**
 * @route GET /api/analytics/dashboard
 * @desc Get comprehensive dashboard metrics
 * @query projectIds - Comma-separated project IDs (optional)
 * @query startDate - Start date for filtering (optional)
 * @query endDate - End date for filtering (optional)
 * @access Private
 */
router.get('/dashboard', AnalyticsController.getDashboardMetrics);

/**
 * @route GET /api/analytics/summary
 * @desc Get analytics summary for quick overview
 * @access Private
 */
router.get('/summary', AnalyticsController.getAnalyticsSummary);

/**
 * @route GET /api/analytics/projects/:projectId/stats
 * @desc Get project-specific statistics
 * @param projectId - Project ID
 * @access Private
 */
router.get('/projects/:projectId/stats', AnalyticsController.getProjectStats);

/**
 * @route GET /api/analytics/projects/:projectId/realtime
 * @desc Get real-time metrics for a project
 * @param projectId - Project ID
 * @access Private
 */
router.get('/projects/:projectId/realtime', AnalyticsController.getRealTimeMetrics);

/**
 * @route GET /api/analytics/coverage
 * @desc Get test coverage analysis
 * @query projectId - Specific project ID (optional)
 * @access Private
 */
router.get('/coverage', AnalyticsController.getTestCoverageAnalysis);

/**
 * @route GET /api/analytics/trends
 * @desc Get performance trends over time
 * @query projectId - Specific project ID (optional)
 * @query startDate - Start date for trend analysis (optional)
 * @query endDate - End date for trend analysis (optional)
 * @access Private
 */
router.get('/trends', AnalyticsController.getPerformanceTrends);

/**
 * @route POST /api/analytics/reports/custom
 * @desc Generate custom report
 * @body CustomReportConfig - Report configuration
 * @access Private
 */
router.post('/reports/custom', AnalyticsController.generateCustomReport);

/**
 * @route POST /api/analytics/export
 * @desc Export report data
 * @query reportType - Type of report to export
 * @query format - Export format (json, csv, pdf)
 * @body Report configuration
 * @access Private
 */
router.post('/export', AnalyticsController.exportReport);

export { router as analyticsRoutes }; 