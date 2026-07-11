import { NotificationRepository } from '../repository/NotificationRepository.js';

export class NotificationService {
    private notificationRepository = new NotificationRepository();

    async getUserNotifications(userId: number) {
        return await this.notificationRepository.findByUserId(userId);
    }

    async markAsRead(id: number) {
        return await this.notificationRepository.markAsRead(id);
    }

    async markAllRead(userId: number) {
        return await this.notificationRepository.markAllAsRead(userId);
    }
}
