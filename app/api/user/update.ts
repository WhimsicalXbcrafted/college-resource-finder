import { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, emailNotifications, pushNotifications } = req.body

    try {
      const stmt = db.prepare(`UPDATE users SET name = ?, emailNotifications = ?, pushNotifications = ? WHERE email = ?`)
      stmt.run(name, emailNotifications, pushNotifications, email)

      res.status(200).json({ message: 'Profile updated successfully '})
    } catch (error) {
      console.error('Error updating profile:', error)
      res.status(500).json({ error: 'Failed to update profile '})
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}