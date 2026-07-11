"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const NotificationRepository_js_1 = require("../repository/NotificationRepository.js");
class NotificationService {
    notificationRepository = new NotificationRepository_js_1.NotificationRepository();
    async getUserNotifications(userId) {
        return await this.notificationRepository.findByUserId(userId);
    }
    async markAsRead(id) {
        return await this.notificationRepository.markAsRead(id);
    }
    async markAllRead(userId) {
        return await this.notificationRepository.markAllAsRead(userId);
    }
}
exports.NotificationService = NotificationService;
