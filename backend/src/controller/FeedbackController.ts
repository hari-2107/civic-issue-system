import { Response, NextFunction } from 'express';
import { FeedbackService } from '../service/FeedbackService.js';
import { AuthenticatedRequest } from '../security/auth.js';

export class FeedbackController {
    private feedbackService = new FeedbackService();

    submit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { complaint_id, rating, comment } = req.body;
            const citizen_id = req.user!.id;

            const feedback = await this.feedbackService.submitFeedback({
                complaint_id: parseInt(complaint_id),
                citizen_id,
                rating: parseInt(rating),
                comment
            });

            res.status(201).json(feedback);
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    };

    list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const feedbacks = await this.feedbackService.getAllFeedbacks();
            res.json(feedbacks);
        } catch (err) {
            next(err);
        }
    };

    getForComplaint = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const fb = await this.feedbackService.getFeedbackForComplaint(parseInt(req.params.complaintId));
            if (!fb) return res.status(404).json({ error: 'Feedback not found' });
            res.json(fb);
        } catch (err) {
            next(err);
        }
    };

    adminReply = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const complaintId = parseInt(req.params.complaintId);
            const { response } = req.body;
            const result = await this.feedbackService.adminReply(complaintId, response);
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    };

    averageRating = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const avg = await this.feedbackService.getAverageRating();
            res.json({ averageRating: avg });
        } catch (err) {
            next(err);
        }
    };
}
