import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../db/database';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { currentPassword, newPassword, email } = req.body;

  if (!currentPassword || !newPassword || !email) {
    return res.status(400).json({ error: 'Current password, new password, and email are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const stmt = db.prepare('UPDATE users SET password = ? WHERE email = ?');
    stmt.run(hashedPassword, email);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ error: 'Failed to update password' });
  }
}