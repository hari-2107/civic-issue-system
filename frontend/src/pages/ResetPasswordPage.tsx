import React, { useState } from 'react';
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';

interface ResetPasswordPageProps {
    onNavigate: (page: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        // Mock resetting email trigger action
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1500);
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
                    onClick={() => onNavigate('login')}
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
                    <ArrowLeft size={16} /> Back to Sign In
                </button>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                            <RefreshCw size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Reset Password</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            We'll email you instructions to restore access.
                        </p>
                    </div>

                    {isSubmitted ? (
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
                            <div style={{
                                padding: '12px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--primary-green-light)',
                                color: 'var(--primary-green)',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                border: '1px solid var(--primary-green)'
                            }}>
                                Recovery Link Dispatched!
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Please check <strong>{email}</strong> for instructions. Check your spam directory if the mail does not appear within 2 minutes.
                            </p>
                            <button
                                onClick={() => onNavigate('login')}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                Return to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Account Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="email@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
                                        required
                                        disabled={isLoading}
                                    />
                                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '8px', padding: '12px' }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Send Password recovery link'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ResetPasswordPage;
