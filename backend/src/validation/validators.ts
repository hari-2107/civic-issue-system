import { Request, Response, NextFunction } from 'express';

export const validateBody = (rules: Record<string, { required: boolean; type?: string; minLength?: number }>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors: string[] = [];

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

export const validateEmail = (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address format' });
        }
    }
    next();
};
