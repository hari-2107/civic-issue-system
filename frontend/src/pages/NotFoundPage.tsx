import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
    onNavigate: (page: string) => void;
}

export const NotFoundPage: React.FC<NotFoundProps> = ({ onNavigate }) => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary)',
            padding: '20px',
            textAlign: 'center'
        }}>
            <div className="card" style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                    color: 'var(--priority-critical)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                }}>
                    <ShieldAlert size={26} />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Page Not Found</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    The link you followed may be broken, or the page has been moved to another location.
                </p>
                <button className="btn btn-primary" onClick={() => onNavigate('landing')}>
                    <ArrowLeft size={16} /> Return to Home
                </button>
            </div>
        </div>
    );
};
export default NotFoundPage;
