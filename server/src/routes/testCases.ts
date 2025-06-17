import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Test Cases endpoint - coming soon' });
});

export { router as testCaseRoutes }; 