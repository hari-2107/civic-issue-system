"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackController = void 0;
const FeedbackService_js_1 = require("../service/FeedbackService.js");
class FeedbackController {
    feedbackService = new FeedbackService_js_1.FeedbackService();
    submit = async (req, res, next) => {
        try {
            const { complaint_id, rating, comment } = req.body;
            const citizen_id = req.user.id;
            const feedback = await this.feedbackService.submitFeedback({
                complaint_id: parseInt(complaint_id),
                citizen_id,
                rating: parseInt(rating),
                comment
            });
            res.status(201).json(feedback);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    list = async (req, res, next) => {
        try {
            const feedbacks = await this.feedbackService.getAllFeedbacks();
            res.json(feedbacks);
        }
        catch (err) {
            next(err);
        }
    };
    getForComplaint = async (req, res, next) => {
        try {
            const fb = await this.feedbackService.getFeedbackForComplaint(parseInt(req.params.complaintId));
            if (!fb)
                return res.status(404).json({ error: 'Feedback not found' });
            res.json(fb);
        }
        catch (err) {
            next(err);
        }
    };
    adminReply = async (req, res, next) => {
        try {
            const complaintId = parseInt(req.params.complaintId);
            const { response } = req.body;
            const result = await this.feedbackService.adminReply(complaintId, response);
            res.json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    averageRating = async (req, res, next) => {
        try {
            const avg = await this.feedbackService.getAverageRating();
            res.json({ averageRating: avg });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.FeedbackController = FeedbackController;
