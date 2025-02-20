 
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

 
interface User {
  id: number;
  name: string;
  email: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { name, email } = req.body;

    try {
      const result = await pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );
      const user: User = result.rows[0];
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error adding user' });
    }
  } else if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM users');
      const users: User[] = result.rows;
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
