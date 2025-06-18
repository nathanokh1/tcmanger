import express from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { authMiddleware } from '../middleware/auth';
import { validateProjectCreation, validateProjectUpdate } from '../validators/project';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Project CRUD routes
router.get('/', ProjectController.getAllProjects);
router.get('/:id', ProjectController.getProjectById);
router.post('/', validateProjectCreation, ProjectController.createProject);
router.put('/:id', validateProjectUpdate, ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

// Team management routes
router.post('/:id/members', ProjectController.addTeamMember);
router.delete('/:id/members/:memberId', ProjectController.removeTeamMember);
router.put('/:id/members/:memberId/role', ProjectController.updateTeamMemberRole);

export default router; 