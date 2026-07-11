"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackRepository = void 0;
const db_js_1 = require("../config/db.js");
class FeedbackRepository {
    async create(feedback) {
        const result = await (0, db_js_1.run)(`INSERT INTO feedbacks (complaint_id, citizen_id, rating, comment) 
       VALUES (?, ?, ?, ?)`, [feedback.complaint_id, feedback.citizen_id, feedback.rating, feedback.comment || null]);
        return { ...feedback, id: result.lastID };
    }
    async findByComplaintId(complaintId) {
        return await (0, db_js_1.get)(`SELECT f.*, u.name as citizen_name
       FROM feedbacks f
       JOIN users u ON f.citizen_id = u.id
       WHERE f.complaint_id = ?`, [complaintId]);
    }
    async findAll() {
        return await (0, db_js_1.query)(`SELECT f.*, u.name as citizen_name, c.title as complaint_title, cat.name as category_name
       FROM feedbacks f
       JOIN users u ON f.citizen_id = u.id
       JOIN complaints c ON f.complaint_id = c.id
       JOIN categories cat ON c.category_id = cat.id
       ORDER BY f.created_at DESC`);
    }
    async updateAdminResponse(complaintId, response) {
        const result = await (0, db_js_1.run)('UPDATE feedbacks SET admin_response = ? WHERE complaint_id = ?', [response, complaintId]);
        return result.changes > 0;
    }
    async getAverageRating() {
        const row = await (0, db_js_1.get)('SELECT AVG(rating) as avg_rating FROM feedbacks');
        return row && row.avg_rating !== null ? parseFloat(row.avg_rating.toFixed(2)) : 5.0;
    }
}
exports.FeedbackRepository = FeedbackRepository;
