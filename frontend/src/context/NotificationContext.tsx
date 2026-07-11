import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { Notification } from '../types/index';
import { useAuth } from './AuthContext';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    toasts: Toast[];
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllRead: () => Promise<void>;
    showToast: (message: string, type?: Toast['type']) => void;
    removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-remove toast after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, [isAuthenticated]);

    const markAsRead = async (id: number) => {
        try {
            await axios.post(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
            );
            showToast('Notification marked as read', 'success');
        } catch (err) {
            showToast('Failed to update notification', 'error');
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            showToast('All notifications marked as read', 'success');
        } catch (err) {
            showToast('Failed to update notifications', 'error');
        }
    };

    // Poll for notifications every 10 seconds if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
        }
    }, [isAuthenticated, fetchNotifications]);

    const unreadCount = notifications.filter(n => n.is_read === 0).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                toasts,
                fetchNotifications,
                markAsRead,
                markAllRead,
                showToast,
                removeToast
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};
