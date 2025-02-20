import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

 
interface AuthenticatedNextApiRequest extends NextApiRequest {
  user?: string | jwt.JwtPayload;
}

export function authenticateToken(
  req: AuthenticatedNextApiRequest,
  res: NextApiResponse,
  next: Function
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  console.log(token);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;   
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
