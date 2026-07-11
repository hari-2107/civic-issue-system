import { Response, NextFunction } from 'express';
import { UserService } from '../service/UserService.js';
import { AuthenticatedRequest } from '../security/auth.js';

export class UserController {
    private userService = new UserService();

    registerCitizen = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { name, email, password, phone, address } = req.body;
            const result = await this.userService.registerCitizen(name, email, password, phone, address);
            res.status(201).json(result);
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    };

    login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const result = await this.userService.login(email, password);
            res.json(result);
        } catch (err) {
            res.status(401).json({ error: (err as Error).message });
        }
    };

    getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const citizen = await this.userService.getProfile(req.user!.id);
            res.json(citizen);
        } catch (err) {
            next(err);
        }
    };

    updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const updated = await this.userService.updateProfile(req.user!.id, req.body);
            res.json(updated);
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    };

    changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { oldPassword, newPassword } = req.body;
            const success = await this.userService.changePassword(req.user!.id, oldPassword, newPassword);
            res.json({ success, message: 'Password changed successfully' });
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    };

    forgotPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            // In a real system we send email with a token. Here we mock it by returning success.
            res.json({ message: 'If the email exists, a password reset link has been dispatched.', email });
        } catch (err) {
            next(err);
        }
    };

    resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { email, newPassword } = req.body;
            await this.userService.resetPassword(email, newPassword);
            res.json({ message: 'Password has been set successfully' });
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    };

    // Admin section
    listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.listAllUsers();
            res.json(users);
        } catch (err) {
            next(err);
        }
    };

    deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const success = await this.userService.deleteUser(parseInt(req.params.id));
            res.json({ success, message: 'User deleted successfully' });
        } catch (err) {
            next(err);
        }
    };
}
