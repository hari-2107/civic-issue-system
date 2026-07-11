"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const NotificationService_js_1 = require("../service/NotificationService.js");
class NotificationController {
    notificationService = new NotificationService_js_1.NotificationService();
    list = async (req, res, next) => {
        try {
            const list = await this.notificationService.getUserNotifications(req.user.id);
            res.json(list);
        }
        catch (err) {
            next(err);
        }
    };
    read = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            const success = await this.notificationService.markAsRead(id);
            res.json({ success });
        }
        catch (err) {
            next(err);
        }
    };
    readAll = async (req, res, next) => {
        try {
            const success = await this.notificationService.markAllRead(req.user.id);
            res.json({ success });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.NotificationController = NotificationController;
