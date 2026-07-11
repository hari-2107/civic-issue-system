import React, { useEffect, useState, useCallback } from 'react';
import { useNotifications } from '../context/NotificationContext.js';
import { getAdminStats, getComplaints } from '../services/complaintService.js';
import type { Complaint, AdminStats } from '../types/index';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { LineChart, DonutChart, DepartmentChart } from '../components/Charts.js';
import MapSelector from '../components/MapSelector.js';
import Table from '../components/Table.js';
import {
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    Eye,
    Search
} from 'lucide-react';

interface AdminDashboardProps {
    onNavigate: (page: string, params?: Record<string, any>) => void;
    onlyTable?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onlyTable = false }) => {
    const { showToast } = useNotifications();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Complaints filter states
    const [serverComplaints, setServerComplaints] = useState<Complaint[]>([]);
    const [totalComplaints, setTotalComplaints] = useState(0);
    const [tableLoading, setTableLoading] = useState(false);
    const [params, setParams] = useState({
        status: '',
        priority: '',
        category_id: '',
        search: '',
        limit: 10,
        offset: 0
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const statsData = await getAdminStats();
            setStats(statsData);
        } catch (err) {
            showToast('Failed to load admin dashboard summary statistics.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const loadComplaints = useCallback(async () => {
        try {
            setTableLoading(true);
            const res = await getComplaints({
                status: params.status || undefined,
                priority: params.priority || undefined,
                category_id: params.category_id ? Number(params.category_id) : undefined,
                search: params.search || undefined,
                limit: params.limit,
                offset: params.offset
            });
            setServerComplaints(res.data);
            setTotalComplaints(res.total);
        } catch (err) {
            showToast('Failed to retrieve complaints database logs.', 'error');
        } finally {
            setTableLoading(false);
        }
    }, [params, showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        loadComplaints();
    }, [loadComplaints]);

    const handlePageChange = (newOffset: number) => {
        setParams(prev => ({ ...prev, offset: newOffset }));
    };

    const handleFilterChange = (field: string, value: any) => {
        setParams(prev => ({ ...prev, [field]: value, offset: 0 }));
    };

    const tableColumns = [
        {
            header: 'ID',
            accessor: 'id',
            render: (val: any) => <strong>#CIV-{val}</strong>
        },
        {
            header: 'Title',
            accessor: 'title',
            render: (val: string, row: Complaint) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{val}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Category: {row.category_name}
                    </span>
                </div>
            )
        },
        {
            header: 'Citizen Info',
            accessor: 'citizen_name',
            render: (val: string, row: Complaint) => (
                <div>
                    <div style={{ fontSize: '0.85rem' }}>{val}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Phone: {row.contact_number || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: 'Location',
            accessor: 'district',
            render: (_val: string, row: Complaint) => (
                <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 605 }}>{row.district}, {row.state}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Taluk: {row.taluk}
                    </span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (val: string) => (
                <span className={`badge badge-${val.toLowerCase().replace(/\s+/g, '')}`}>
                    {val}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (val: number) => (
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onNavigate('complaint-detail', { id: val })}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <Eye size={12} /> Inspect
                </button>
            )
        }
    ];

    // Convert all complaints into Leaflet map markers
    const activeMarkers = serverComplaints
        .filter(c => c.latitude && c.longitude)
        .map(c => ({
            id: c.id,
            latitude: c.latitude!,
            longitude: c.longitude!,
            title: c.title,
            category: c.category_name || 'General',
            status: c.status
        }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Page Title */}
            <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                    {onlyTable ? "Manage Complaints Register" : "Administrative Control Panel"}
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    {onlyTable ? "Search, inspect, and update municipal reports database." : "Manage complaints, view statistics charts, and assign departments."}
                </p>
            </div>

            {loading ? (
                <div style={{ display: onlyTable ? 'flex' : 'grid', flexDirection: onlyTable ? 'column' : undefined, gridTemplateColumns: onlyTable ? undefined : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <LoadingSkeleton type={onlyTable ? 'text' : 'card'} count={onlyTable ? 6 : 4} />
                </div>
            ) : onlyTable ? (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Complaints Registry</h4>

                    {/* Filter inputs header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-control"
                                style={{ paddingLeft: '36px', height: '42px' }}
                                placeholder="Search user, title..."
                                value={params.search}
                                onChange={e => handleFilterChange('search', e.target.value)}
                            />
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                        </div>

                        <select
                            className="form-control"
                            style={{ height: '42px' }}
                            value={params.status}
                            onChange={e => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                            <option value="Rejected">Rejected</option>
                        </select>

                        <select
                            className="form-control"
                            style={{ height: '42px' }}
                            value={params.priority}
                            onChange={e => handleFilterChange('priority', e.target.value)}
                        >
                            <option value="">All Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>

                        <select
                            className="form-control"
                            style={{ height: '42px' }}
                            value={params.category_id}
                            onChange={e => handleFilterChange('category_id', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="1">Roads & Streets</option>
                            <option value="2">Drainage & Sewerage</option>
                            <option value="3">Street Lights</option>
                            <option value="4">Waste Management</option>
                            <option value="5">Water Supply</option>
                        </select>
                    </div>

                    {tableLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <LoadingSkeleton type="text" count={6} />
                        </div>
                    ) : (
                        <Table
                            title="Municipal Reports Register"
                            columns={tableColumns}
                            data={serverComplaints}
                            total={totalComplaints}
                            limit={params.limit}
                            offset={params.offset}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            ) : (
                <>
                    {/* Dashboard Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderLeft: '4px solid var(--primary-blue)' }}>
                            <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)' }}>
                                <FileText size={20} />
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total</span>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{stats?.cards.totalComplaints || 0}</h3>
                            </div>
                        </div>

                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderLeft: '4px solid var(--status-pending)' }}>
                            <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--status-pending)' }}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Inspections</span>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{stats?.cards.pending || 0}</h3>
                            </div>
                        </div>

                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderLeft: '4px solid var(--status-inprogress)' }}>
                            <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--status-inprogress)' }}>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>In Progress</span>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
                                    {(stats?.cards.assigned || 0) + (stats?.cards.inProgress || 0)}
                                </h3>
                            </div>
                        </div>

                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderLeft: '4px solid var(--status-resolved)' }}>
                            <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--primary-green-light)', color: 'var(--status-resolved)' }}>
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Resolved</span>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{stats?.cards.resolved || 0}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Main Visualizations layout (Charts and Maps) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                        {stats && (
                            <>
                                <LineChart
                                    title="Monthly Issues Pipeline"
                                    data={stats.charts.monthlyComplaints.map(i => ({ label: i.month, value: i.count }))}
                                />

                                <DonutChart
                                    title="Category Distribution Breakdown"
                                    data={stats.charts.categoryDistribution.map(c => ({ label: c.name, value: c.value }))}
                                />

                                <DepartmentChart
                                    data={stats.charts.departmentPerformance}
                                />
                            </>
                        )}

                        {/* Interactive map display */}
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '350px' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Regional Spatial Layout</h4>
                            {activeMarkers.length > 0 ? (
                                <MapSelector interactive={false} markers={activeMarkers} />
                            ) : (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                                    Awaiting complaints location pins...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table filters and list layout */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Complaints Registry</h4>

                        {/* Filter inputs header */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>

                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ paddingLeft: '36px', height: '42px' }}
                                    placeholder="Search user, title..."
                                    value={params.search}
                                    onChange={e => handleFilterChange('search', e.target.value)}
                                />
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                            </div>

                            <select
                                className="form-control"
                                style={{ height: '42px' }}
                                value={params.status}
                                onChange={e => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                                <option value="Rejected">Rejected</option>
                            </select>

                            <select
                                className="form-control"
                                style={{ height: '42px' }}
                                value={params.priority}
                                onChange={e => handleFilterChange('priority', e.target.value)}
                            >
                                <option value="">All Priorities</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>

                            <select
                                className="form-control"
                                style={{ height: '42px' }}
                                value={params.category_id}
                                onChange={e => handleFilterChange('category_id', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                <option value="1">Roads & Streets</option>
                                <option value="2">Drainage & Sewerage</option>
                                <option value="3">Street Lights</option>
                                <option value="4">Waste Management</option>
                                <option value="5">Water Supply</option>
                            </select>

                        </div>

                        {/* Render table loading skeleton or actual table registry */}
                        {tableLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <LoadingSkeleton type="text" count={6} />
                            </div>
                        ) : (
                            <Table
                                title="Municipal Reports Register"
                                columns={tableColumns}
                                data={serverComplaints}
                                total={totalComplaints}
                                limit={params.limit}
                                offset={params.offset}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
export default AdminDashboard;
