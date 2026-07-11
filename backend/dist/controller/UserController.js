"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserService_js_1 = require("../service/UserService.js");
class UserController {
    userService = new UserService_js_1.UserService();
    registerCitizen = async (req, res, next) => {
        try {
            const { name, email, password, phone, address } = req.body;
            const result = await this.userService.registerCitizen(name, email, password, phone, address);
            res.status(201).json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const result = await this.userService.login(email, password);
            res.json(result);
        }
        catch (err) {
            res.status(401).json({ error: err.message });
        }
    };
    getProfile = async (req, res, next) => {
        try {
            const citizen = await this.userService.getProfile(req.user.id);
            res.json(citizen);
        }
        catch (err) {
            next(err);
        }
    };
    updateProfile = async (req, res, next) => {
        try {
            const updated = await this.userService.updateProfile(req.user.id, req.body);
            res.json(updated);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    changePassword = async (req, res, next) => {
        try {
            const { oldPassword, newPassword } = req.body;
            const success = await this.userService.changePassword(req.user.id, oldPassword, newPassword);
            res.json({ success, message: 'Password changed successfully' });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            // In a real system we send email with a token. Here we mock it by returning success.
            res.json({ message: 'If the email exists, a password reset link has been dispatched.', email });
        }
        catch (err) {
            next(err);
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            const { email, newPassword } = req.body;
            await this.userService.resetPassword(email, newPassword);
            res.json({ message: 'Password has been set successfully' });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    // Admin section
    listUsers = async (req, res, next) => {
        try {
            const users = await this.userService.listAllUsers();
            res.json(users);
        }
        catch (err) {
            next(err);
        }
    };
    deleteUser = async (req, res, next) => {
        try {
            const success = await this.userService.deleteUser(parseInt(req.params.id));
            res.json({ success, message: 'User deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.UserController = UserController;
