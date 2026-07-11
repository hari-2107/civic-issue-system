"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserRepository_js_1 = require("../repository/UserRepository.js");
const auth_js_1 = require("../security/auth.js");
class UserService {
    userRepository = new UserRepository_js_1.UserRepository();
    async registerCitizen(name, email, password, phone, address) {
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw new Error('User with this email already exists');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await this.userRepository.create({
            name,
            email,
            password: hashedPassword,
            role: 'CITIZEN',
            phone,
            address
        });
        const token = (0, auth_js_1.generateToken)(user);
        // Remove password from returned user object
        delete user.password;
        return { token, user };
    }
    async login(email, password) {
        const hash = await this.userRepository.getPasswordHash(email);
        if (!hash) {
            throw new Error('Invalid email or password');
        }
        const isMatch = await bcryptjs_1.default.compare(password, hash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User account not found');
        }
        const token = (0, auth_js_1.generateToken)(user);
        delete user.password;
        return { token, user };
    }
    async getProfile(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateProfile(id, data) {
        const success = await this.userRepository.update(id, {
            name: data.name,
            phone: data.phone,
            address: data.address,
            profile_picture: data.profile_picture
        });
        if (!success) {
            throw new Error('Failed to update profile or no changes made');
        }
        const updated = await this.userRepository.findById(id);
        return updated;
    }
    async changePassword(id, oldPass, newPass) {
        const user = await this.userRepository.findById(id);
        if (!user)
            throw new Error('User not found');
        const email = (await this.userRepository.findAll()).find(u => u.id === id)?.email;
        if (!email)
            throw new Error('User email not found');
        const hash = await this.userRepository.getPasswordHash(email);
        if (!hash)
            throw new Error('Pass hash lookup failed');
        const isMatch = await bcryptjs_1.default.compare(oldPass, hash);
        if (!isMatch) {
            throw new Error('Incorrect current password');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const newHash = await bcryptjs_1.default.hash(newPass, salt);
        return await this.userRepository.update(id, { password: newHash });
    }
    async resetPassword(email, newPass) {
        // Basic recover/reset password mock helper
        const user = await this.userRepository.findByEmail(email);
        if (!user || !user.id) {
            throw new Error('User with this email does not exist');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const newHash = await bcryptjs_1.default.hash(newPass, salt);
        return await this.userRepository.update(user.id, { password: newHash });
    }
    async listAllUsers() {
        return await this.userRepository.findAll();
    }
    async deleteUser(id) {
        return await this.userRepository.delete(id);
    }
}
exports.UserService = UserService;
