"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const db_js_1 = require("../config/db.js");
class NotificationRepository {
    async create(notification) {
        const result = await (0, db_js_1.run)('INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, 0)', [notification.user_id, notification.title, notification.message]);
        return { ...notification, id: result.lastID, is_read: 0 };
    }
    async findByUserId(userId) {
        return await (0, db_js_1.query)('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
    }
    async markAsRead(id) {
        const result = await (0, db_js_1.run)('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
        return result.changes > 0;
    }
    async markAllAsRead(userId) {
        const result = await (0, db_js_1.run)('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
        return result.changes > 0;
    }
}
exports.NotificationRepository = NotificationRepository;
