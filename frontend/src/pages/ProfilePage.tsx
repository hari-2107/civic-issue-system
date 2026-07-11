import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { User, Phone, MapPin, Shield, CheckCheck } from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const { showToast } = useNotifications();

    // Profile forms
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');

    const [isUpdating, setIsUpdating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            showToast('Name is a required field', 'warning');
            return;
        }

        setIsUpdating(true);
        try {
            await updateProfile({
                name,
                phone: phone || undefined,
                address: address || undefined
            });
            showToast('Profile specifications updated successfully.', 'success');
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Profile update failed.';
            showToast(msg, 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Title */}
            <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Account Profile</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Manage your personal coordinates and contact settings.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

                {/* Left Column: Form info */}
                <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        👤 Profile Specifications
                    </h3>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Full Name *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-control"
                                style={{ paddingLeft: '40px' }}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                disabled={isUpdating}
                                required
                            />
                            <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Email Address (Read Only)</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                className="form-control"
                                style={{ paddingLeft: '40px', opacity: 0.6, cursor: 'not-allowed' }}
                                value={user?.email || ''}
                                readOnly
                            />
                            <Shield size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                            Contact support to update your registered email identifier.
                        </span>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Mobile Number</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="+1 555-019-2834"
                                style={{ paddingLeft: '40px' }}
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                disabled={isUpdating}
                            />
                            <Phone size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Home Address</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="123 Main St, Springfield"
                                style={{ paddingLeft: '40px' }}
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                disabled={isUpdating}
                            />
                            <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '10px 20px', marginTop: '8px' }} disabled={isUpdating}>
                        {isUpdating ? 'Saving...' : <><CheckCheck size={16} /> Save Changes</>}
                    </button>
                </form>

                {/* Right Column: Card overview */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>

                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-blue-light)',
                        color: 'var(--primary-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        border: '2px solid var(--border-color)',
                        marginBottom: '20px'
                    }}>
                        {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</h3>
                    <span className="badge badge-approved" style={{ marginTop: '6px', fontSize: '0.8rem' }}>
                        Portal Access: {user?.role}
                    </span>

                    <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', marginTop: '24px', paddingTop: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                        <div>
                            <span style={{ color: 'var(--text-secondary)' }}>Member Since:</span>
                            <strong style={{ float: 'right' }}>
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </strong>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)' }}>Active Reports Filed:</span>
                            <strong style={{ float: 'right' }}>Verified</strong>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
export default ProfilePage;
