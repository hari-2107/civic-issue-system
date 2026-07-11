export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role: 'CITIZEN' | 'ADMIN';
    profile_picture?: string;
    created_at?: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface Department {
    id: number;
    name: string;
}

export interface Attachment {
    id: number;
    complaint_id: number;
    file_url: string;
    created_at?: string;
}

export interface Complaint {
    id: number;
    title: string;
    description: string;
    category_id: number;
    category_name?: string;
    department_id?: number;
    department_name?: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Pending' | 'Approved' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected';
    address: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    citizen_id: number;
    citizen_name?: string;
    citizen_email?: string;
    contact_number?: string;
    state?: string;
    district?: string;
    taluk?: string;
    revenue_division?: string;
    firka?: string;
    village_panchayat?: string;
    created_at: string;
    updated_at: string;
    attachments?: Attachment[];
}

export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    is_read: number;
    created_at: string;
}

export interface Feedback {
    id: number;
    complaint_id: number;
    complaint_title?: string;
    category_name?: string;
    citizen_id: number;
    citizen_name?: string;
    rating: number; // 1-5
    comment?: string;
    admin_response?: string;
    created_at: string;
}

export interface CitizenStats {
    statusCounts: Record<string, number>;
    recentComplaints: Complaint[];
}

export interface AdminStats {
    cards: {
        totalComplaints: number;
        pending: number;
        assigned: number;
        inProgress: number;
        resolved: number;
        closed: number;
        rejected: number;
    };
    charts: {
        monthlyComplaints: Array<{ month: string; count: number }>;
        monthlyResolved: Array<{ month: string; count: number }>;
        categoryDistribution: Array<{ name: string; value: number }>;
        userGrowth: Array<{ month: string; count: number }>;
        departmentPerformance: Array<{ departmentName: string; totalAssigned: number; resolvedCount: number }>;
    };
    timeline: Array<{
        id: number;
        title: string;
        status: string;
        created_at: string;
        citizen_name: string;
    }>;
}
