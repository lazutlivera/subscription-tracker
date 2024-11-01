import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      res.status(200).json({ valid: true, decoded });
    } catch (error) {
      res.status(401).json({ valid: false, error: 'Invalid token' });
    }

  }
}
