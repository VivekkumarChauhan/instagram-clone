import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return res.json(result);
    } catch (e: any) {
      return res.status(400).json({ message: e.message || 'Login failed' });
    }
  }

  public static async signup(req: Request, res: Response) {
    try {
      const { email, username, fullName, password, phone } = req.body;
      const result = await AuthService.signup(email, username, fullName, password, phone);
      return res.json(result);
    } catch (e: any) {
      return res.status(400).json({ message: e.message || 'Sign up failed' });
    }
  }

  public static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const result = await AuthService.verifyOtpAndRegister(email, otp);
      return res.json(result);
    } catch (e: any) {
      return res.status(400).json({ message: e.message || 'OTP verification failed' });
    }
  }

  public static async updateProfile(req: Request, res: Response) {
    try {
      const { email, ...updateData } = req.body;
      const result = await AuthService.updateProfile(email, updateData);
      return res.json(result);
    } catch (e: any) {
      return res.status(400).json({ message: e.message || 'Profile update failed' });
    }
  }

  public static async logout(req: Request, res: Response) {
    return res.json({ success: true, message: 'Logged out successfully' });
  }
}
