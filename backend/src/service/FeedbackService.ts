import { FeedbackRepository } from '../repository/FeedbackRepository.js';
import { ComplaintRepository } from '../repository/ComplaintRepository.js';
import { NotificationRepository } from '../repository/NotificationRepository.js';
import { Feedback } from '../entity/types.js';

export class FeedbackService {
    private feedbackRepository = new FeedbackRepository();
    private complaintRepository = new ComplaintRepository();
    private notificationRepository = new NotificationRepository();

    async submitFeedback(feedback: Feedback) {
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

    async getFeedbackForComplaint(complaintId: number) {
        return await this.feedbackRepository.findByComplaintId(complaintId);
    }

    async getAllFeedbacks() {
        return await this.feedbackRepository.findAll();
    }

    async adminReply(complaintId: number, reply: string) {
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
