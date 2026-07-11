import React, { useEffect, useState, useCallback } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { getAllFeedbacks, adminReplyToFeedback } from '../services/feedbackService';
import type { Feedback } from '../types/index';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import Table from '../components/Table';
import { Star, CornerDownRight, CheckCheck } from 'lucide-react';

export const FeedbackPage: React.FC = () => {
    const { showToast } = useNotifications();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    // Direct reply dialog states
    const [replyTarget, setReplyTarget] = useState<Feedback | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const fetchFeedbacks = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllFeedbacks();
            setFeedbacks(data);
        } catch (err) {
            showToast('Failed to retrieve citizen feedbacks registry.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyTarget || !replyText.trim()) return;

        setSubmittingReply(true);
        try {
            await adminReplyToFeedback(replyTarget.complaint_id, replyText);
            showToast('Public reply successfully posted!', 'success');
            setReplyTarget(null);
            setReplyText('');
            await fetchFeedbacks();
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Failed to submit response.';
            showToast(msg, 'error');
        } finally {
            setSubmittingReply(false);
        }
    };

    const columns = [
        {
            header: 'Complaint',
            accessor: 'complaint_id',
            render: (val: number, row: Feedback) => (
                <div>
                    <strong>#CIV-{val}</strong>
                    {row.complaint_title && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.complaint_title}</div>}
                </div>
            )
        },
        {
            header: 'Citizen Info',
            accessor: 'citizen_name',
            render: (val: string) => <span style={{ fontWeight: 500 }}>{val || 'General Resident'}</span>
        },
        {
            header: 'Score',
            accessor: 'rating',
            render: (val: number) => (
                <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                    {Array.from({ length: val }).map((_, idx) => (
                        <Star key={idx} size={14} fill="#f59e0b" />
                    ))}
                </div>
            )
        },
        {
            header: 'Citizen Comment',
            accessor: 'comment',
            render: (val: string, row: Feedback) => (
                <div style={{ maxWidth: '300px' }}>
                    {val ? (
                        <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>"{val}"</p>
                    ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Rating only</span>
                    )}

                    {row.admin_response && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', color: 'var(--primary-blue)', fontSize: '0.78rem', borderLeft: '2px solid var(--primary-blue)', paddingLeft: '8px' }}>
                            <CornerDownRight size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <strong>Official Reply:</strong> "{row.admin_response}"
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Action',
            accessor: 'complaint_id',
            render: (_val: number, row: Feedback) => (
                !row.admin_response ? (
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                            setReplyTarget(row);
                            setReplyText('');
                        }}
                    >
                        Reply
                    </button>
                ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-green)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCheck size={12} /> Replied
                    </span>
                )
            )
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Title */}
            <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>User Feedbacks Desk</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Review citizen satisfaction ratings and coordinate office replies.</p>
            </div>

            {replyTarget && (
                <div className="card animate-fade-in" style={{ border: '2px solid var(--primary-green-medium)' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Reply to Citizen Rating</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Complaint: <strong>#CIV-{replyTarget.complaint_id}</strong> &bull; Star rating: <strong>{replyTarget.rating} ★</strong>
                    </p>

                    <form onSubmit={handleReplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <textarea
                                className="form-control"
                                rows={3}
                                placeholder="Write your official response to this review..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReplyTarget(null)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-accent btn-sm" disabled={submittingReply}>
                                {submittingReply ? 'Posting...' : 'Post Reply'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <LoadingSkeleton type="text" count={6} />
                </div>
            ) : (
                <Table
                    title="Citizen Ratings & Reviews Archive"
                    columns={columns}
                    data={feedbacks}
                />
            )}

        </div>
    );
};
export default FeedbackPage;
