"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackService = void 0;
const FeedbackRepository_js_1 = require("../repository/FeedbackRepository.js");
const ComplaintRepository_js_1 = require("../repository/ComplaintRepository.js");
const NotificationRepository_js_1 = require("../repository/NotificationRepository.js");
class FeedbackService {
    feedbackRepository = new FeedbackRepository_js_1.FeedbackRepository();
    complaintRepository = new ComplaintRepository_js_1.ComplaintRepository();
    notificationRepository = new NotificationRepository_js_1.NotificationRepository();
    async submitFeedback(feedback) {
        const complaint = await this.complaintRepository.findById(feedback.complaint_id);
        if (!complaint) {
            throw new Error('Complaint not found');
        }
        if (complaint.citizen_id !== feedback.citizen_id) {
            throw new Error('You can only submit feedback for your own complaints');
        }
        if (complaint.status !== 'Resolved' && complaint.status !== 'Closed') {
            throw new Error('Feedback can only be submitted for Resolved or Closed complaints');
        }
        // Check if feedback already exists
        const existing = await this.feedbackRepository.findByComplaintId(feedback.complaint_id);
        if (existing) {
            throw new Error('Feedback was already submitted for this complaint');
        }
        const created = await this.feedbackRepository.create(feedback);
        // Notify admins of feedback (using a query to retrieve all admins or notify channel)
        // For simplicity, we create notifications for administrative alerts or logs
        // In our system, notification targets users, so we can notify the complaint creator that rating is received,
        // and log/register in the database.
        return created;
    }
    async getFeedbackForComplaint(complaintId) {
        return await this.feedbackRepository.findByComplaintId(complaintId);
    }
    async getAllFeedbacks() {
        return await this.feedbackRepository.findAll();
    }
    async adminReply(complaintId, reply) {
        const feedback = await this.feedbackRepository.findByComplaintId(complaintId);
        if (!feedback) {
            throw new Error('Feedback not found for this complaint');
        }
        const success = await this.feedbackRepository.updateAdminResponse(complaintId, reply);
        if (!success) {
            throw new Error('Failed to update response');
        }
        // Notify user of admin's feedback reply
        await this.notificationRepository.create({
            user_id: feedback.citizen_id,
            title: 'Admin Replied to Feedback',
            message: `An administrator has responded to your feedback on complaint #CIV-${complaintId}.`,
            is_read: 0
        });
        return await this.feedbackRepository.findByComplaintId(complaintId);
    }
    async getAverageRating() {
        return await this.feedbackRepository.getAverageRating();
    }
}
exports.FeedbackService = FeedbackService;
