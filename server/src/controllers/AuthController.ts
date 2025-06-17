import { Request, Response } from 'express';

export class AuthController {
  async register(req: Request, res: Response) {
    res.json({ message: 'Register endpoint - coming soon' });
  }

  async login(req: Request, res: Response) {
    res.json({ message: 'Login endpoint - coming soon' });
  }

  async logout(req: Request, res: Response) {
    res.json({ message: 'Logout endpoint - coming soon' });
  }

  async refreshToken(req: Request, res: Response) {
    res.json({ message: 'Refresh token endpoint - coming soon' });
  }

  async getProfile(req: Request, res: Response) {
    res.json({ message: 'Get profile endpoint - coming soon' });
  }

  async updateProfile(req: Request, res: Response) {
    res.json({ message: 'Update profile endpoint - coming soon' });
  }

  async changePassword(req: Request, res: Response) {
    res.json({ message: 'Change password endpoint - coming soon' });
  }
} 