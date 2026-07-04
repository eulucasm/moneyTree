import { Response } from 'express';

export const sendServerError = (res: Response, prefix: string, err: any) => {
  console.error(`${prefix}:`, err);
  const response: Record<string, any> = { error: 'Internal server error' };
  if (process.env.NODE_ENV !== 'production') {
    response.details = err.message || String(err);
  }
  return res.status(500).json(response);
};
