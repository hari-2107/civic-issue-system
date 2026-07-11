"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const db_js_1 = require("../config/db.js");
class UserRepository {
    async findByEmail(email) {
        const row = await (0, db_js_1.get)('SELECT * FROM users WHERE email = ?', [email]);
        return row || null;
    }
    async findById(id) {
        const row = await (0, db_js_1.get)('SELECT * FROM users WHERE id = ?', [id]);
        if (row) {
            // Don't leak password by default
            const { password, ...userWithoutPass } = row;
            return userWithoutPass;
        }
        return null;
    }
    async getPasswordHash(email) {
        const row = await (0, db_js_1.get)('SELECT password FROM users WHERE email = ?', [email]);
        return row ? row.password : null;
    }
    async create(user) {
        const result = await (0, db_js_1.run)(`INSERT INTO users (name, email, phone, address, password, role, profile_picture) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            user.name,
            user.email,
            user.phone || null,
            user.address || null,
            user.password,
            user.role,
            user.profile_picture || null
        ]);
        return { ...user, id: result.lastID };
    }
    async update(id, user) {
        const fields = [];
        const values = [];
        if (user.name !== undefined) {
            fields.push('name = ?');
            values.push(user.name);
        }
        if (user.phone !== undefined) {
            fields.push('phone = ?');
            values.push(user.phone);
        }
        if (user.address !== undefined) {
            fields.push('address = ?');
            values.push(user.address);
        }
        if (user.profile_picture !== undefined) {
            fields.push('profile_picture = ?');
            values.push(user.profile_picture);
        }
        if (user.password !== undefined) {
            fields.push('password = ?');
            values.push(user.password);
        }
        if (fields.length === 0)
            return false;
        values.push(id);
        const result = await (0, db_js_1.run)(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.changes > 0;
    }
    async findAll() {
        const rows = await (0, db_js_1.query)('SELECT id, name, email, phone, address, role, profile_picture, created_at FROM users');
        return rows;
    }
    async delete(id) {
        const result = await (0, db_js_1.run)('DELETE FROM users WHERE id = ?', [id]);
        return result.changes > 0;
    }
}
exports.UserRepository = UserRepository;
