import { run, get, query } from '../config/db.js';
import { Complaint, Attachment } from '../entity/types.js';

export interface ComplaintFilters {
    status?: string;
    priority?: string;
    category_id?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    sortBy?: string; // 'created_at' | 'priority' | 'status'
    sortOrder?: 'ASC' | 'DESC';
}

export class ComplaintRepository {
    async create(complaint: Complaint): Promise<Complaint> {
        const result = await run(
            `INSERT INTO complaints (
        title, description, category_id, department_id, priority, status, 
        address, landmark, latitude, longitude, citizen_id, contact_number, 
        state, district, taluk, revenue_division, firka, village_panchayat,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
                complaint.title,
                complaint.description,
                complaint.category_id,
                complaint.department_id || null,
                complaint.priority,
                complaint.status || 'Pending',
                complaint.address,
                complaint.landmark || null,
                complaint.latitude || null,
                complaint.longitude || null,
                complaint.citizen_id,
                complaint.contact_number || null,
                complaint.state || 'None',
                complaint.district || 'None',
                complaint.taluk || 'None',
                complaint.revenue_division || 'None',
                complaint.firka || 'None',
                complaint.village_panchayat || 'None'
            ]
        );
        return { ...complaint, id: result.lastID };
    }

    async findById(id: number): Promise<any | null> {
        // Join with category and department and citizen info
        const row = await get(
            `SELECT c.*, cat.name as category_name, dept.name as department_name, u.name as citizen_name, u.email as citizen_email
       FROM complaints c
       JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN departments dept ON c.department_id = dept.id
       JOIN users u ON c.citizen_id = u.id
       WHERE c.id = ?`,
            [id]
        );

        if (row) {
            const attachments = await this.getAttachments(id);
            return { ...row, attachments };
        }
        return null;
    }

    async update(id: number, complaint: Partial<Complaint>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (complaint.title !== undefined) { fields.push('title = ?'); values.push(complaint.title); }
        if (complaint.description !== undefined) { fields.push('description = ?'); values.push(complaint.description); }
        if (complaint.category_id !== undefined) { fields.push('category_id = ?'); values.push(complaint.category_id); }
        if (complaint.department_id !== undefined) { fields.push('department_id = ?'); values.push(complaint.department_id); }
        if (complaint.priority !== undefined) { fields.push('priority = ?'); values.push(complaint.priority); }
        if (complaint.status !== undefined) { fields.push('status = ?'); values.push(complaint.status); }
        if (complaint.address !== undefined) { fields.push('address = ?'); values.push(complaint.address); }
        if (complaint.landmark !== undefined) { fields.push('landmark = ?'); values.push(complaint.landmark); }
        if (complaint.latitude !== undefined) { fields.push('latitude = ?'); values.push(complaint.latitude); }
        if (complaint.longitude !== undefined) { fields.push('longitude = ?'); values.push(complaint.longitude); }
        if (complaint.contact_number !== undefined) { fields.push('contact_number = ?'); values.push(complaint.contact_number); }

        fields.push('updated_at = CURRENT_TIMESTAMP');

        if (fields.length === 1) return false; // Only updated_at

        values.push(id);
        const result = await run(`UPDATE complaints SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.changes > 0;
    }

    async delete(id: number): Promise<boolean> {
        const result = await run('DELETE FROM complaints WHERE id = ?', [id]);
        return result.changes > 0;
    }

    // Attachments
    async createAttachment(complaintId: number, fileUrl: string): Promise<Attachment> {
        const result = await run(
            'INSERT INTO attachments (complaint_id, file_url) VALUES (?, ?)',
            [complaintId, fileUrl]
        );
        return { id: result.lastID, complaint_id: complaintId, file_url: fileUrl };
    }

    async getAttachments(complaintId: number): Promise<Attachment[]> {
        const rows = await query('SELECT * FROM attachments WHERE complaint_id = ? ORDER BY id DESC', [complaintId]);
        return rows;
    }

    // Filtered queries
    async queryComplaints(filters: ComplaintFilters, citizenId?: number): Promise<{ data: any[]; total: number }> {
        let whereClauses: string[] = [];
        let params: any[] = [];

        if (citizenId !== undefined) {
            whereClauses.push('c.citizen_id = ?');
            params.push(citizenId);
        }

        if (filters.status) {
            whereClauses.push('c.status = ?');
            params.push(filters.status);
        }

        if (filters.priority) {
            whereClauses.push('c.priority = ?');
            params.push(filters.priority);
        }

        if (filters.category_id) {
            whereClauses.push('c.category_id = ?');
            params.push(filters.category_id);
        }

        if (filters.startDate) {
            whereClauses.push('c.created_at >= ?');
            params.push(`${filters.startDate} 00:00:00`);
        }

        if (filters.endDate) {
            whereClauses.push('c.created_at <= ?');
            params.push(`${filters.endDate} 23:59:59`);
        }

        if (filters.search) {
            whereClauses.push('(c.title LIKE ? OR c.description LIKE ? OR c.address LIKE ?)');
            const searchWild = `%${filters.search}%`;
            params.push(searchWild, searchWild, searchWild);
        }

        const whereSql = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        // Count Query
        const totalRow = await get(
            `SELECT COUNT(*) as count 
       FROM complaints c 
       ${whereSql}`,
            params
        );
        const total = totalRow ? totalRow.count : 0;

        // Sorting
        let orderBySql = 'ORDER BY c.created_at DESC';
        if (filters.sortBy) {
            const order = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';
            if (['created_at', 'title', 'status'].includes(filters.sortBy)) {
                orderBySql = `ORDER BY c.${filters.sortBy} ${order}`;
            } else if (filters.sortBy === 'priority') {
                orderBySql = `ORDER BY CASE c.priority 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
          END ${order}`;
            }
        }

        // Pagination
        let limitSql = '';
        if (filters.limit !== undefined && filters.offset !== undefined) {
            limitSql = 'LIMIT ? OFFSET ?';
            params.push(filters.limit, filters.offset);
        }

        // Query Data code
        const dataSql = `
      SELECT c.*, cat.name as category_name, dept.name as department_name, u.name as citizen_name
      FROM complaints c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN departments dept ON c.department_id = dept.id
      JOIN users u ON c.citizen_id = u.id
      ${whereSql}
      ${orderBySql}
      ${limitSql}
    `;

        const data = await query(dataSql, params);

        // Fetch attachments for each complaint in result
        for (const item of data) {
            item.attachments = await this.getAttachments(item.id);
        }

        return { data, total };
    }

    // Dashboard / Analytics queries
    async getComplaintsCountByStatus(citizenId?: number): Promise<any> {
        let sql = 'SELECT status, COUNT(*) as count FROM complaints';
        let params: any[] = [];
        if (citizenId !== undefined) {
            sql += ' WHERE citizen_id = ?';
            params.push(citizenId);
        }
        sql += ' GROUP BY status';
        const rows = await query(sql, params);

        const stats: Record<string, number> = {
            Pending: 0,
            Approved: 0,
            Assigned: 0,
            'In Progress': 0,
            Resolved: 0,
            Closed: 0,
            Rejected: 0
        };
        rows.forEach((r: any) => {
            stats[r.status] = r.count;
        });
        return stats;
    }

    async getRecentTimeline(limit: number = 8): Promise<any[]> {
        return await query(`
      SELECT c.id, c.title, c.status, c.created_at, u.name as citizen_name
      FROM complaints c
      JOIN users u ON c.citizen_id = u.id
      ORDER BY c.created_at DESC
      LIMIT ?
    `, [limit]);
    }

    // Administrative / Analytics
    async getMonthlyComplaints(): Promise<any[]> {
        // SQLite query to group complaints by year-month
        return await query(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
      FROM complaints 
      GROUP BY month 
      ORDER BY month ASC 
      LIMIT 12
    `);
    }

    async getResolvedComplaintsMonthly(): Promise<any[]> {
        return await query(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
      FROM complaints 
      WHERE status IN ('Resolved', 'Closed')
      GROUP BY month 
      ORDER BY month ASC 
      LIMIT 12
    `);
    }

    async getCategoryShareDistribution(): Promise<any[]> {
        return await query(`
      SELECT cat.name as name, COUNT(c.id) as value 
      FROM complaints c
      JOIN categories cat ON c.category_id = cat.id
      GROUP BY cat.name
    `);
    }

    async getUserGrowthMonthly(): Promise<any[]> {
        return await query(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
      FROM users 
      WHERE role = 'CITIZEN'
      GROUP BY month 
      ORDER BY month ASC
    `);
    }

    async getDepartmentPerformance(): Promise<any[]> {
        return await query(`
      SELECT dept.name as departmentName, 
             COUNT(c.id) as totalAssigned,
             SUM(CASE WHEN c.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) as resolvedCount
      FROM complaints c
      JOIN departments dept ON c.department_id = dept.id
      GROUP BY dept.name
    `);
    }
}
