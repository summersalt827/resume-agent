import { Request, Response, NextFunction } from 'express';

export function validateFields(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = required.filter((f) => {
      const val = req.body[f];
      return val === undefined || val === null || val === '';
    });
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }
    next();
  };
}
