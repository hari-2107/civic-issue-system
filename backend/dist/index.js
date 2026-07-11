"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_js_1 = require("./config/db.js");
const auth_js_1 = require("./security/auth.js");
const UserController_js_1 = require("./controller/UserController.js");
const ComplaintController_js_1 = require("./controller/ComplaintController.js");
const FeedbackController_js_1 = require("./controller/FeedbackController.js");
const NotificationController_js_1 = require("./controller/NotificationController.js");
const ErrorHandler_js_1 = require("./exception/ErrorHandler.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '150mb' }));
app.use(express_1.default.urlencoded({ limit: '150mb', extended: true }));
// Serve uploaded files statically
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express_1.default.static(uploadsDir));
// Initialize Database before starting handling requests
(0, db_js_1.initDatabase)().catch(err => {
    console.error('Fatal database initialization failure:', err);
    process.exit(1);
});
// Controller Instantiations
const userController = new UserController_js_1.UserController();
const complaintController = new ComplaintController_js_1.ComplaintController();
const feedbackController = new FeedbackController_js_1.FeedbackController();
const notificationController = new NotificationController_js_1.NotificationController();
// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Civic issue backend is running' });
});
// Authentication endpoints
app.post('/api/auth/register-citizen', userController.registerCitizen);
app.post('/api/auth/login', userController.login);
app.post('/api/auth/forgot-password', userController.forgotPassword);
app.post('/api/auth/reset-password', userController.resetPassword);
// Profile endpoints (authenticated)
app.get('/api/user/profile', auth_js_1.authenticateJWT, userController.getProfile);
app.put('/api/user/profile', auth_js_1.authenticateJWT, userController.updateProfile);
app.put('/api/user/change-password', auth_js_1.authenticateJWT, userController.changePassword);
// Categories and Departments listings
app.get('/api/categories', async (req, res, next) => {
    try {
        const list = await (0, db_js_1.query)('SELECT * FROM categories ORDER BY name ASC');
        res.json(list);
    }
    catch (err) {
        next(err);
    }
});
app.get('/api/departments', async (req, res, next) => {
    try {
        const list = await (0, db_js_1.query)('SELECT * FROM departments ORDER BY name ASC');
        res.json(list);
    }
    catch (err) {
        next(err);
    }
});
// Complaints Routing
app.post('/api/complaints', auth_js_1.authenticateJWT, (0, auth_js_1.requireRole)(['CITIZEN']), complaintController.create);
app.get('/api/complaints', auth_js_1.authenticateJWT, complaintController.list);
app.get('/api/complaints/:id', auth_js_1.authenticateJWT, complaintController.details);
app.put('/api/complaints/:id/status', auth_js_1.authenticateJWT, (0, auth_js_1.requireRole)(['ADMIN']), complaintController.updateStatus);
app.delete('/api/complaints/:id', auth_js_1.authenticateJWT, complaintController.delete);
// Dashboard Statistics Routing
app.get('/api/citizen/stats', auth_js_1.authenticateJWT, (0, auth_js_1.requireRole)(['CITIZEN']), complaintController.getCitizenStats);
app.get('/api/admin/stats', auth_js_1.authenticateJWT, (0, auth_js_1.requireRole)(['ADMIN']), complaintController.getAdminStats);
// Feedbacks Routing
app.post('/api/feedback', auth_js_1.authenticateJWT, (0, auth_js_1.requireRole)(['CITIZEN']), feedbackController.submit);
app.get('/api/feedback', auth_js_1.authenticateJWT, (0, auth_js_1.requireRole)(['ADMIN']), feedbackController.list);
app.get('/api/feedback/avg-rating', feedbackController.averageRating);
app.get('/api/feedback/:complaintId', auth_js_1.authenticateJWT, feedbackController.getForComplaint);
app.post('/api/feedback/:complaintId/reply', auth_js_1.authenticateJWT, (0, auth_js_1.requireRole)(['ADMIN']), feedbackController.adminReply);
// Notifications Routing
app.get('/api/notifications', auth_js_1.authenticateJWT, notificationController.list);
app.post('/api/notifications/:id/read', auth_js_1.authenticateJWT, notificationController.read);
app.post('/api/notifications/read-all', auth_js_1.authenticateJWT, notificationController.readAll);
// Admin Specific Operations (User Management)
app.get('/api/admin/users', auth_js_1.authenticateJWT, (0, auth_js_1.requireRole)(['ADMIN']), userController.listUsers);
app.delete('/api/admin/users/:id', auth_js_1.authenticateJWT, (0, auth_js_1.requireRole)(['ADMIN']), userController.deleteUser);
// Apply Global Error Handler
app.use(ErrorHandler_js_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
