"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = exports.validateBody = void 0;
const validateBody = (rules) => {
    return (req, res, next) => {
        const errors = [];
        for (const [key, rule] of Object.entries(rules)) {
            const val = req.body[key];
            if (rule.required && (val === undefined || val === null || val === '')) {
                errors.push(`Field '${key}' is required`);
                continue;
            }
            if (val !== undefined && val !== null) {
                if (rule.type && typeof val !== rule.type) {
                    errors.push(`Field '${key}' must be of type ${rule.type}`);
                }
                if (rule.minLength && typeof val === 'string' && val.length < rule.minLength) {
                    errors.push(`Field '${key}' must be at least ${rule.minLength} characters long`);
                }
            }
        }
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        next();
    };
};
exports.validateBody = validateBody;
const validateEmail = (req, res, next) => {
    const { email } = req.body;
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address format' });
        }
    }
    next();
};
exports.validateEmail = validateEmail;
