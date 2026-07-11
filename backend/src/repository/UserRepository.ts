import { run, get, query } from '../config/db.js';
import { User } from '../entity/types.js';

export class UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        const row = await get('SELECT * FROM users WHERE email = ?', [email]);
        return row || null;
    }

    async findById(id: number): Promise<User | null> {
        const row = await get('SELECT * FROM users WHERE id = ?', [id]);
        if (row) {
            // Don't leak password by default
            const { password, ...userWithoutPass } = row;
            return userWithoutPass as User;
        }
        return null;
    }

    async getPasswordHash(email: string): Promise<string | null> {
        const row = await get('SELECT password FROM users WHERE email = ?', [email]);
        return row ? row.password : null;
    }

    async create(user: User): Promise<User> {
        const result = await run(
            `INSERT INTO users (name, email, phone, address, password, role, profile_picture) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                user.name,
                user.email,
                user.phone || null,
                user.address || null,
                user.password,
                user.role,
                user.profile_picture || null
            ]
        );
        return { ...user, id: result.lastID };
    }

    async update(id: number, user: Partial<User>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (user.name !== undefined) { fields.push('name = ?'); values.push(user.name); }
        if (user.phone !== undefined) { fields.push('phone = ?'); values.push(user.phone); }
        if (user.address !== undefined) { fields.push('address = ?'); values.push(user.address); }
        if (user.profile_picture !== undefined) { fields.push('profile_picture = ?'); values.push(user.profile_picture); }
        if (user.password !== undefined) { fields.push('password = ?'); values.push(user.password); }

        if (fields.length === 0) return false;

        values.push(id);
        const result = await run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.changes > 0;
    }

    async findAll(): Promise<User[]> {
        const rows = await query('SELECT id, name, email, phone, address, role, profile_picture, created_at FROM users');
        return rows;
    }

    async delete(id: number): Promise<boolean> {
        const result = await run('DELETE FROM users WHERE id = ?', [id]);
        return result.changes > 0;
    }
}
