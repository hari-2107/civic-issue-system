import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { UserPlus, Mail, KeyRound, Phone, MapPin, User, ArrowLeft, ShieldAlert } from 'lucide-react';

interface RegisterPageProps {
    onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
    const { register } = useAuth();
    const { showToast } = useNotifications();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; global?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const nextErrors: typeof errors = {};
        if (!name.trim()) nextErrors.name = 'Full name is required';
        if (!email) {
            nextErrors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            nextErrors.email = 'Invalid email address formatting';
        }
        if (!password) {
            nextErrors.password = 'Password is required';
        } else if (password.length < 6) {
            nextErrors.password = 'Password must be at least 6 characters long';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setErrors({});
        try {
            await register(name, email, password, phone || undefined, address || undefined);
            showToast('Account registered successfully! Welcome onboard.', 'success');
            onNavigate('dashboard');
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Registration failed. Email might already exist.';
            setErrors({ global: msg });
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary)',
            padding: '20px'
        }}>
            <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Back Link */}
                <button
                    onClick={() => onNavigate('landing')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.88rem',
                        alignSelf: 'flex-start'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Landing Page
                </button>

                <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--primary-green-light)',
                            color: 'var(--primary-green)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px'
                        }}>
                            <UserPlus size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Citizen Registration</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Create an account to report, track, and review municipal resolutions.
                        </p>
                    </div>

                    {errors.global && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '6px',
                            backgroundColor: '#fee2e2',
                            color: '#d32f2f',
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: '1px solid #ef4444'
                        }}>
                            <ShieldAlert size={16} />
                            <span>{errors.global}</span>
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Full Name *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Jane Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                disabled={isLoading}
                            />
                            <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                        </div>
                        {errors.name && (
                            <span style={{ fontSize: '0.78rem', color: '#d32f2f', marginTop: '4px', display: 'block' }}>
                                {errors.name}
                            </span>
                        )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Email Address *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="jane@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                disabled={isLoading}
                            />
                            <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                        </div>
                        {errors.email && (
                            <span style={{ fontSize: '0.78rem', color: '#d32f2f', marginTop: '4px', display: 'block' }}>
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Password *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Minimum 6 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                disabled={isLoading}
                            />
                            <KeyRound size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                        </div>
                        {errors.password && (
                            <span style={{ fontSize: '0.78rem', color: '#d32f2f', marginTop: '4px', display: 'block' }}>
                                {errors.password}
                            </span>
                        )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Phone Number (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="+91 9486346234"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                disabled={isLoading}
                            />
                            <Phone size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Home Address (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="123 Main St,Madurai"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                disabled={isLoading}
                            />
                            <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-accent"
                        style={{ width: '100%', marginTop: '8px', padding: '12px' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => onNavigate('login')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-blue)',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default RegisterPage;
