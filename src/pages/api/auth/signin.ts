import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Add your actual credential validation here
  // This is just an example - replace with your actual validation logic
  if (email === 'test@example.com' && password === 'password') {
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );
    return res.status(200).json({ token });
  }

  // If credentials are invalid, return error
  return res.status(401).json({ message: 'Invalid credentials' });
}