import express from 'express';
import { TestCaseController } from '../controllers/TestCaseController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Test Case CRUD routes
router.get('/', TestCaseController.getAllTestCases);
router.get('/:id', TestCaseController.getTestCaseById);
router.post('/', TestCaseController.createTestCase);
router.put('/:id', TestCaseController.updateTestCase);
router.delete('/:id', TestCaseController.deleteTestCase);

export default router; 