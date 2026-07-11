import { run, get, query } from '../config/db.js';
import { Feedback } from '../entity/types.js';

export class FeedbackRepository {
    async create(feedback: Feedback): Promise<Feedback> {
        const result = await run(
            `INSERT INTO feedbacks (complaint_id, citizen_id, rating, comment) 
       VALUES (?, ?, ?, ?)`,
            [feedback.complaint_id, feedback.citizen_id, feedback.rating, feedback.comment || null]
        );
        return { ...feedback, id: result.lastID };
    }

    async findByComplaintId(complaintId: number): Promise<any | null> {
        return await get(
            `SELECT f.*, u.name as citizen_name
       FROM feedbacks f
       JOIN users u ON f.citizen_id = u.id
       WHERE f.complaint_id = ?`,
            [complaintId]
        );
    }

    async findAll(): Promise<any[]> {
        return await query(
            `SELECT f.*, u.name as citizen_name, c.title as complaint_title, cat.name as category_name
       FROM feedbacks f
       JOIN users u ON f.citizen_id = u.id
       JOIN complaints c ON f.complaint_id = c.id
       JOIN categories cat ON c.category_id = cat.id
       ORDER BY f.created_at DESC`
        );
    }

    async updateAdminResponse(complaintId: number, response: string): Promise<boolean> {
        const result = await run(
            'UPDATE feedbacks SET admin_response = ? WHERE complaint_id = ?',
            [response, complaintId]
        );
        return result.changes > 0;
    }

    async getAverageRating(): Promise<number> {
        const row = await get('SELECT AVG(rating) as avg_rating FROM feedbacks');
        return row && row.avg_rating !== null ? parseFloat(row.avg_rating.toFixed(2)) : 5.0;
    }
}
