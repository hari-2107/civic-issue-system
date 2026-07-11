import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
    getComplaintById,
    deleteComplaint,
    adminUpdateStatus,
    getDepartments
} from '../services/complaintService';
import { getFeedbackForComplaint, adminReplyToFeedback } from '../services/feedbackService';
import type { Complaint, Feedback, Department } from '../types/index';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import MapSelector from '../components/MapSelector';
import {
    ArrowLeft,
    User,
    Phone,
    Bookmark,
    Building,
    Star,
    CornerDownRight,
    Trash2,
    CheckCheck
} from 'lucide-react';

interface ComplaintDetailsPageProps {
    complaintId: number;
    onNavigate: (page: string) => void;
}

export const ComplaintDetailsPage: React.FC<ComplaintDetailsPageProps> = ({ complaintId, onNavigate }) => {
    const { isAdmin } = useAuth();
    const { showToast } = useNotifications();

    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    // Admin action controls
    const [actionStatus, setActionStatus] = useState('');
    const [assignedDept, setAssignedDept] = useState('');
    const [updatePriority, setUpdatePriority] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Admin feedback reply controls
    const [adminReplyText, setAdminReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    // Lightbox image preview state
    const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getComplaintById(complaintId);
            setComplaint(data);
            setActionStatus(data.status);
            setUpdatePriority(data.priority);
            setAssignedDept(String(data.department_id || ''));

            // If resolved or closed, check if rating feedback details are present
            if (data.status === 'Resolved' || data.status === 'Closed') {
                try {
                    const fbData = await getFeedbackForComplaint(complaintId);
                    setFeedback(fbData);
                    setAdminReplyText(fbData?.admin_response || '');
                } catch {
                    // Feedback may not be submitted yet
                    setFeedback(null);
                }
            }

            if (isAdmin) {
                const depts = await getDepartments();
                setDepartments(depts);
            }
        } catch (err) {
            showToast('Failed to load complaint particulars.', 'error');
        } finally {
            setLoading(false);
        }
    }, [complaintId, isAdmin, showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDelete = async () => {
        if (!window.confirm('Are you holding off? Do you wish to permanently delete this report?')) return;
        try {
            const ok = await deleteComplaint(complaintId);
            if (ok) {
                showToast('Complaint deleted successfully.', 'success');
                onNavigate('dashboard');
            }
        } catch {
            showToast('Failed to delete complaint.', 'error');
        }
    };

    const handleAdminUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionStatus) return;

        setUpdatingStatus(true);
        try {
            const nextDept = (actionStatus === 'Assigned' || actionStatus === 'In Progress') && assignedDept
                ? Number(assignedDept)
                : undefined;

            await adminUpdateStatus(complaintId, actionStatus, nextDept, updatePriority);
            showToast('Complaint parameters updated and citizen alerted!', 'success');
            await loadData();
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Failed to update status.';
            showToast(msg, 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminReplyText.trim()) return;

        setSubmittingReply(true);
        try {
            await adminReplyToFeedback(complaintId, adminReplyText);
            showToast('Reply saved and posted publicly to feed.', 'success');
            await loadData();
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Failed to submit reply.';
            showToast(msg, 'error');
        } finally {
            setSubmittingReply(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <LoadingSkeleton type="title" />
                <LoadingSkeleton type="card" count={2} />
            </div>
        );
    }

    if (!complaint) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <h3>Log Entry Not Found</h3>
                <p>The requested complaint record does not exist.</p>
                <button className="btn btn-primary" onClick={() => onNavigate('dashboard')} style={{ marginTop: '14px' }}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // Markers wrapper
    const singleMarker = [{
        id: complaint.id,
        latitude: complaint.latitude || 37.7749,
        longitude: complaint.longitude || -122.4194,
        title: complaint.title,
        category: complaint.category_name || 'General',
        status: complaint.status
    }];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Title Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => onNavigate('dashboard')} className="btn btn-secondary btn-sm" style={{ padding: '8px' }}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                            Issue Details: <span style={{ color: 'var(--primary-blue)' }}>#CIV-{complaint.id}</span>
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Logged on {new Date(complaint.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge badge-${complaint.status.toLowerCase().replace(/\s+/g, '')}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                        Status: {complaint.status}
                    </span>
                    <div className="priority-indicator card" style={{ padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <div className={`priority-dot dot-${complaint.priority.toLowerCase()}`} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{complaint.priority} Priority</span>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

                {/* LEFT COMPONENT: Information details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            📋 Report Particulars
                        </h3>

                        <div>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Issue Title</strong>
                            <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{complaint.title}</p>
                        </div>

                        <div>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category Classification</strong>
                            <p style={{ fontSize: '0.9rem' }}>{complaint.category_name}</p>
                        </div>

                        <div>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Description</strong>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                                {complaint.description}
                            </p>
                        </div>

                        {complaint.attachments && complaint.attachments.length > 0 && (
                            <div>
                                <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                                    Attached Photos ({complaint.attachments.length})
                                </strong>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {complaint.attachments.map((attach: any, idx: number) => {
                                        const imageUrl = attach.file_url.startsWith('/uploads')
                                            ? `http://${window.location.hostname}:5000${attach.file_url}`
                                            : attach.file_url;
                                        return (
                                            <div
                                                key={attach.id || idx}
                                                onClick={() => setSelectedLightboxImage(imageUrl)}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--border-color)',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.15s ease'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={`attachment-${idx}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>State</strong>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{complaint.state || 'None'}</p>
                            </div>
                            <div>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>District</strong>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{complaint.district || 'None'}</p>
                            </div>
                            <div style={{ gridColumn: 'span 2', height: '1px', backgroundColor: 'var(--border-color)' }} />
                            <div>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Taluk</strong>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{complaint.taluk || 'None'}</p>
                            </div>
                            <div>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Revenue Division</strong>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{complaint.revenue_division || 'None'}</p>
                            </div>
                            <div style={{ gridColumn: 'span 2', height: '1px', backgroundColor: 'var(--border-color)' }} />
                            <div>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Firka</strong>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{complaint.firka || 'None'}</p>
                            </div>
                            <div>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Village Panchayat</strong>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{complaint.village_panchayat || 'None'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Filer Name</strong>
                                <span style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={14} style={{ color: 'var(--text-muted)' }} /> {complaint.citizen_name}
                                </span>
                            </div>
                            <div>
                                <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Contact phone</strong>
                                <span style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <Phone size={14} style={{ color: 'var(--text-muted)' }} /> {complaint.contact_number || 'None provided'}
                                </span>
                            </div>
                        </div>

                        {complaint.department_name && (
                            <div>
                                <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Handling Department</strong>
                                <span style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: 'var(--primary-green)' }}>
                                    <Building size={14} /> {complaint.department_name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Citizen Actions: Pending deletes */}
                    {!isAdmin && complaint.status === 'Pending' && (
                        <div className="card" style={{ border: '1px solid #fee2e2', backgroundColor: '#fff5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong style={{ color: 'var(--priority-critical)', fontSize: '0.9rem', display: 'block' }}>Withdrawal Option</strong>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>If you've resolved the issue yourself, you can withdraw this ticket.</span>
                            </div>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                                <Trash2 size={14} /> Delete Report
                            </button>
                        </div>
                    )}

                    {/* Admin Status transition updating Panel */}
                    {isAdmin && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--primary-blue-medium)' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                                ⚙️ Admin Status Adjuster
                            </h3>

                            <form onSubmit={handleAdminUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Update Status *</label>
                                    <select
                                        className="form-control"
                                        value={actionStatus}
                                        onChange={e => setActionStatus(e.target.value)}
                                        disabled={updatingStatus}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved (Inspected & Approved)</option>
                                        <option value="Assigned">Assigned (Route to Dept)</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved (Complete repair)</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>

                                {/* If route dept toggles enabled */}
                                {(actionStatus === 'Assigned' || actionStatus === 'In Progress') && (
                                    <>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Assign Department *</label>
                                            <select
                                                className="form-control"
                                                value={assignedDept}
                                                onChange={e => setAssignedDept(e.target.value)}
                                                required
                                                disabled={updatingStatus}
                                            >
                                                <option value="">-- Choose department --</option>
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Adjust Urgency Priority *</label>
                                            <select
                                                className="form-control"
                                                value={updatePriority}
                                                onChange={e => setUpdatePriority(e.target.value)}
                                                disabled={updatingStatus}
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                                <option value="Critical">Critical</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                <button type="submit" className="btn btn-primary btn-sm" disabled={updatingStatus} style={{ alignSelf: 'flex-end', marginTop: '6px' }}>
                                    {updatingStatus ? 'Applying changes...' : 'Apply Parameters'}
                                </button>
                            </form>
                        </div>
                    )}

                </div>

                {/* RIGHT COMPONENT: Spatial map and Citizen reviews feedback logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Spatial Mapping */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Spatial Reference</h3>
                        <div>
                            <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Stated Location</strong>
                            <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                                <Bookmark size={12} style={{ color: 'var(--primary-blue-medium)' }} /> {complaint.address}
                                {complaint.landmark && ` (${complaint.landmark})`}
                            </p>
                        </div>
                        {complaint.latitude && complaint.longitude ? (
                            <MapSelector interactive={false} latitude={complaint.latitude} longitude={complaint.longitude} markers={singleMarker} />
                        ) : (
                            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                                No geospatial data recorded
                            </div>
                        )}
                    </div>

                    {/* Feedback Display & Admin Reply Logs */}
                    {(complaint.status === 'Resolved' || complaint.status === 'Closed') && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid var(--primary-green)' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-green)' }}>
                                ⭐ Resolution Assessment Review
                            </h3>

                            {feedback ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', color: '#f59e0b' }}>
                                            {Array.from({ length: feedback.rating }).map((_, idx) => (
                                                <Star key={idx} size={16} fill="#f59e0b" />
                                            ))}
                                            {Array.from({ length: 5 - feedback.rating }).map((_, idx) => (
                                                <Star key={idx} size={16} style={{ color: 'var(--text-muted)' }} />
                                            ))}
                                        </div>
                                        {feedback.comment ? (
                                            <p style={{ fontSize: '0.88rem', fontStyle: 'italic', backgroundColor: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '8px', color: 'var(--text-primary)' }}>
                                                "{feedback.comment}"
                                            </p>
                                        ) : (
                                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Citizen left ratings with no comment.</span>
                                        )}
                                    </div>

                                    {/* Public response reply */}
                                    {feedback.admin_response ? (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', borderLeft: '2px solid var(--primary-blue)', paddingLeft: '12px' }}>
                                            <CornerDownRight size={16} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} />
                                            <div>
                                                <strong style={{ fontSize: '0.78rem', color: 'var(--primary-blue)', display: 'block' }}>Municipal Coordination Reply</strong>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>"{feedback.admin_response}"</p>
                                            </div>
                                        </div>
                                    ) : isAdmin ? (
                                        <form onSubmit={handleReplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">Post Public Resolution Reply</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="e.g. Thank you Sarah. Road crew confirmed asphalt was dried fully."
                                                    value={adminReplyText}
                                                    onChange={e => setAdminReplyText(e.target.value)}
                                                    required
                                                    disabled={submittingReply}
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-accent btn-sm" disabled={submittingReply} style={{ alignSelf: 'flex-end' }}>
                                                Post Response
                                            </button>
                                        </form>
                                    ) : (
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Awaiting official municipal feedback reply acknowledgment...</span>
                                    )}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    <CheckCheck size={16} style={{ color: 'var(--primary-green)' }} />
                                    <span>Awaiting citizen quality verification rating response.</span>
                                </div>
                            )}
                        </div>
                    )}

                </div>

            </div>

            {/* Image Lightbox Modal Overlay */}
            {selectedLightboxImage && (
                <div
                    onClick={() => setSelectedLightboxImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        cursor: 'zoom-out'
                    }}
                >
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                        <img
                            src={selectedLightboxImage}
                            alt="Lightbox view"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '85vh',
                                borderRadius: '4px',
                                display: 'block',
                                border: '3px solid white',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                            }}
                        />
                        <button
                            onClick={() => setSelectedLightboxImage(null)}
                            style={{
                                position: 'absolute',
                                top: '-35px',
                                right: '0px',
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '20px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            &times; Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};
export default ComplaintDetailsPage;
