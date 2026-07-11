import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import {
    LayoutDashboard,
    PenSquare,
    ListTodo,
    Users,
    MessageSquare,
    Bell,
    User,
    LogOut,
    Sun,
    Moon,
    Menu,
    ShieldAlert
} from 'lucide-react';

interface MainLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, setActiveTab }) => {
    const { user, logout, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleNavClick = (tabId: string) => {
        setActiveTab(tabId);
        setSidebarOpen(false);
    };

    const ctzNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'file-complaint', label: 'Report Issue', icon: <PenSquare size={18} /> },
        { id: 'complaints', label: 'My Complaints', icon: <ListTodo size={18} /> },
        { id: 'profile', label: 'My Profile', icon: <User size={18} /> }
    ];

    const adminNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'complaints', label: 'Manage Complaints', icon: <ListTodo size={18} /> },
        { id: 'users', label: 'Manage Users', icon: <Users size={18} /> },
        { id: 'feedback', label: 'User Feedback', icon: <MessageSquare size={18} /> },
        { id: 'profile', label: 'Admin Profile', icon: <User size={18} /> }
    ];

    const navItems = isAdmin ? adminNavItems : ctzNavItems;

    return (
        <div className="main-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Top Navbar */}
            <header
                style={{
                    height: 'var(--header-height)',
                    backgroundColor: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 24px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={toggleSidebar}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'block'
                        }}
                        className="lg-hide-menu" // we will handle responsive class hides in css if needed, but styling inline first
                    >
                        <Menu size={22} className="menu-icon-hamburger" />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--primary-blue)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}
                        >
                            <ShieldAlert size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--primary-blue)', whiteSpace: 'nowrap' }}>
                                CIVIC-RESOLVE
                            </h1>
                            <span style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-green)', display: 'block', whiteSpace: 'nowrap' }}>
                                Government Portal
                            </span>
                        </div>
                    </div>
                </div>

                {/* Global Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Theme Shift */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '50%'
                        }}
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Notifications Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => {
                                setNotifDropdownOpen(!notifDropdownOpen);
                                setProfileDropdownOpen(false);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '6px',
                                position: 'relative'
                            }}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: '2px',
                                        right: '2px',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--priority-critical)',
                                        color: 'white',
                                        fontSize: '0.65rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {notifDropdownOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    width: '320px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '10px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    zIndex: 1001,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxHeight: '400px',
                                    marginTop: '10px'
                                }}
                            >
                                <div
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid var(--border-color)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <strong style={{ fontSize: '0.9rem' }}>Notifications ({unreadCount})</strong>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--primary-blue)',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                <div style={{ overflowY: 'auto', flex: 1 }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            No new alerts.
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div
                                                key={n.id}
                                                onClick={() => {
                                                    if (n.is_read === 0) markAsRead(n.id);
                                                }}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderBottom: '1px solid var(--border-color)',
                                                    cursor: 'pointer',
                                                    backgroundColor: n.is_read === 0 ? 'var(--primary-blue-light)' : 'transparent',
                                                    transition: 'background-color 0.15s ease'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.85rem', fontWeight: n.is_read === 0 ? 'bold' : 'normal', marginBottom: '2px', color: 'var(--text-primary)' }}>
                                                    {n.title}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {n.message}
                                                </div>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                                    {new Date(n.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => {
                                setProfileDropdownOpen(!profileDropdownOpen);
                                setNotifDropdownOpen(false);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <div
                                style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--primary-blue-light)',
                                    color: 'var(--primary-blue)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                {user?.name ? user.name[0].toUpperCase() : 'U'}
                            </div>
                            <div style={{ textAlign: 'left', display: 'none' }} className="lg-show-block">
                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.name}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{user?.role}</div>
                            </div>
                        </button>

                        {profileDropdownOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    width: '180px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                                    zIndex: 1001,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    marginTop: '10px',
                                    overflow: 'hidden'
                                }}
                            >
                                <button
                                    onClick={() => {
                                        handleNavClick('profile');
                                        setProfileDropdownOpen(false);
                                    }}
                                    style={{
                                        padding: '10px 16px',
                                        background: 'none',
                                        border: 'none',
                                        textAlign: 'left',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <User size={16} /> My Account
                                </button>
                                <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />
                                <button
                                    onClick={logout}
                                    style={{
                                        padding: '10px 16px',
                                        background: 'none',
                                        border: 'none',
                                        textAlign: 'left',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: 'var(--priority-critical)'
                                    }}
                                >
                                    <LogOut size={16} /> Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Layout Area */}
            <div className="content-container" style={{ display: 'flex', flex: 1, position: 'relative' }}>

                {/* Navigation Sidebar */}
                <aside
                    className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}
                    style={{
                        width: 'var(--sidebar-width)',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRight: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        zIndex: 900,
                        transition: 'transform var(--transition-normal)'
                    }}
                >
                    {/* Main Navigator List */}
                    <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === item.id ? 'var(--primary-blue)' : 'transparent',
                                    color: activeTab === item.id ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    textAlign: 'left',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Quick Footer inside Sidebar */}
                    <div
                        style={{
                            padding: '20px',
                            borderTop: '1px solid var(--border-color)',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}
                    >
                        <div>Portal Version 1.0</div>
                        <div>&copy; Civic Resolve Office</div>
                    </div>
                </aside>

                {/* Dynamic page container */}
                <main className={`main-content with-sidebar`} style={{ flex: 1, padding: '30px' }}>
                    {children}
                </main>
            </div>

            {/* Mobile drawer overlays */}
            {sidebarOpen && (
                <div
                    onClick={toggleSidebar}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        zIndex: 890
                    }}
                    className="drawer-overlay"
                />
            )}

            {/* Styled JSX Styles specifically to support responsiveness without heavy CSS rules */}
            <style>{`
        @media(max-width: 1023px) {
          .app-sidebar {
            transform: translateX(-100%);
          }
          .app-sidebar.open {
            transform: translateX(0);
          }
          .main-content.with-sidebar {
            margin-left: 0;
            padding: 20px;
          }
          .lg-show-block {
            display: none !important;
          }
          .lg-hide-menu {
            display: block !important;
          }
        }
        @media(min-width: 1024px) {
          .app-sidebar {
            transform: translateX(0) !important;
          }
          .lg-hide-menu {
            display: none !important;
          }
          .lg-show-block {
            display: block !important;
          }
        }
      `}</style>
        </div>
    );
};
export default MainLayout;
