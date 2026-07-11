import React, { useEffect, useState, useCallback } from 'react';
import { useNotifications } from '../context/NotificationContext.js';
import { getCitizenStats, getComplaints } from '../services/complaintService.js';
import { submitFeedback } from '../services/feedbackService.js';
import type { Complaint, CitizenStats } from '../types/index';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import MapSelector from '../components/MapSelector.js';
import {
    AlertCircle,
    Clock,
    CheckCircle,
    Plus,
    ArrowRight,
    Star,
    FileText,
    MessageSquare,
    Search,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface CitizenDashboardProps {
    onNavigate: (page: string, params?: Record<string, any>) => void;
    onlyList?: boolean;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ onNavigate, onlyList = false }) => {
    const { showToast } = useNotifications();
    const [stats, setStats] = useState<CitizenStats | null>(null);
    const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    const [queryParams, setQueryParams] = useState({
        status: '',
        search: '',
        limit: 10,
        offset: 0
    });
    const [claimsCount, setClaimsCount] = useState(0);

    // States to facilitate rating resolutions
    const [ratingComplaint, setRatingComplaint] = useState<Complaint | null>(null);
    const [ratingVal, setRatingVal] = useState<number>(5);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            if (onlyList) {
                const res = await getComplaints({
                    status: queryParams.status || undefined,
                    search: queryParams.search || undefined,
                    limit: queryParams.limit,
                    offset: queryParams.offset
                });
                setRecentComplaints(res.data);
                setClaimsCount(res.total);
            } else {
                const [statsData, complaintsData] = await Promise.all([
                    getCitizenStats(),
                    getComplaints({ limit: 5 })
                ]);
                setStats(statsData);
                setRecentComplaints(complaintsData.data);
            }
        } catch (err) {
            showToast('Failed to load dashboard data. Check connection.', 'error');
        } finally {
            setLoading(false);
        }
    }, [onlyList, queryParams, showToast]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const handleRatingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ratingComplaint) return;

        setSubmittingRating(true);
        try {
            await submitFeedback({
                complaint_id: ratingComplaint.id,
                rating: ratingVal,
                comment: feedbackComment
            });
            showToast('Resolution review submitted! Thank you.', 'success');
            setRatingComplaint(null);
            setFeedbackComment('');
            setRatingVal(5);
            // Reload complaints/stats to reflect updated closed state
            await loadDashboardData();
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Failed to submit review.';
            showToast(msg, 'error');
        } finally {
            setSubmittingRating(false);
        }
    };

    // Find if there is any Resolved complaint that hasn't been closed/rated yet
    const pendingRatings = recentComplaints.filter(c => c.status === 'Resolved');

    // Convert complaints into markers for display on local map
    const mapMarkers = recentComplaints
        .filter(c => c.latitude && c.longitude)
        .map(c => ({
            id: c.id,
            latitude: c.latitude!,
            longitude: c.longitude!,
            title: c.title,
            category: c.category_name || 'General',
            status: c.status
        }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                        {onlyList ? "My Reports Registry" : "Citizen Dashboard"}
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {onlyList ? "Search, monitor, and view resolution feedback for all your filed reports." : "Welcome to your civic coordination center."}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => onNavigate('file-complaint')}>
                    <Plus size={18} /> Report New Issue
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <LoadingSkeleton type="text" count={6} />
                </div>
            ) : onlyList ? (
                /* Dedicated Complaints List page with Search, Filter & Pagination */
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active & Historic Claims ({claimsCount})</h3>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '500px', marginLeft: 'auto' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ paddingLeft: '36px', height: '40px' }}
                                    placeholder="Search by title..."
                                    value={queryParams.search}
                                    onChange={e => setQueryParams(prev => ({ ...prev, search: e.target.value, offset: 0 }))}
                                />
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            </div>

                            <select
                                className="form-control"
                                style={{ width: '150px', height: '40px' }}
                                value={queryParams.status}
                                onChange={e => setQueryParams(prev => ({ ...prev, status: e.target.value, offset: 0 }))}
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recentComplaints.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                No matching claims found.
                            </div>
                        ) : (
                            recentComplaints.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => onNavigate('complaint-detail', { id: c.id })}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    className="complaint-list-item"
                                >
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{
                                            padding: '8px',
                                            borderRadius: '6px',
                                            backgroundColor: 'var(--bg-tertiary)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--text-primary)' }}>
                                                {c.title}
                                            </strong>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                                #{c.category_name} &bull; {new Date(c.created_at).toLocaleDateString()}
                                            </span>
                                            {c.state && c.state !== 'None' && (
                                                <span style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    Location: {c.taluk !== 'None' ? `${c.taluk}, ` : ''}{c.district !== 'None' ? `${c.district}, ` : ''}{c.state}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`badge badge-${c.status.toLowerCase().replace(/\s+/g, '')}`}>
                                        {c.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {claimsCount > queryParams.limit && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Showing {queryParams.offset + 1} - {Math.min(queryParams.offset + queryParams.limit, claimsCount)} of {claimsCount} claims
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={queryParams.offset === 0}
                                    onClick={() => setQueryParams(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={queryParams.offset + queryParams.limit >= claimsCount}
                                    onClick={() => setQueryParams(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Statistics Grid cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--status-pending)' }}>
                            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--status-pending)' }}>
                                <Clock size={24} />
                            </div>
                            <div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pending Inspection</span>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1.1 }}>
                                    {stats?.statusCounts['Pending'] || 0}
                                </h3>
                            </div>
                        </div>

                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--status-in-progress)' }}>
                            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--status-in-progress)' }}>
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Repairs</span>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1.1 }}>
                                    {stats?.statusCounts['In Progress'] || stats?.statusCounts['Assigned'] || 0}
                                </h3>
                            </div>
                        </div>

                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--status-resolved)' }}>
                            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--primary-green-light)', color: 'var(--status-resolved)' }}>
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Resolved & Closed</span>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1.1 }}>
                                    {(stats?.statusCounts['Resolved'] || 0) + (stats?.statusCounts['Closed'] || 0)}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Rating Resolutions Section (Dynamic Action Card) */}
                    {pendingRatings.length > 0 && !ratingComplaint && (
                        <div className="card animate-fade-in" style={{ backgroundColor: 'var(--primary-green-light)', border: '1px dashed var(--primary-green)', padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <MessageSquare size={24} style={{ color: 'var(--primary-green)' }} />
                                    <div>
                                        <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--primary-green)' }}>Issue Resolution Review Required</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            Authorities resolved <strong>"{pendingRatings[0].title}"</strong>. Help us verify by rating your experience!
                                        </p>
                                    </div>
                                </div>
                                <button className="btn btn-accent btn-sm" onClick={() => setRatingComplaint(pendingRatings[0])}>
                                    Leave Review <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Rating Dialog Overlay/Card */}
                    {ratingComplaint && (
                        <div className="card animate-fade-in" style={{ border: '2px solid var(--primary-green-medium)', padding: '24px' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Rate Municipal Resolution</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                Providing feedback for issue: <strong>#CIV-{ratingComplaint.id}: {ratingComplaint.title}</strong>
                            </p>

                            <form onSubmit={handleRatingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Resolution Quality Rating</label>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                                        {[1, 2, 3, 4, 5].map((starVal) => (
                                            <button
                                                key={starVal}
                                                type="button"
                                                onClick={() => setRatingVal(starVal)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: starVal <= ratingVal ? '#f59e0b' : 'var(--text-muted)',
                                                    padding: '4px',
                                                    transition: 'transform 0.1s ease'
                                                }}
                                            >
                                                <Star size={26} fill={starVal <= ratingVal ? '#f59e0b' : 'transparent'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Review Comment (Optional)</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        placeholder="Describe if the work was completed fully (piping leak plugged, asphalt leveled properly, etc.)"
                                        value={feedbackComment}
                                        onChange={e => setFeedbackComment(e.target.value)}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRatingComplaint(null)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-accent btn-sm" disabled={submittingRating}>
                                        {submittingRating ? 'Submitting...' : 'Submit Resolution Quality Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Map and Details layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

                        {/* List panel */}
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Recent Claims</h3>
                                <button
                                    onClick={() => onNavigate('complaints')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary-blue)',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    View All <ArrowRight size={14} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentComplaints.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        You haven't filed any complaints yet. Use the 'Report New Issue' button to submit.
                                    </div>
                                ) : (
                                    recentComplaints.map(c => (
                                        <div
                                            key={c.id}
                                            onClick={() => onNavigate('complaint-detail', { id: c.id })}
                                            style={{
                                                padding: '14px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                            className="complaint-list-item"
                                        >
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'var(--bg-tertiary)',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <strong style={{ fontSize: '0.88rem', display: 'block', color: 'var(--text-primary)' }}>
                                                        {c.title}
                                                    </strong>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        #{c.category_name} &bull; {new Date(c.created_at).toLocaleDateString()}
                                                    </span>
                                                    {c.state && c.state !== 'None' && (
                                                        <span style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            Location: {c.taluk !== 'None' ? `${c.taluk}, ` : ''}{c.district !== 'None' ? `${c.district}, ` : ''}{c.state}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`badge badge-${c.status.toLowerCase().replace(/\s+/g, '')}`}>
                                                {c.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Map panel */}
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Geospatial Heatmap</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-8px' }}>
                                Mapped complaints recorded in your region. Click markers for information.
                            </p>
                            {mapMarkers.length > 0 ? (
                                <MapSelector interactive={false} markers={mapMarkers} />
                            ) : (
                                <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                                    Awaiting coordinates submission...
                                </div>
                            )}
                        </div>

                    </div>
                </>
            )}

            {/* Styled JSX list items */}
            <style>{`
        .complaint-list-item:hover {
          border-color: var(--primary-blue-medium) !important;
          background-color: var(--primary-blue-light) !important;
        }
        [data-theme='dark'] .complaint-list-item:hover {
          background-color: #1e293b !important;
        }
      `}</style>
        </div>
    );
};
export default CitizenDashboard;
