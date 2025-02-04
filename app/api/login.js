import db from '../db/database';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed'});
    }

    const {email, password} = req.body;

    // Find the user in the database
    const user = db.prepare(`SELECT * FROM users Where email = ?`).get(email);
    if (!user) {
        return res.status(400).json({ message: 'User not found.' });
    }

    // Comapare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password.' });
    }

    // Login successful
    res.status(200).json({ message: 'Login successful' });
}