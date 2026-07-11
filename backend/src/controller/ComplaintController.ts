import { Response, NextFunction } from 'express';
import { ComplaintService } from '../service/ComplaintService.js';
import { AuthenticatedRequest } from '../security/auth.js';

export class ComplaintController {
    private complaintService = new ComplaintService();

    create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { title, description, category_id, priority, address, landmark, latitude, longitude, contact_number, imageUrls,
                state, district, taluk, revenue_division, firka, village_panchayat } = req.body;
            const citizen_id = req.user!.id;

            if (!state || !district || !taluk || !revenue_division || !firka || !village_panchayat) {
                return res.status(400).json({ error: 'All administrative hierarchy parameters (State, District, Taluk, Revenue Division, Firka, and Village Panchayat) are mandatory.' });
            }

            const result = await this.complaintService.createComplaint({
                title,
                description,
                category_id: parseInt(category_id),
                priority,
                status: 'Pending',
                address,
                landmark,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
                citizen_id,
                contact_number,
                state,
                district,
                taluk,
                revenue_division,
                firka,
                village_panchayat
            }, imageUrls);

            res.status(201).json(result);
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    };

    list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { status, priority, category_id, search, startDate, endDate, limit, offset, sortBy, sortOrder } = req.query;

            const filters = {
                status: status as string,
                priority: priority as string,
                category_id: category_id ? parseInt(category_id as string) : undefined,
                search: search as string,
                startDate: startDate as string,
                endDate: endDate as string,
                limit: limit ? parseInt(limit as string) : undefined,
                offset: offset ? parseInt(offset as string) : undefined,
                sortBy: sortBy as string,
                sortOrder: sortOrder as 'ASC' | 'DESC'
            };

            // Citizen role filters their own. Admin role retrieves all.
            const citizenId = req.user!.role === 'CITIZEN' ? req.user!.id : undefined;
            const result = await this.complaintService.getComplaints(filters, citizenId);

            res.json(result);
        } catch (err) {
            next(err);
        }
    };

    details = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const complaintId = parseInt(req.params.id);
            const complaint = await this.complaintService.getComplaintDetails(complaintId);

            // Safety access check
            if (req.user!.role === 'CITIZEN' && complaint.citizen_id !== req.user!.id) {
                return res.status(403).json({ error: 'Access forbidden: You cannot view other citizen complaints' });
            }

            res.json(complaint);
        } catch (err) {
            res.status(404).json({ error: (err as Error).message });
        }
    };

    updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const complaintId = parseInt(req.params.id);
            const { status, departmentId, priority } = req.body;

            const deptIdNum = departmentId ? parseInt(departmentId) : undefined;
            const result = await this.complaintService.adminUpdateStatus(complaintId, status, deptIdNum, priority);

            res.json(result);
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    };

    delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const complaintId = parseInt(req.params.id);

            if (req.user!.role === 'ADMIN') {
                const success = await this.complaintService.adminDeleteComplaint(complaintId);
                res.json({ success, message: 'Complaint deleted by administrator' });
            } else {
                const success = await this.complaintService.citizenDeleteComplaint(complaintId, req.user!.id);
                res.json({ success, message: 'Complaint deleted successfully' });
            }
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    };

    getCitizenStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const stats = await this.complaintService.getCitizenDashboardStats(req.user!.id);
            res.json(stats);
        } catch (err) {
            next(err);
        }
    };

    getAdminStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const stats = await this.complaintService.getAdminDashboardStats();
            res.json(stats);
        } catch (err) {
            next(err);
        }
    };
}
