import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { Mail, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { getAllUsers, deleteUser } from '../services/userService';
import type { User } from '../types/index';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const UsersPage: React.FC = () => {
    const { showToast } = useNotifications();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            showToast('Failed to load user administration list.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await deleteUser(id);
            showToast('User has been deleted successfully.', 'success');
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to delete user.', 'error');
        }
    };

    const columns = [
        {
            header: 'ID',
            accessor: 'id',
            render: (val: number) => <strong>#USR-{val}</strong>
        },
        {
            header: 'Name',
            accessor: 'name',
            render: (val: string) => (
                <span style={{ fontWeight: 650 }}>{val}</span>
            )
        },
        {
            header: 'Email / Username',
            accessor: 'email',
            render: (val: string) => (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} style={{ color: 'var(--text-secondary)' }} /> {val}
                </div>
            )
        },
        {
            header: 'Phone',
            accessor: 'phone',
            render: (val: string) => val || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>
        },
        {
            header: 'Role',
            accessor: 'role',
            render: (val: string) => (
                <span className={`badge badge-${val === 'ADMIN' ? 'approved' : 'assigned'}`}>
                    {val}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (val: number, row: User) => (
                row.role !== 'ADMIN' ? (
                    <button
                        onClick={() => handleDeleteUser(val)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--priority-critical)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            transition: 'background-color 0.15s'
                        }}
                        title="Delete User"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--priority-critical-light)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Trash2 size={16} />
                    </button>
                ) : null
            )
        }
    ];

    if (loading) {
        return <LoadingSkeleton type="text" count={5} />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Title */}
            <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>User Administration</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Audit portal user profiles, roles, and status flags.</p>
            </div>

            <Table
                title="Registered Citizens & Admins Register"
                columns={columns}
                data={users}
            />
        </div>
    );
};
export default UsersPage;
