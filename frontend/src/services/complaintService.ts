import axios from 'axios';
import type { Complaint, Category, Department, CitizenStats, AdminStats } from '../types/index';

export interface ComplaintData {
    title: string;
    description: string;
    category_id: number;
    priority: string;
    address: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    contact_number?: string;
    state?: string;
    district?: string;
    taluk?: string;
    revenue_division?: string;
    firka?: string;
    village_panchayat?: string;
    imageUrls?: string[];
}

export const getCategories = async (): Promise<Category[]> => {
    const res = await axios.get('/categories');
    return res.data;
};

export const getDepartments = async (): Promise<Department[]> => {
    const res = await axios.get('/departments');
    return res.data;
};

export const createComplaint = async (data: ComplaintData): Promise<Complaint> => {
    const res = await axios.post('/complaints', data);
    return res.data;
};

export const getComplaints = async (filters: {
    status?: string;
    priority?: string;
    category_id?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
}): Promise<{ data: Complaint[]; total: number }> => {
    const res = await axios.get('/complaints', { params: filters });
    return res.data;
};

export const getComplaintById = async (id: number): Promise<Complaint> => {
    const res = await axios.get(`/complaints/${id}`);
    return res.data;
};

export const deleteComplaint = async (id: number): Promise<boolean> => {
    const res = await axios.delete(`/complaints/${id}`);
    return res.data.success;
};

export const adminUpdateStatus = async (
    id: number,
    status: string,
    departmentId?: number,
    priority?: string
): Promise<Complaint> => {
    const res = await axios.put(`/complaints/${id}/status`, {
        status,
        departmentId,
        priority
    });
    return res.data;
};

export const getCitizenStats = async (): Promise<CitizenStats> => {
    const res = await axios.get('/citizen/stats');
    return res.data;
};

export const getAdminStats = async (): Promise<AdminStats> => {
    const res = await axios.get('/admin/stats');
    return res.data;
};
