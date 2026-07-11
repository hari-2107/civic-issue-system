import axios from 'axios';
import type { Feedback } from '../types/index';

export interface FeedbackSubmission {
    complaint_id: number;
    rating: number;
    comment?: string;
}

export const submitFeedback = async (data: FeedbackSubmission): Promise<Feedback> => {
    const res = await axios.post('/feedback', data);
    return res.data;
};

export const getFeedbackForComplaint = async (complaintId: number): Promise<Feedback> => {
    const res = await axios.get(`/feedback/${complaintId}`);
    return res.data;
};

export const getAllFeedbacks = async (): Promise<Feedback[]> => {
    const res = await axios.get('/feedback');
    return res.data;
};

export const adminReplyToFeedback = async (complaintId: number, response: string): Promise<Feedback> => {
    const res = await axios.post(`/feedback/${complaintId}/reply`, { response });
    return res.data;
};

export const getAverageRating = async (): Promise<number> => {
    const res = await axios.get('/feedback/avg-rating');
    return res.data.averageRating;
};
