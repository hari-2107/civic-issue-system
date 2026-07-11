import { Response, NextFunction } from 'express';
import { NotificationService } from '../service/NotificationService.js';
import { AuthenticatedRequest } from '../security/auth.js';

export class NotificationController {
    private notificationService = new NotificationService();

    list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const list = await this.notificationService.getUserNotifications(req.user!.id);
            res.json(list);
        } catch (err) {
            next(err);
        }
    };

    read = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const success = await this.notificationService.markAsRead(id);
            res.json({ success });
        } catch (err) {
            next(err);
        }
    };

    readAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const success = await this.notificationService.markAllRead(req.user!.id);
            res.json({ success });
        } catch (err) {
            next(err);
        }
    };
}
