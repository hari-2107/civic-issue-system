import bcrypt from 'bcryptjs';
import { UserRepository } from '../repository/UserRepository.js';
import { User } from '../entity/types.js';
import { generateToken } from '../security/auth.js';

export class UserService {
    private userRepository = new UserRepository();

    async registerCitizen(name: string, email: string, password: string, phone?: string, address?: string) {
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw new Error('User with this email already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await this.userRepository.create({
            name,
            email,
            password: hashedPassword,
            role: 'CITIZEN',
            phone,
            address
        });

        const token = generateToken(user);
        // Remove password from returned user object
        delete user.password;

        return { token, user };
    }

    async login(email: string, password: string) {
        const hash = await this.userRepository.getPasswordHash(email);
        if (!hash) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, hash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User account not found');
        }

        const token = generateToken(user);
        delete user.password;

        return { token, user };
    }

    async getProfile(id: number) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async updateProfile(id: number, data: Partial<User>) {
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

    async changePassword(id: number, oldPass: string, newPass: string) {
        const user = await this.userRepository.findById(id);
        if (!user) throw new Error('User not found');

        const email = (await this.userRepository.findAll()).find(u => u.id === id)?.email;
        if (!email) throw new Error('User email not found');

        const hash = await this.userRepository.getPasswordHash(email);
        if (!hash) throw new Error('Pass hash lookup failed');

        const isMatch = await bcrypt.compare(oldPass, hash);
        if (!isMatch) {
            throw new Error('Incorrect current password');
        }

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPass, salt);

        return await this.userRepository.update(id, { password: newHash });
    }

    async resetPassword(email: string, newPass: string) {
        // Basic recover/reset password mock helper
        const user = await this.userRepository.findByEmail(email);
        if (!user || !user.id) {
            throw new Error('User with this email does not exist');
        }

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPass, salt);
        return await this.userRepository.update(user.id, { password: newHash });
    }

    async listAllUsers() {
        return await this.userRepository.findAll();
    }

    async deleteUser(id: number) {
        return await this.userRepository.delete(id);
    }
}
