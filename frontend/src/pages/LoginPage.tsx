import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { KeyRound, Mail, ShieldAlert, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
    onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
    const { login } = useAuth();
    const { showToast } = useNotifications();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; global?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const nextErrors: typeof errors = {};
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
            const user = await login(email, password);
            showToast(`Welcome back, ${user.name}!`, 'success');
            onNavigate('dashboard');
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Authentication failed. Please verify credentials.';
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
            <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
                            backgroundColor: 'var(--primary-blue-light)',
                            color: 'var(--primary-blue)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px'
                        }}>
                            <KeyRound size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Account Login</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Access citizen panels or administrative desks.
                        </p>
                    </div>

                    {errors.global && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--badge-rejected)',
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
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="citizen@test.com or admin@civic.gov"
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                            <button
                                type="button"
                                onClick={() => onNavigate('reset-password')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary-blue)',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
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

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px', padding: '12px' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        New to Civic-Resolve?{' '}
                        <button
                            type="button"
                            onClick={() => onNavigate('register')}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontWeight: 600
                            }}
                        >
                            Create an Account
                        </button>
                    </div>
                </form>


            </div>

        </div>
    );
};
export default LoginPage;
