import axios from 'axios';
import type { User } from '../types/index';

export const getAllUsers = async (): Promise<User[]> => {
    const res = await axios.get('/admin/users');
    return res.data;
};

export const deleteUser = async (id: number): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`/admin/users/${id}`);
    return res.data;
};
