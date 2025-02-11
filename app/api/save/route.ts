import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../db/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, email, emailNotifications, pushNotifications } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const stmt = db.prepare('UPDATE users SET name = ?, emailNotifications = ?, pushNotifications = ? WHERE email = ?');
    stmt.run(name, emailNotifications, pushNotifications, email);

    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}