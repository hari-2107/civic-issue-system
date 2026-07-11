import React, { useState } from 'react';
import { ShieldCheck, MessageSquare, MapPin, Zap, ArrowRight, BookOpen, Star, HelpCircle, PhoneCall } from 'lucide-react';

interface LandingPageProps {
    onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [contactSuccess, setContactSuccess] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setContactSuccess(true);
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => setContactSuccess(false), 5000);
    };

    const faqs = [
        {
            q: "How do I report a civic issue?",
            a: "Simply sign up as a citizen, go to the 'Report Issue' menu, pin the location on the map, upload an optional image, fill in the details (category, description, contact), and submit. The municipal office will instantly receive it!"
        },
        {
            q: "Can I track the progress of my issue?",
            a: "Yes, you can track the status in real-time. Statuses go from Pending -> Approved -> Assigned (to a specific department) -> In Progress -> Resolved -> Closed."
        },
        {
            q: "What happens after my issue is resolved?",
            a: "You will receive a notification prompting you to review the resolution. You can rate the resolution from 1-5 stars and write feedback comments. If there are still unresolved issues, admins can reply or reopen it."
        },
        {
            q: "Is my personal data secure?",
            a: "Absolutely. All citizen accounts and passwords are encrypted with bcrypt, actions are authenticated via secure JWT tokens, and your contact numbers are only accessible to authorized department assignees."
        }
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
            {/* Navigation Header */}
            <header style={{
                height: 'var(--header-height)',
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 5%',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        backgroundColor: 'var(--primary-blue)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-blue)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>CIVIC-RESOLVE</h1>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--primary-green)', textTransform: 'uppercase', display: 'block', whiteSpace: 'nowrap' }}>Government Portal</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('login')}>Citizen Login</button>
                    <button className="btn btn-primary btn-sm" onClick={() => onNavigate('register')}>Register</button>
                </div>
            </header>

            {/* Hero Section */}
            <section style={{
                padding: '80px 5% 60px',
                background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--primary-blue-light) 100%)',
                textAlign: 'center',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
                    <span style={{
                        alignSelf: 'center',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--primary-green-light)',
                        color: 'var(--primary-green)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        border: '1px solid var(--primary-green)'
                    }}>
                        Smart Civic Administration
                    </span>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--primary-blue)', lineHeight: 1.2 }}>
                        Empowering Citizens. <span style={{ color: 'var(--primary-green)' }}>Resolving Issues.</span>
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                        Report road damages, drainage issues, street light failures, or illegal dumping instantly. We bridge the gap between citizens and local authorities for transparent, high-speed resolution.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '10px' }}>
                        <button className="btn btn-accent" onClick={() => onNavigate('register')}>
                            Report an Issue <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section style={{ padding: '40px 5%', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                        <h3 style={{ fontSize: '2.2rem', color: 'var(--primary-blue)', fontWeight: 800 }}>8,421</h3>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Issues Logged</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: '24px', borderTop: '4px solid var(--primary-green-medium)' }}>
                        <h3 style={{ fontSize: '2.2rem', color: 'var(--primary-green)', fontWeight: 800 }}>96.2%</h3>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Resolution Rate</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                        <h3 style={{ fontSize: '2.2rem', color: 'var(--primary-blue)', fontWeight: 800 }}>24 hrs</h3>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Average Assign Time</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                        <h3 style={{ fontSize: '2.2rem', color: 'var(--primary-green)', fontWeight: 800 }}>4.2 ★</h3>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>User Satisfaction</p>
                    </div>
                </div>
            </section>

            {/* Features Overview */}
            <section style={{ padding: '80px 5%', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-blue)' }}>Key Portal Features</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Everything you need for transparent civic repairs.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)' }}>
                            <MapPin size={22} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>Interactive Mapping</h4>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Pinpoint the exact location of civic issues with a click on Leaflet-powered maps.</p>
                        </div>
                    </div>

                    <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'var(--primary-green-light)', color: 'var(--primary-green)' }}>
                            <Zap size={22} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>Automatic Assigning</h4>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Admins route issues to correct departments (Public Works, Sanitation) within minutes.</p>
                        </div>
                    </div>

                    <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)' }}>
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>Progress Timelines</h4>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Citizens get real-time email-like dashboard changes for their reports.</p>
                        </div>
                    </div>

                    <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'var(--primary-green-light)', color: 'var(--primary-green)' }}>
                            <MessageSquare size={22} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>Feedback Ratings</h4>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Score resolving departments and keep quality metrics high for regional governance.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: '60px 5%', backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-blue)', marginBottom: '30px' }}>What Citizens Say</h3>
                    <div className="card" style={{ padding: '30px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '14px', color: '#f59e0b' }}>
                            <Star size={18} fill="#f59e0b" /><Star size={18} fill="#f59e0b" /><Star size={18} fill="#f59e0b" /><Star size={18} fill="#f59e0b" /><Star size={18} fill="#f59e0b" />
                        </div>
                        <p style={{ fontSize: '1.05rem', fontStyle: 'italic', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                            "Identified a massive water leakage in our society, uploaded the photo and pinned the coordinates. Within 2 hours, it was assigned, and by afternoon the water engineering department resolved it! Absolute 5-stars!"
                        </p>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Sarah, Ward 4 Resident</strong>
                    </div>
                </div>
            </section>

            {/* FAQs Accordion */}
            <section style={{ padding: '80px 5%', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-blue)', textAlign: 'center', marginBottom: '36px' }}>
                    Frequently Asked Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            <button
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                style={{
                                    width: '100%', padding: '18px 24px', background: 'none', border: 'none',
                                    textAlign: 'left', display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HelpCircle size={18} style={{ color: 'var(--primary-blue)' }} /> {faq.q}
                                </span>
                                <span>{openFaq === idx ? '−' : '+'}</span>
                            </button>
                            {openFaq === idx && (
                                <div style={{ padding: '0 24px 18px 24px', fontSize: '0.9rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section style={{ padding: '65px 5%', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-blue)', textAlign: 'center', marginBottom: '8px' }}>
                        Contact Desk
                    </h3>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.9rem' }}>
                        Got questions or technical issues? Leave a note.
                    </p>

                    <form onSubmit={handleContactSubmit} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        {contactSuccess && (
                            <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'var(--primary-green-light)', color: 'var(--primary-green)', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                Thank you! Your message was submitted successfully.
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text" className="form-control" required
                                value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email" className="form-control" required
                                value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Message Details</label>
                            <textarea
                                rows={4} className="form-control" required
                                value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                            <PhoneCall size={16} /> Send Message
                        </button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '30px 5%',
                backgroundColor: 'var(--bg-tertiary)',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontStyle: 'normal', color: 'var(--text-secondary)' }} onClick={() => onNavigate('privacy-policy')}>Privacy Policy</button>
                    <span>&middot;</span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontStyle: 'normal', color: 'var(--text-secondary)' }} onClick={() => onNavigate('terms')}>Terms & Conditions</button>
                </div>
                <p>&copy; {new Date().getFullYear()} Municipal Corporation. All Rights Reserved. Civic-Resolve Platform.</p>
            </footer>
        </div>
    );
};
export default LandingPage;
