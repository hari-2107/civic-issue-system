"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintController = void 0;
const ComplaintService_js_1 = require("../service/ComplaintService.js");
class ComplaintController {
    complaintService = new ComplaintService_js_1.ComplaintService();
    create = async (req, res, next) => {
        try {
            const { title, description, category_id, priority, address, landmark, latitude, longitude, contact_number, imageUrls, state, district, taluk, revenue_division, firka, village_panchayat } = req.body;
            const citizen_id = req.user.id;
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
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    list = async (req, res, next) => {
        try {
            const { status, priority, category_id, search, startDate, endDate, limit, offset, sortBy, sortOrder } = req.query;
            const filters = {
                status: status,
                priority: priority,
                category_id: category_id ? parseInt(category_id) : undefined,
                search: search,
                startDate: startDate,
                endDate: endDate,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
                sortBy: sortBy,
                sortOrder: sortOrder
            };
            // Citizen role filters their own. Admin role retrieves all.
            const citizenId = req.user.role === 'CITIZEN' ? req.user.id : undefined;
            const result = await this.complaintService.getComplaints(filters, citizenId);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    };
    details = async (req, res, next) => {
        try {
            const complaintId = parseInt(req.params.id);
            const complaint = await this.complaintService.getComplaintDetails(complaintId);
            // Safety access check
            if (req.user.role === 'CITIZEN' && complaint.citizen_id !== req.user.id) {
                return res.status(403).json({ error: 'Access forbidden: You cannot view other citizen complaints' });
            }
            res.json(complaint);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
    updateStatus = async (req, res, next) => {
        try {
            const complaintId = parseInt(req.params.id);
            const { status, departmentId, priority } = req.body;
            const deptIdNum = departmentId ? parseInt(departmentId) : undefined;
            const result = await this.complaintService.adminUpdateStatus(complaintId, status, deptIdNum, priority);
            res.json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    delete = async (req, res, next) => {
        try {
            const complaintId = parseInt(req.params.id);
            if (req.user.role === 'ADMIN') {
                const success = await this.complaintService.adminDeleteComplaint(complaintId);
                res.json({ success, message: 'Complaint deleted by administrator' });
            }
            else {
                const success = await this.complaintService.citizenDeleteComplaint(complaintId, req.user.id);
                res.json({ success, message: 'Complaint deleted successfully' });
            }
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getCitizenStats = async (req, res, next) => {
        try {
            const stats = await this.complaintService.getCitizenDashboardStats(req.user.id);
            res.json(stats);
        }
        catch (err) {
            next(err);
        }
    };
    getAdminStats = async (req, res, next) => {
        try {
            const stats = await this.complaintService.getAdminDashboardStats();
            res.json(stats);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ComplaintController = ComplaintController;
