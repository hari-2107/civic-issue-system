export interface User {
    id?: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    password?: string;
    role: 'CITIZEN' | 'ADMIN';
    profile_picture?: string;
    created_at?: string;
}

export interface Category {
    id?: number;
    name: string;
}

export interface Department {
    id?: number;
    name: string;
}

export interface Complaint {
    id?: number;
    title: string;
    description: string;
    category_id: number;
    department_id?: number;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Pending' | 'Approved' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected';
    address: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    citizen_id: number;
    contact_number?: string;
    state?: string;
    district?: string;
    taluk?: string;
    revenue_division?: string;
    firka?: string;
    village_panchayat?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Attachment {
    id?: number;
    complaint_id: number;
    file_url: string;
    created_at?: string;
}

export interface Notification {
    id?: number;
    user_id: number;
    title: string;
    message: string;
    is_read: number; // 0 or 1
    created_at?: string;
}

export interface Feedback {
    id?: number;
    complaint_id: number;
    citizen_id: number;
    rating: number; // 1-5
    comment?: string;
    admin_response?: string;
    created_at?: string;
}
