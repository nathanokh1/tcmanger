import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Test Runs endpoint - coming soon' });
});

export { router as testRunRoutes }; 