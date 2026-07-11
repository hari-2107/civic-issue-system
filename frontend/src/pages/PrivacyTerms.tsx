import React from 'react';
import { ArrowLeft, Book } from 'lucide-react';

interface PrivacyTermsProps {
    type: 'privacy' | 'terms';
    onNavigate: (page: string) => void;
}

export const PrivacyTerms: React.FC<PrivacyTermsProps> = ({ type, onNavigate }) => {
    const isPrivacy = type === 'privacy';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '60px 20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <button
                    onClick={() => onNavigate('landing')}
                    className="btn btn-secondary btn-sm"
                    style={{ width: 'fit-content' }}
                >
                    <ArrowLeft size={14} /> Back to Home
                </button>

                <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Book size={24} style={{ color: 'var(--primary-blue)' }} />
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                            {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
                        </h2>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Effective January 1, 2026. Last Updated July 2026.
                    </p>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

                    {isPrivacy ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', lineHeight: '1.6', fontSize: '0.92rem' }}>
                            <p>
                                Municipal Solid Waste & Infrastructure Division operates the Civic-Resolve system to streamline regional repair tracking. This statement details how we collection and handles your coordination logs.
                            </p>
                            <h4>1. Contact Details Policy</h4>
                            <p>
                                When you sign up as a citizen, we collect your name, email, optional phone number, and optional home coordinates. Phone numbers are exclusively visible to authorized assigned department technicians targeting resolutions.
                            </p>
                            <h4>2. Spatial Coordinates</h4>
                            <p>
                                The mapping pins registered when filing an issue are stored publicly within the database search registry to display regional heatmaps, but are anonymized from direct citizen identity grids.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', lineHeight: '1.6', fontSize: '0.92rem' }}>
                            <p>
                                By enrolling as a portal user, you agree to comply with the terms set forth by the Municipal Coordination Authority.
                            </p>
                            <h4>1. Authentic Reporting</h4>
                            <p>
                                Fliers agree that all complaints submitted are truthful and record actual municipal damages. Abuse of the mapping pin module or posting spam attachments is subject to access restriction.
                            </p>
                            <h4>2. Feedback Accountability</h4>
                            <p>
                                All ratings and review comments posted are log entry public registry points and are audited to guarantee civil code of conduct.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default PrivacyTerms;
