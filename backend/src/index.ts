import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initDatabase, query } from './config/db.js';
import { authenticateJWT, requireRole } from './security/auth.js';
import { UserController } from './controller/UserController.js';
import { ComplaintController } from './controller/ComplaintController.js';
import { FeedbackController } from './controller/FeedbackController.js';
import { NotificationController } from './controller/NotificationController.js';
import { errorHandler } from './exception/ErrorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// Serve uploaded files statically
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Initialize Database before starting handling requests
initDatabase().catch(err => {
    console.error('Fatal database initialization failure:', err);
    process.exit(1);
});

// Controller Instantiations
const userController = new UserController();
const complaintController = new ComplaintController();
const feedbackController = new FeedbackController();
const notificationController = new NotificationController();

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
app.get('/api/user/profile', authenticateJWT, userController.getProfile);
app.put('/api/user/profile', authenticateJWT, userController.updateProfile);
app.put('/api/user/change-password', authenticateJWT, userController.changePassword);

// Categories and Departments listings
app.get('/api/categories', async (req, res, next) => {
    try {
        const list = await query('SELECT * FROM categories ORDER BY name ASC');
        res.json(list);
    } catch (err) {
        next(err);
    }
});
app.get('/api/departments', async (req, res, next) => {
    try {
        const list = await query('SELECT * FROM departments ORDER BY name ASC');
        res.json(list);
    } catch (err) {
        next(err);
    }
});

// Complaints Routing
app.post('/api/complaints', authenticateJWT, requireRole(['CITIZEN']), complaintController.create);
app.get('/api/complaints', authenticateJWT, complaintController.list);
app.get('/api/complaints/:id', authenticateJWT, complaintController.details);
app.put('/api/complaints/:id/status', authenticateJWT, requireRole(['ADMIN']), complaintController.updateStatus);
app.delete('/api/complaints/:id', authenticateJWT, complaintController.delete);

// Dashboard Statistics Routing
app.get('/api/citizen/stats', authenticateJWT, requireRole(['CITIZEN']), complaintController.getCitizenStats);
app.get('/api/admin/stats', authenticateJWT, requireRole(['ADMIN']), complaintController.getAdminStats);

// Feedbacks Routing
app.post('/api/feedback', authenticateJWT, requireRole(['CITIZEN']), feedbackController.submit);
app.get('/api/feedback', authenticateJWT, requireRole(['ADMIN']), feedbackController.list);
app.get('/api/feedback/avg-rating', feedbackController.averageRating);
app.get('/api/feedback/:complaintId', authenticateJWT, feedbackController.getForComplaint);
app.post('/api/feedback/:complaintId/reply', authenticateJWT, requireRole(['ADMIN']), feedbackController.adminReply);

// Notifications Routing
app.get('/api/notifications', authenticateJWT, notificationController.list);
app.post('/api/notifications/:id/read', authenticateJWT, notificationController.read);
app.post('/api/notifications/read-all', authenticateJWT, notificationController.readAll);

// Admin Specific Operations (User Management)
app.get('/api/admin/users', authenticateJWT, requireRole(['ADMIN']), userController.listUsers);
app.delete('/api/admin/users/:id', authenticateJWT, requireRole(['ADMIN']), userController.deleteUser);

// Apply Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
