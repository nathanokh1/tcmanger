import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented
router.get('/', (req, res) => {
  res.json({ message: 'Projects endpoint - coming soon' });
});

export { router as projectRoutes }; 