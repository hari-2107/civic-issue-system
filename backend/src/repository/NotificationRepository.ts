import { run, query } from '../config/db.js';
import { Notification } from '../entity/types.js';

export class NotificationRepository {
    async create(notification: Notification): Promise<Notification> {
        const result = await run(
            'INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, 0)',
            [notification.user_id, notification.title, notification.message]
        );
        return { ...notification, id: result.lastID, is_read: 0 };
    }

    async findByUserId(userId: number): Promise<Notification[]> {
        return await query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [userId]
        );
    }

    async markAsRead(id: number): Promise<boolean> {
        const result = await run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
        return result.changes > 0;
    }

    async markAllAsRead(userId: number): Promise<boolean> {
        const result = await run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
        return result.changes > 0;
    }
}
