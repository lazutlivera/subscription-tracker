import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { supabase } from '@/utils/supabase';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    try {
      // Check if the user already exists
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const result = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, hashedPassword]
      );

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (!data.user) {
        return res.status(400).json({ message: 'Failed to create user' });
      }

      res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
