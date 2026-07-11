"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintService = void 0;
const ComplaintRepository_js_1 = require("../repository/ComplaintRepository.js");
const NotificationRepository_js_1 = require("../repository/NotificationRepository.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ComplaintService {
    complaintRepository = new ComplaintRepository_js_1.ComplaintRepository();
    notificationRepository = new NotificationRepository_js_1.NotificationRepository();
    async createComplaint(complaint, imageUrls) {
        // Force default status
        complaint.status = 'Pending';
        const created = await this.complaintRepository.create(complaint);
        if (created.id && imageUrls && imageUrls.length > 0) {
            // Ensure uploads directory exists
            const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
            if (!fs_1.default.existsSync(uploadsDir)) {
                fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            }
            for (const url of imageUrls) {
                let attachmentUrl = url;
                // Match base64 pattern: data:image/png;base64,iVBORw0KGgoAAAANS...
                const matches = url.match(/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
                if (matches) {
                    const format = matches[1];
                    const base64Data = matches[2];
                    const extension = format === 'svg+xml' ? 'svg' : format;
                    const buffer = Buffer.from(base64Data, 'base64');
                    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
                    const filepath = path_1.default.join(uploadsDir, filename);
                    fs_1.default.writeFileSync(filepath, buffer);
                    attachmentUrl = `/uploads/${filename}`;
                }
                await this.complaintRepository.createAttachment(created.id, attachmentUrl);
            }
        }
        // Notify user
        if (created.id) {
            await this.notificationRepository.create({
                user_id: created.citizen_id,
                title: 'Complaint Submitted Successfully',
                message: `Your complaint "${created.title}" has been registered and is pending approval. (ID: #CIV-${created.id})`,
                is_read: 0
            });
        }
        return await this.complaintRepository.findById(created.id);
    }
    async getComplaints(filters, citizenId) {
        return await this.complaintRepository.queryComplaints(filters, citizenId);
    }
    async getComplaintDetails(id) {
        const complaint = await this.complaintRepository.findById(id);
        if (!complaint) {
            throw new Error('Complaint not found');
        }
        return complaint;
    }
    async adminUpdateStatus(id, status, departmentId, priority) {
        const complaint = await this.complaintRepository.findById(id);
        if (!complaint)
            throw new Error('Complaint not found');
        const updateData = { status };
        if (departmentId !== undefined)
            updateData.department_id = departmentId;
        if (priority !== undefined)
            updateData.priority = priority;
        const success = await this.complaintRepository.update(id, updateData);
        if (!success)
            throw new Error('Failed to update complaint or no changes made');
        // Custom notification message based on status change
        let msg = `Your complaint "${complaint.title}" status has changed to "${status}".`;
        if (status === 'Assigned' && departmentId) {
            msg = `Your complaint "${complaint.title}" has been assigned to the department.`;
        }
        else if (status === 'Resolved') {
            msg = `Your complaint "${complaint.title}" has been marked as Resolved. Please review and submit your feedback!`;
        }
        await this.notificationRepository.create({
            user_id: complaint.citizen_id,
            title: `Complaint Status: ${status}`,
            message: msg,
            is_read: 0
        });
        return await this.complaintRepository.findById(id);
    }
    async citizenDeleteComplaint(id, citizenId) {
        const complaint = await this.complaintRepository.findById(id);
        if (!complaint)
            throw new Error('Complaint not found');
        if (complaint.citizen_id !== citizenId) {
            throw new Error('You do not have permission to delete this complaint');
        }
        if (complaint.status !== 'Pending') {
            throw new Error('You can only delete complaints that are still in "Pending" status');
        }
        return await this.complaintRepository.delete(id);
    }
    async adminDeleteComplaint(id) {
        return await this.complaintRepository.delete(id);
    }
    async getCitizenDashboardStats(citizenId) {
        const counts = await this.complaintRepository.getComplaintsCountByStatus(citizenId);
        // Recent complaints
        const listRes = await this.complaintRepository.queryComplaints({ limit: 5, offset: 0 }, citizenId);
        return {
            statusCounts: counts,
            recentComplaints: listRes.data
        };
    }
    async getAdminDashboardStats() {
        const counts = await this.complaintRepository.getComplaintsCountByStatus();
        const monthlyComplaints = await this.complaintRepository.getMonthlyComplaints();
        const monthlyResolved = await this.complaintRepository.getResolvedComplaintsMonthly();
        const categoryDistribution = await this.complaintRepository.getCategoryShareDistribution();
        const userGrowth = await this.complaintRepository.getUserGrowthMonthly();
        const departmentPerformance = await this.complaintRepository.getDepartmentPerformance();
        const recentTimeline = await this.complaintRepository.getRecentTimeline(8);
        // Calculate total complaints, resolved, pending
        let totalComplaints = 0;
        Object.keys(counts).forEach(k => {
            totalComplaints += counts[k];
        });
        const pending = counts['Pending'] || 0;
        const assigned = counts['Assigned'] || 0;
        const inProgress = counts['In Progress'] || 0;
        const resolved = counts['Resolved'] || 0;
        const closed = counts['Closed'] || 0;
        const rejected = counts['Rejected'] || 0;
        return {
            cards: {
                totalComplaints,
                pending,
                assigned,
                inProgress,
                resolved,
                closed,
                rejected
            },
            charts: {
                monthlyComplaints,
                monthlyResolved,
                categoryDistribution,
                userGrowth,
                departmentPerformance
            },
            timeline: recentTimeline
        };
    }
}
exports.ComplaintService = ComplaintService;
